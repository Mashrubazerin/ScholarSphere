/**
 * Scholarship recommendation engine.
 *
 * Deliberately dependency-free (no Prisma, no Next.js, no other module in
 * this codebase) so it can be reused anywhere that can produce a
 * `ScholarshipCandidate[]` — the real database via a repository, the mock
 * dataset Nova's chat uses, a test fixture, etc. Callers adapt their own
 * data into the shapes below; this module only does the scoring/ranking.
 */

export type DegreeLevel = "BACHELORS" | "MASTERS" | "PHD";
export type FundingType = "FULLY_FUNDED" | "PARTIAL_FUNDING" | "TUITION_WAIVER";

/**
 * "I cannot afford to pay out of pocket" is a hard constraint, not a soft
 * preference — so unlike the five scored factors below, this filters the
 * candidate pool rather than contributing to the weighted score (the spec's
 * five weights already sum to 100% without it).
 */
export type BudgetPreference = "fully-funded-only" | "open-to-partial-funding";

export interface RecommendationInput {
  /** 4.0 scale, matching this app's CGPA convention throughout. */
  cgpa?: number;
  ielts?: number;
  countryPreference?: string;
  degreeLevel?: DegreeLevel;
  fieldOfStudy?: string;
  budgetPreference?: BudgetPreference;
}

/** The minimal shape the engine needs — independent of any specific data source. */
export interface ScholarshipCandidate {
  id: string;
  name: string;
  country: string;
  fundingType: FundingType;
  fundingAmount: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  /** Minimum CGPA required, 4.0 scale. */
  cgpaRequirement: number;
  /** Minimum IELTS required, or null if the scholarship has no IELTS requirement. */
  ieltsRequirement: number | null;
  applicationDeadline: Date;
}

export interface ScholarshipRecommendation {
  id: string;
  name: string;
  matchPercentage: number;
  funding: string;
  deadline: Date;
  reasons: string[];
}

export interface RecommendationOptions {
  /** Max number of results to return. Default 5. */
  limit?: number;
  /** Drop results scoring below this percentage. Default 0 (no floor). */
  minMatchPercentage?: number;
}

/** Must sum to 100 — this is the literal spec, not a tunable default. */
const WEIGHTS = {
  cgpa: 40,
  ielts: 20,
  country: 15,
  field: 15,
  degree: 10,
} as const;

const DEGREE_LABEL: Record<DegreeLevel, string> = {
  BACHELORS: "Bachelor's",
  MASTERS: "Master's",
  PHD: "PhD",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** Below the requirement loses 100 points per full 1.0 CGPA gap (4.0 scale) — meeting or exceeding it is a full match. */
function scoreCgpa(userCgpa: number | undefined, requirement: number): number | null {
  if (userCgpa === undefined) return null;
  if (userCgpa >= requirement) return 100;
  return clamp(100 - (requirement - userCgpa) * 100, 0, 100);
}

/** Same idea as CGPA, but IELTS gaps live on a 0-9 scale, so a gap costs half as many points. No requirement = automatically satisfied. */
function scoreIelts(userIelts: number | undefined, requirement: number | null): number | null {
  if (requirement === null) return 100;
  if (userIelts === undefined) return null;
  if (userIelts >= requirement) return 100;
  return clamp(100 - (requirement - userIelts) * 50, 0, 100);
}

function scoreCountry(preference: string | undefined, scholarshipCountry: string): number | null {
  if (!preference) return null;
  return normalize(preference) === normalize(scholarshipCountry) ? 100 : 0;
}

/** Allows substring matches both ways (e.g. preference "AI" against field "Artificial Intelligence" is handled by the caller's own alias resolution before this is ever called — this is just an exact/contains check). */
function scoreField(preference: string | undefined, scholarshipField: string): number | null {
  if (!preference) return null;
  const a = normalize(preference);
  const b = normalize(scholarshipField);
  return a === b || a.includes(b) || b.includes(a) ? 100 : 0;
}

function scoreDegree(preference: DegreeLevel | undefined, scholarshipDegree: DegreeLevel): number | null {
  if (!preference) return null;
  return preference === scholarshipDegree ? 100 : 0;
}

interface ScoreBreakdown {
  cgpa: number | null;
  ielts: number | null;
  country: number | null;
  field: number | null;
  degree: number | null;
}

/**
 * Weighted average over whichever factors the caller actually supplied.
 * Missing inputs are excluded and the remaining weights are renormalized
 * (not just zero-filled), so e.g. CGPA-only input still scores purely on
 * CGPA (weight 40/40 = 100%) rather than being capped at 40%.
 */
function computeMatchPercentage(breakdown: ScoreBreakdown): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const key of Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>) {
    const score = breakdown[key];
    if (score === null) continue;
    weightedSum += score * WEIGHTS[key];
    totalWeight += WEIGHTS[key];
  }

  return totalWeight === 0 ? 0 : Math.round(weightedSum / totalWeight);
}

