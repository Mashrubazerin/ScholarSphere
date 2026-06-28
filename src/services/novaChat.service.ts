import type { ScholarshipWithRelations } from "@/repositories/scholarship.repository";
import { findAllScholarshipsForMatching } from "@/repositories/scholarship.repository";
import { recommendScholarships, type RecommendationInput } from "@/services/recommendationEngine";
import { answerGeneralQuestion, extractIntent, type NovaIntentExtraction } from "@/services/novaIntent.service";
import { toScholarshipCandidate } from "@/services/scholarshipCandidateAdapter";

export interface NovaScholarshipResult {
  id: string;
  name: string;
  country: string;
  university: string;
  degreeLevel: "BACHELORS" | "MASTERS" | "PHD";
  matchPercentage: number;
  funding: string;
  /** ISO 8601 */
  deadline: string;
  reasons: string[];
  cgpaRequirement: number;
  ieltsRequirement: number | null;
}

export interface NovaChatReply {
  message: string;
  scholarships?: NovaScholarshipResult[];
  suggestedFollowUps: string[];
}

const DEGREE_LABEL: Record<"BACHELORS" | "MASTERS" | "PHD", string> = {
  BACHELORS: "Bachelor's",
  MASTERS: "Master's",
  PHD: "PhD",
};

const RESULT_LIMIT = 5;

/** The 3 chips `useNovaChat` recognizes and handles client-side (instant re-sort/reformat, no extra request). */
const STANDARD_FOLLOW_UPS = ["Rank by deadline", "Rank by funding amount", "Check eligibility requirements"];

const MAX_FOLLOW_UPS = 4;

function hasMatchCriteria(extraction: NovaIntentExtraction): boolean {
  return (
    extraction.cgpa !== null ||
    extraction.ielts !== null ||
    extraction.country !== null ||
    extraction.degree !== null ||
    extraction.field !== null
  );
}

function summarizeExtraction(extraction: NovaIntentExtraction): string {
  const descriptors: string[] = [];
  if (extraction.field) descriptors.push(extraction.field);
  if (extraction.degree) descriptors.push(`${DEGREE_LABEL[extraction.degree]}-level`);

  const summary = descriptors.length ? `${descriptors.join(" ")} scholarships` : "scholarships";
  return extraction.country ? `${summary} in ${extraction.country}` : summary;
}

/** Deterministic and free (no extra Gemini call) — prioritizes asking for whatever criteria is still missing, then the standard rank/eligibility actions. */
function buildSuggestedFollowUps(extraction: NovaIntentExtraction, hasResults: boolean): string[] {
  if (extraction.intent === "general_question") {
    return ["Find scholarships that match my profile", "What documents do I usually need to apply?"];
  }

  if (!hasResults) {
    return ["Try a different country", "Try a different field of study", "Lower the CGPA you're matching against"];
  }

  const refinements: string[] = [];
  if (!extraction.country) refinements.push("Filter by a specific country");
  if (!extraction.degree) refinements.push("Filter by degree level");
  if (extraction.cgpa === null) refinements.push("Add your CGPA for a more personalized match");

  return [...refinements, ...STANDARD_FOLLOW_UPS].slice(0, MAX_FOLLOW_UPS);
}

function toResult(
  id: string,
  matchPercentage: number,
  funding: string,
  deadline: Date,
  reasons: string[],
  original: ScholarshipWithRelations,
): NovaScholarshipResult {
  return {
    id,
    name: original.name,
    country: original.country.name,
    university: original.university.name,
    degreeLevel: original.degreeLevel,
    matchPercentage,
    funding,
    deadline: deadline.toISOString(),
    reasons,
    cgpaRequirement: original.cgpaRequirement,
    ieltsRequirement: original.ieltsRequirement,
  };
}

/** No stated criteria to match against — surface currently-open, well-funded options instead of a meaningless all-0% list. */
function genericRank(scholarships: ScholarshipWithRelations[]): NovaScholarshipResult[] {
  const now = Date.now();
  return [...scholarships]
    .sort((a, b) => {
      const aFunded = a.fundingType === "FULLY_FUNDED" ? 1 : 0;
      const bFunded = b.fundingType === "FULLY_FUNDED" ? 1 : 0;
      if (aFunded !== bFunded) return bFunded - aFunded;
      return a.applicationDeadline.getTime() - b.applicationDeadline.getTime();
    })
    .slice(0, RESULT_LIMIT)
    .map((s) => {
      const daysUntilDeadline = Math.max(0, (s.applicationDeadline.getTime() - now) / 86_400_000);
      const score = Math.max(60, Math.min(95, Math.round(78 + (s.fundingType === "FULLY_FUNDED" ? 8 : 0) - Math.min(daysUntilDeadline / 30, 10))));
      const reasons = [
        s.fundingType === "FULLY_FUNDED" ? "Fully funded opportunity." : "Currently accepting applications.",
      ];
      return toResult(s.id, score, s.fundingAmount, s.applicationDeadline, reasons, s);
    });
}

/** Exported on its own — useful to call/test directly when the criteria are already known (skipping the Gemini extraction step). */
export async function searchScholarships(extraction: NovaIntentExtraction): Promise<NovaChatReply> {
  const scholarships = await findAllScholarshipsForMatching();

  if (!hasMatchCriteria(extraction)) {
    const results = genericRank(scholarships);
    return {
      message:
        "I don't have specific criteria to match yet, so here are some popular, currently open scholarships. Tell me your CGPA, IELTS score, target country, degree level, or field of study for a personalized match.",
      scholarships: results,
      suggestedFollowUps: buildSuggestedFollowUps(extraction, results.length > 0),
    };
  }

  const candidates = scholarships.map(toScholarshipCandidate);
  const input: RecommendationInput = {
    cgpa: extraction.cgpa ?? undefined,
    ielts: extraction.ielts ?? undefined,
    countryPreference: extraction.country ?? undefined,
    degreeLevel: extraction.degree ?? undefined,
    fieldOfStudy: extraction.field ?? undefined,
  };

  const recommendations = recommendScholarships(input, candidates, { limit: RESULT_LIMIT });
  const byId = new Map(scholarships.map((s) => [s.id, s]));

  const results = recommendations.map((r) => toResult(r.id, r.matchPercentage, r.funding, r.deadline, r.reasons, byId.get(r.id)!));

  const summary = summarizeExtraction(extraction);
  const message = results.length
    ? `I found ${results.length} matching ${summary}. Here are the best matches:`
    : `I couldn't find a match for ${summary} right now — try a different country, field, or degree level.`;

  return { message, scholarships: results, suggestedFollowUps: buildSuggestedFollowUps(extraction, results.length > 0) };
}

/**
 * Single entry point for Nova's chat: classifies the message via Gemini,
 * then either answers it directly (general questions) or matches it against
 * the real database via the recommendation engine (scholarship searches).
 * Every scholarship fact returned comes from the database — Gemini is only
 * ever used for language understanding and free-text explanation, never as
 * a source of scholarship data.
 */
export async function getNovaChatReply(message: string): Promise<NovaChatReply> {
  const extraction = await extractIntent(message);

  if (extraction.intent === "general_question") {
    const answer = await answerGeneralQuestion(message);
    return { message: answer, suggestedFollowUps: buildSuggestedFollowUps(extraction, false) };
  }

  return searchScholarships(extraction);
}
