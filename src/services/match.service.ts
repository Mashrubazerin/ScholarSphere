import { findAllScholarshipsForMatching } from "@/repositories/scholarship.repository";
import { recommendScholarships, type RecommendationInput, type ScholarshipRecommendation } from "@/services/recommendationEngine";
import { toScholarshipCandidate } from "@/services/scholarshipCandidateAdapter";
import type { MatchRequestInput } from "@/validation/match.schema";

function toRecommendationInput(input: MatchRequestInput): RecommendationInput {
  return {
    cgpa: input.cgpa,
    ielts: input.ielts,
    degreeLevel: input.degree,
    countryPreference: input.country,
    fieldOfStudy: input.field,
    budgetPreference: input.budget,
  };
}

export async function matchScholarships(input: MatchRequestInput): Promise<ScholarshipRecommendation[]> {
  const scholarships = await findAllScholarshipsForMatching();
  const candidates = scholarships.map(toScholarshipCandidate);

  return recommendScholarships(toRecommendationInput(input), candidates, { limit: input.limit ?? 5 });
}