function buildReasons(input: RecommendationInput, candidate: ScholarshipCandidate, breakdown: ScoreBreakdown): string[] {
  const reasons: string[] = [];

  if (breakdown.cgpa !== null) {
    reasons.push(
      input.cgpa! >= candidate.cgpaRequirement
        ? `Your CGPA of ${input.cgpa} meets the ${candidate.cgpaRequirement.toFixed(1)} requirement.`
        : `Your CGPA of ${input.cgpa} is below the ${candidate.cgpaRequirement.toFixed(1)} requirement.`,
    );
  }
  if (breakdown.ielts !== null) {
    if (candidate.ieltsRequirement === null) {
      reasons.push("No IELTS score is required for this scholarship.");
    } else {
      reasons.push(
        input.ielts! >= candidate.ieltsRequirement
          ? `Your IELTS score of ${input.ielts} meets the ${candidate.ieltsRequirement.toFixed(1)} requirement.`
          : `Your IELTS score of ${input.ielts} is below the ${candidate.ieltsRequirement.toFixed(1)} requirement.`,
      );
    }
  }
  if (breakdown.country !== null) {
    reasons.push(
      breakdown.country === 100
        ? `Offered in your preferred country, ${candidate.country}.`
        : `Located in ${candidate.country}, not your preferred ${input.countryPreference}.`,
    );
  }
  if (breakdown.field !== null) {
    reasons.push(
      breakdown.field === 100
        ? `Matches your field of study: ${candidate.fieldOfStudy}.`
        : `Field of study is ${candidate.fieldOfStudy}, different from your preferred ${input.fieldOfStudy}.`,
    );
  }
  if (breakdown.degree !== null) {
    reasons.push(
      breakdown.degree === 100
        ? `Matches your preferred degree level: ${DEGREE_LABEL[candidate.degreeLevel]}.`
        : `This is a ${DEGREE_LABEL[candidate.degreeLevel]} program, not your preferred ${DEGREE_LABEL[input.degreeLevel!]}.`,
    );
  }
  if (input.budgetPreference === "fully-funded-only" && candidate.fundingType === "FULLY_FUNDED") {
    reasons.push("Fully funded, matching your budget preference.");
  }

  return reasons;
}

/**
 * Scores and ranks `candidates` against `input` using the weighted algorithm
 * (CGPA 40%, IELTS 20%, country 15%, field 15%, degree 10%). Pure and
 * synchronous — no I/O, no side effects, safe to call from anywhere.
 */
export function recommendScholarships(
  input: RecommendationInput,
  candidates: ScholarshipCandidate[],
  options: RecommendationOptions = {},
): ScholarshipRecommendation[] {
  const { limit = 5, minMatchPercentage = 0 } = options;

  const eligible =
    input.budgetPreference === "fully-funded-only"
      ? candidates.filter((c) => c.fundingType === "FULLY_FUNDED")
      : candidates;

  return eligible
    .map((candidate) => {
      const breakdown: ScoreBreakdown = {
        cgpa: scoreCgpa(input.cgpa, candidate.cgpaRequirement),
        ielts: scoreIelts(input.ielts, candidate.ieltsRequirement),
        country: scoreCountry(input.countryPreference, candidate.country),
        field: scoreField(input.fieldOfStudy, candidate.fieldOfStudy),
        degree: scoreDegree(input.degreeLevel, candidate.degreeLevel),
      };

      return {
        id: candidate.id,
        name: candidate.name,
        matchPercentage: computeMatchPercentage(breakdown),
        funding: candidate.fundingAmount,
        deadline: candidate.applicationDeadline,
        reasons: buildReasons(input, candidate, breakdown),
      };
    })
    .filter((result) => result.matchPercentage >= minMatchPercentage)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, limit);
}
