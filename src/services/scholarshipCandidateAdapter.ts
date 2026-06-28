import type { ScholarshipWithRelations } from "@/repositories/scholarship.repository";
import type { ScholarshipCandidate } from "@/services/recommendationEngine";

/**
 * Shared by every caller of the recommendation engine that sources
 * candidates from the real database (`/api/match`, Nova's chat backend).
 * Prisma's `DegreeLevel`/`FundingType` enum values ("BACHELORS",
 * "FULLY_FUNDED", ...) are literally the same strings the engine's own
 * types use, by design — so this is a field-by-field reshape, not a value
 * translation.
 */
export function toScholarshipCandidate(scholarship: ScholarshipWithRelations): ScholarshipCandidate {
  return {
    id: scholarship.id,
    name: scholarship.name,
    country: scholarship.country.name,
    fundingType: scholarship.fundingType,
    fundingAmount: scholarship.fundingAmount,
    degreeLevel: scholarship.degreeLevel,
    fieldOfStudy: scholarship.fieldOfStudy,
    cgpaRequirement: scholarship.cgpaRequirement,
    ieltsRequirement: scholarship.ieltsRequirement,
    applicationDeadline: scholarship.applicationDeadline,
  };
}
