/**
 * Prisma seed script — run with `npm run db:seed`.
 *
 * Generates 8 countries, 5 universities each (40 total), and 150
 * scholarships spread evenly across those universities.
 *
 * Deterministic on purpose: a seeded PRNG (not `Math.random`) drives every
 * "random" choice below, so re-running the seed always produces the exact
 * same dataset — useful for diffing, demos, and tests.
 */
// Unlike `next dev`, a standalone `tsx` run doesn't auto-load .env — load it
// before anything (e.g. lib/env.ts) reads process.env.
import "dotenv/config";

import { CurrentScholarshipStatus, DegreeLevel, FundingType } from "@/generated/prisma/client";
import { db } from "@/lib/db";

// ============================================================
// Deterministic RNG
// ============================================================

/** mulberry32 — tiny, fast, seedable PRNG. Same seed -> same sequence forever. */
function createRng(seed: number) {
  let state = seed;
  return function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRng(20260627);

function randomInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  const value = rng() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

/** Weighted pick — `weights` must be the same length as `items` and sum to 100. */
function pickWeighted<T>(items: readonly T[], weights: readonly number[]): T {
  const roll = rng() * 100;
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (roll <= cumulative) return items[i];
  }
  return items[items.length - 1];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// ============================================================
// Reference data
// ============================================================

interface CountrySeed {
  name: string;
  code: string;
  /** Real flagship national scholarship, attached once to that country's lead university. */
  flagshipScholarship: string;
  currency: {
    symbol: string;
    /** Realistic yearly stipend/funding range in local currency. */
    yearlyRange: [number, number];
    /** Realistic monthly stipend range, for "/month" style awards. */
    monthlyRange: [number, number];
  };
  universities: string[];
  /** Primary language(s) spoken. */
  language: string;
  /** Illustrative estimated cost of living for an international student — not from a verified source. */
  livingCost: string;
  /** Real visa category name; the rest of the description is a general overview, not legal advice. */
  visaInfo: string;
}

const COUNTRIES: CountrySeed[] = [
  {
    name: "Japan",
    code: "JP",
    flagshipScholarship: "MEXT Scholarship",
    currency: { symbol: "¥", yearlyRange: [600_000, 1_000_000], monthlyRange: [120_000, 200_000] },
    universities: ["University of Tokyo", "Kyoto University", "Osaka University", "Tohoku University", "Nagoya University"],
    language: "Japanese",
    livingCost: "$700 - $1,200/month",
    visaInfo: "A Student Visa (Ryugaku) is required, sponsored by your university via a Certificate of Eligibility (COE).",
  },
  {
    name: "Germany",
    code: "DE",
    flagshipScholarship: "DAAD Scholarship",
    currency: { symbol: "€", yearlyRange: [9_000, 16_000], monthlyRange: [850, 1_300] },
    universities: [
      "Technical University of Munich",
      "Heidelberg University",
      "Humboldt University of Berlin",
      "RWTH Aachen University",
      "University of Freiburg",
    ],
    language: "German",
    livingCost: "€850 - €1,200/month",
    visaInfo: "EU/EEA citizens need no visa; other students require a German Student Visa and proof of funds via a blocked account (Sperrkonto).",
  },
  {
    name: "USA",
    code: "US",
    flagshipScholarship: "Fulbright Foreign Student Program",
    currency: { symbol: "$", yearlyRange: [25_000, 48_000], monthlyRange: [2_000, 3_800] },
    universities: [
      "Massachusetts Institute of Technology",
      "Stanford University",
      "Harvard University",
      "University of California, Berkeley",
      "Cornell University",
    ],
    language: "English",
    livingCost: "$1,200 - $2,500/month",
    visaInfo: "An F-1 Student Visa is required, sponsored by your institution via Form I-20 and the SEVIS fee.",
  },
  {
    name: "Canada",
    code: "CA",
    flagshipScholarship: "Vanier Canada Graduate Scholarship",
    currency: { symbol: "CAD $", yearlyRange: [20_000, 50_000], monthlyRange: [1_600, 4_000] },
    universities: ["University of Toronto", "University of British Columbia", "McGill University", "University of Waterloo", "McMaster University"],
    language: "English, French",
    livingCost: "CAD $1,200 - $2,000/month",
    visaInfo: "A Canadian Study Permit is required for programs longer than six months, applied for after receiving a Letter of Acceptance.",
  },
  {
    name: "Australia",
    code: "AU",
    flagshipScholarship: "Australia Awards Scholarship",
    currency: { symbol: "AUD $", yearlyRange: [28_000, 45_000], monthlyRange: [2_200, 3_600] },
    universities: ["University of Melbourne", "Australian National University", "University of Sydney", "University of Queensland", "Monash University"],
    language: "English",
    livingCost: "AUD $1,700 - $2,500/month",
    visaInfo: "A Student Visa (Subclass 500) is required, supported by a Confirmation of Enrolment (CoE) from your institution.",
  },
  {
    name: "South Korea",
    code: "KR",
    flagshipScholarship: "Korean Government Scholarship Program (KGSP)",
    currency: { symbol: "₩", yearlyRange: [9_000_000, 14_000_000], monthlyRange: [900_000, 1_200_000] },
    universities: ["Seoul National University", "KAIST", "Yonsei University", "Korea University", "Sungkyunkwan University"],
    language: "Korean",
    livingCost: "₩700,000 - ₩1,100,000/month",
    visaInfo: "A D-2 Student Visa is required, issued after admission confirmation from a Korean institution.",
  },
  {
    name: "Sweden",
    code: "SE",
    flagshipScholarship: "Swedish Institute Scholarship",
    currency: { symbol: "SEK", yearlyRange: [108_000, 160_000], monthlyRange: [9_000, 13_000] },
    universities: ["KTH Royal Institute of Technology", "Lund University", "Uppsala University", "Stockholm University", "Chalmers University of Technology"],
    language: "Swedish",
    livingCost: "SEK 9,000 - 12,000/month",
    visaInfo: "Non-EU students need a Swedish Residence Permit for studies, applied for online before arrival.",
  },
  {
    name: "Netherlands",
    code: "NL",
    flagshipScholarship: "Holland Scholarship",
    currency: { symbol: "€", yearlyRange: [3_000, 12_000], monthlyRange: [800, 1_400] },
    universities: ["University of Amsterdam", "Delft University of Technology", "Utrecht University", "Leiden University", "Erasmus University Rotterdam"],
    language: "Dutch",
    livingCost: "€900 - €1,300/month",
    visaInfo: "Non-EU students typically need an MVV entry visa plus a residence permit, usually arranged together with the university.",
  },
];

const FIELDS_OF_STUDY = [
  "Computer Science",
  "Artificial Intelligence",
  "Data Science",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biomedical Engineering",
  "Business Administration",
  "Economics",
  "Finance",
  "Law",
  "Medicine",
  "Public Health",
  "Biology",
  "Chemistry",
  "Physics",
  "Environmental Science",
  "Renewable Energy",
  "Architecture",
  "International Relations",
  "Psychology",
  "Education",
] as const;

const DEGREE_LEVELS = [DegreeLevel.BACHELORS, DegreeLevel.MASTERS, DegreeLevel.PHD] as const;
const DEGREE_WEIGHTS = [20, 55, 25] as const; // most international scholarships target master's students

const FUNDING_TYPES = [FundingType.FULLY_FUNDED, FundingType.PARTIAL_FUNDING, FundingType.TUITION_WAIVER] as const;
const FUNDING_WEIGHTS = [50, 30, 20] as const;

const NAME_TEMPLATES = [
  (uni: string, field: string) => `${uni} ${field} Excellence Scholarship`,
  (uni: string, field: string) => `${uni} Global Talent Award in ${field}`,
  (uni: string, field: string, degreeLabel: string) => `${uni} International ${degreeLabel} Fellowship — ${field}`,
  (uni: string, field: string) => `${uni} Future Leaders Scholarship — ${field}`,
  (uni: string, field: string) => `${uni} Merit Scholarship for ${field}`,
  (uni: string, field: string) => `${uni} International Student Grant — ${field}`,
] as const;

const NATIONALITY_RESTRICTIONS = [
  "Open to developing-country nationals only",
  "Not open to nationals of the host country",
  "Open to ASEAN nationals only",
  "Open to applicants from low- and middle-income countries",
] as const;

const DEGREE_LABEL: Record<DegreeLevel, string> = {
  [DegreeLevel.BACHELORS]: "Bachelor's",
  [DegreeLevel.MASTERS]: "Master's",
  [DegreeLevel.PHD]: "PhD",
};

// ============================================================
// Generators
// ============================================================

/**
 * Distinct, deterministic placeholder rankings (lower = better). These are
 * illustrative sample data for filtering/sorting demos — not sourced from
 * any real ranking system (QS, THE, ARWU, etc).
 */
function generateUniversityRankings(count: number): number[] {
  const pool = Array.from({ length: 300 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function formatFundingAmount(country: CountrySeed, fundingType: FundingType): string {
  const { symbol, yearlyRange, monthlyRange } = country.currency;

  if (fundingType === FundingType.FULLY_FUNDED) {
    const monthly = randomInt(...monthlyRange);
    return `${symbol}${monthly.toLocaleString()}/month + full tuition`;
  }
  if (fundingType === FundingType.TUITION_WAIVER) {
    const pct = pick([50, 75, 100]);
    return pct === 100 ? "100% tuition waiver" : `${pct}% tuition waiver`;
  }
  // PARTIAL_FUNDING
  const yearly = randomInt(yearlyRange[0], Math.round((yearlyRange[0] + yearlyRange[1]) / 2));
  return `${symbol}${yearly.toLocaleString()}/year`;
}

function buildEligibility(
  degreeLevel: DegreeLevel,
  field: string,
  cgpa: number,
  ielts: number | null,
  nationalityRestriction: string | null,
): string {
  const parts = [
    `Open to ${DEGREE_LABEL[degreeLevel]} applicants in ${field} with a minimum CGPA of ${cgpa.toFixed(1)} (4.0 scale).`,
  ];
  parts.push(ielts ? `A minimum IELTS score of ${ielts.toFixed(1)} is required.` : "No standardized English test score is required.");
  parts.push(nationalityRestriction ? `${nationalityRestriction}.` : "Open to applicants of any nationality.");
  return parts.join(" ");
}

function buildDescription(name: string, university: string, country: string, degreeLevel: DegreeLevel, field: string, fundingAmount: string): string {
  return `${name} supports ${DEGREE_LABEL[degreeLevel]} students pursuing ${field} at ${university} in ${country}, providing ${fundingAmount}.`;
}

interface ScholarshipSeed {
  name: string;
  description: string;
  countryId: string;
  universityId: string;
  fundingType: FundingType;
  fundingAmount: string;
  degreeLevel: DegreeLevel;
  fieldOfStudy: string;
  cgpaRequirement: number;
  ieltsRequirement: number | null;
  nationalityRestriction: string | null;
  applicationDeadline: Date;
  applicationLink: string;
  eligibility: string;
}

const TOTAL_SCHOLARSHIPS = 150;

function buildScholarships(
  countries: CountrySeed[],
  countryIdsByCode: Map<string, string>,
  universityIdsByKey: Map<string, string>,
): ScholarshipSeed[] {
  // Flatten to a (country, university) pair list so scholarships round-robin
  // evenly across all 40 universities regardless of country.
  const universityPairs = countries.flatMap((country) => country.universities.map((university) => ({ country, university })));

  const scholarships: ScholarshipSeed[] = [];

  for (let i = 0; i < TOTAL_SCHOLARSHIPS; i++) {
    const { country, university } = universityPairs[i % universityPairs.length];
    const countryId = countryIdsByCode.get(country.code)!;
    const universityId = universityIdsByKey.get(`${country.code}:${university}`)!;

    // Use the country's real flagship program exactly once: each country's lead
    // university appears once per full pass through `universityPairs`, so gating
    // on the *first* pass (i < universityPairs.length) catches it a single time.
    const isFlagshipSlot = i < universityPairs.length && university === country.universities[0];

    const field = pick(FIELDS_OF_STUDY);
    // Real flagship government scholarships are graduate-level and fully funded
    // in reality — keep the generated data consistent with that fact.
    const degreeLevel = isFlagshipSlot ? pick([DegreeLevel.MASTERS, DegreeLevel.PHD]) : pickWeighted(DEGREE_LEVELS, DEGREE_WEIGHTS);
    const fundingType = isFlagshipSlot ? FundingType.FULLY_FUNDED : pickWeighted(FUNDING_TYPES, FUNDING_WEIGHTS);

    const name = isFlagshipSlot ? country.flagshipScholarship : pick(NAME_TEMPLATES)(university, field, DEGREE_LABEL[degreeLevel]);

    const cgpaRequirement = randomFloat(2.8, 3.8, 2);
    const hasIelts = rng() > 0.25;
    const ieltsRequirement = hasIelts ? randomFloat(6.0, 7.5, 1) : null;

    const hasRestriction = rng() < 0.2;
    const nationalityRestriction = hasRestriction ? pick(NATIONALITY_RESTRICTIONS) : null;

    const fundingAmount = formatFundingAmount(country, fundingType);
    const applicationDeadline = daysFromNow(randomInt(30, 420));
    const applicationLink = `https://apply.example.com/scholarships/${slugify(name)}-${i}`;
    const eligibility = buildEligibility(degreeLevel, field, cgpaRequirement, ieltsRequirement, nationalityRestriction);
    const description = buildDescription(name, university, country.name, degreeLevel, field, fundingAmount);

    scholarships.push({
      name,
      description,
      countryId,
      universityId,
      fundingType,
      fundingAmount,
      degreeLevel,
      fieldOfStudy: field,
      cgpaRequirement,
      ieltsRequirement,
      nationalityRestriction,
      applicationDeadline,
      applicationLink,
      eligibility,
    });
  }

  return scholarships;
}

// ============================================================
// Seed orchestration
// ============================================================

async function seedCountries(): Promise<Map<string, string>> {
  const idsByCode = new Map<string, string>();

  for (const country of COUNTRIES) {
    const fields = {
      name: country.name,
      language: country.language,
      livingCost: country.livingCost,
      visaInfo: country.visaInfo,
    };
    const record = await db.country.upsert({
      where: { code: country.code },
      update: fields,
      create: { ...fields, code: country.code },
    });
    idsByCode.set(country.code, record.id);
  }

  return idsByCode;
}

async function seedUniversities(countryIdsByCode: Map<string, string>): Promise<Map<string, string>> {
  const idsByKey = new Map<string, string>();
  const totalUniversities = COUNTRIES.reduce((sum, country) => sum + country.universities.length, 0);
  const rankings = generateUniversityRankings(totalUniversities);
  let rankIndex = 0;

  for (const country of COUNTRIES) {
    const countryId = countryIdsByCode.get(country.code)!;
    for (const universityName of country.universities) {
      const ranking = rankings[rankIndex++];
      const record = await db.university.upsert({
        where: { name_countryId: { name: universityName, countryId } },
        update: { ranking },
        create: { name: universityName, countryId, ranking },
      });
      idsByKey.set(`${country.code}:${universityName}`, record.id);
    }
  }

  return idsByKey;
}

async function seedScholarships(countryIdsByCode: Map<string, string>, universityIdsByKey: Map<string, string>): Promise<number> {
  // Scholarships have no natural unique key, so the simplest idempotent
  // strategy is to replace them wholesale each run. Cascade rules on
  // SavedScholarship/Application clean those up automatically.
  await db.scholarship.deleteMany();

  const scholarships = buildScholarships(COUNTRIES, countryIdsByCode, universityIdsByKey);
  const { count } = await db.scholarship.createMany({ data: scholarships });
  return count;
}

// ============================================================
// Current Available Scholarships (homepage "Current Scholarships" section)
// ============================================================

/**
 * Hand-curated real scholarships, unrelated to the generated 150 above —
 * `title` is unique, so re-running the seed upserts in place rather than
 * duplicating or wiping these on every run.
 */
const CURRENT_SCHOLARSHIPS: Array<{
  title: string;
  hostCountry: string;
  hostCountryCode: string;
  university: string | null;
  degreeLevels: string[];
  fieldOfStudy: string | null;
  fundingType: string;
  benefits: string[];
  deadline: Date | null;
  applicationLink: string;
  description: string;
  imageUrl: string;
}> = [
  {
    title: "McCall MacBain Scholarship 2027",
    hostCountry: "Canada",
    hostCountryCode: "CA",
    university: "McGill University",
    degreeLevels: ["Bachelor's", "Master's"],
    fieldOfStudy: null,
    fundingType: "Fully Funded",
    benefits: ["Tuition Fees", "Living Stipend", "Return Air Tickets"],
    deadline: null,
    applicationLink: "https://mccallmacbainscholars.org/apply/",
    description:
      "Fully funded scholarship for Bachelor's and Master's study at McGill University in Canada, covering tuition, a living stipend, and return air tickets.",
    imageUrl: "/scholarships/mcgill.png",
  },
  {
    title: "RMIT University Scholarship 2027",
    hostCountry: "Australia",
    hostCountryCode: "AU",
    university: "RMIT University",
    degreeLevels: ["Master's", "PhD"],
    fieldOfStudy: null,
    fundingType: "Fully Funded",
    benefits: ["Full Tuition", "RTP Tuition Offset", "$36,245 Annual Stipend", "$1,540 Relocation Allowance"],
    deadline: null,
    applicationLink: "https://www.rmit.edu.au/research/research-degrees/how-to-apply",
    description:
      "Fully funded Master's and PhD research scholarship at RMIT University in Australia, including a tuition offset, an annual stipend, and a relocation allowance. IELTS is not required if a medium-of-instruction (MOI) certificate is accepted.",
    imageUrl: "/scholarships/rmit.png",
  },
  {
    title: "Victoria University of Wellington Scholarship",
    hostCountry: "New Zealand",
    hostCountryCode: "NZ",
    university: "Victoria University of Wellington",
    degreeLevels: ["Bachelor's", "Master's", "PhD"],
    fieldOfStudy: null,
    fundingType: "Fully Funded",
    benefits: ["Tuition", "Accommodation", "Monthly Stipend", "Air Ticket", "Health Insurance", "Visa Support"],
    deadline: null,
    applicationLink: "https://www.wgtn.ac.nz/international/scholarships-fees",
    description:
      "Fully funded scholarship covering Bachelor's, Master's, and PhD study at Victoria University of Wellington in New Zealand, including tuition, accommodation, a monthly stipend, airfare, health insurance, and visa support.",
    imageUrl: "/scholarships/victoria.png",
  },
  {
    title: "Chulabhorn Graduate Institute Scholarship 2027",
    hostCountry: "Thailand",
    hostCountryCode: "TH",
    university: "Chulabhorn Graduate Institute",
    degreeLevels: ["Master's"],
    fieldOfStudy: null,
    fundingType: "Fully Funded",
    benefits: ["Tuition", "Airfare", "Accommodation", "Monthly Stipend", "Visa", "Books", "Insurance"],
    deadline: null,
    applicationLink: "https://www.cgi.ac.th/admissions/cgi-scholarship-international/",
    description:
      "Fully funded Master's scholarship at Chulabhorn Graduate Institute in Thailand, covering tuition, airfare, accommodation, a monthly stipend, visa costs, books, and insurance.",
    imageUrl: "/scholarships/chulabhorn.png",
  },
  {
    title: "SECAI AI Scholarship 2026",
    hostCountry: "Germany",
    hostCountryCode: "DE",
    university: null,
    degreeLevels: ["Master's"],
    fieldOfStudy: "Artificial Intelligence",
    fundingType: "Fully Funded",
    benefits: ["€11,208 Annual Stipend", "Family Allowance", "Travel Cost"],
    deadline: new Date("2026-06-30T23:59:59.000Z"),
    applicationLink: "https://secai.org/students/scholarship_programs",
    description:
      "Fully funded Master's scholarship in Artificial Intelligence through SECAI (School of Embedded Composite AI) in Germany, including an annual stipend, a family allowance, and travel costs.",
    imageUrl: "/scholarships/secai.png",
  },
  {
    title: "DAAD MIDE Scholarship",
    hostCountry: "Germany",
    hostCountryCode: "DE",
    university: "HTW Berlin",
    degreeLevels: ["Master's"],
    fieldOfStudy: null,
    fundingType: "Fully Funded",
    benefits: ["Tuition", "€934 Monthly Stipend", "Travel Allowance", "Health Insurance", "Rent Subsidy", "Family Allowance"],
    deadline: new Date("2026-08-31T23:59:59.000Z"),
    applicationLink: "https://mide.htw-berlin.de/applying/#c67981",
    description:
      "Fully funded DAAD scholarship for the Master in International Development Engineering (MIDE) program at HTW Berlin, Germany, covering tuition, a monthly stipend, travel allowance, health insurance, rent subsidy, and a family allowance.",
    imageUrl: "/scholarships/daad.png",
  },
  {
    title: "TANDEM Scholarship",
    hostCountry: "Germany",
    hostCountryCode: "DE",
    university: null,
    degreeLevels: ["Undergraduate"],
    fieldOfStudy: null,
    fundingType: "Fully Funded",
    benefits: ["Undergraduate Scholarship", "No IELTS Required"],
    deadline: null,
    applicationLink: "https://www.deutsche-universitaetsstiftung.de/stipendienprogramme/tandem",
    description:
      "Fully funded undergraduate scholarship in Germany offered through the TANDEM program by the German Universities Foundation (Deutsche Universitätsstiftung). No IELTS score required.",
    imageUrl: "/scholarships/tandem.png",
  },
];

async function seedCurrentScholarships(): Promise<number> {
  for (const s of CURRENT_SCHOLARSHIPS) {
    await db.currentScholarship.upsert({
      where: { title: s.title },
      update: { ...s, eligibleCountries: [], category: null, fundingAmount: null, officialWebsite: null, status: CurrentScholarshipStatus.OPEN },
      create: { ...s, eligibleCountries: [], category: null, fundingAmount: null, officialWebsite: null, status: CurrentScholarshipStatus.OPEN },
    });
  }
  return CURRENT_SCHOLARSHIPS.length;
}

async function main() {
  console.log("Seeding countries...");
  const countryIdsByCode = await seedCountries();
  console.log(`  -> ${countryIdsByCode.size} countries`);

  console.log("Seeding universities...");
  const universityIdsByKey = await seedUniversities(countryIdsByCode);
  console.log(`  -> ${universityIdsByKey.size} universities`);

  console.log("Seeding scholarships...");
  const scholarshipCount = await seedScholarships(countryIdsByCode, universityIdsByKey);
  console.log(`  -> ${scholarshipCount} scholarships`);

  console.log("Seeding current scholarships...");
  const currentScholarshipCount = await seedCurrentScholarships();
  console.log(`  -> ${currentScholarshipCount} current scholarships`);

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
