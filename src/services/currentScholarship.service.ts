import type { CurrentScholarship, CurrentScholarshipStatus } from "@/generated/prisma/client";
import { countryCodeToFlagEmoji } from "@/lib/flag";
import { AppError } from "@/middleware/withErrorHandling";
import { findCurrentScholarshipById, findOpenCurrentScholarships } from "@/repositories/currentScholarship.repository";

export interface CurrentScholarshipResponse {
  id: string;
  title: string;
  hostCountry: string;
  hostCountryFlag: string;
  university: string | null;
  degreeLevels: string[];
  category: string | null;
  eligibleCountries: string[];
  fundingType: string;
  fundingAmount: string | null;
  benefits: string[];
  /** Derived from `status` rather than stored separately, so the two can never drift out of sync. */
  applicationOpen: boolean;
  /** ISO 8601, or null if no deadline was published. */
  deadline: string | null;
  applicationLink: string;
  officialWebsite: string | null;
  description: string | null;
  fieldOfStudy: string | null;
  imageUrl: string | null;
  status: CurrentScholarshipStatus;
}

function toResponse(s: CurrentScholarship): CurrentScholarshipResponse {
  return {
    id: s.id,
    title: s.title,
    hostCountry: s.hostCountry,
    hostCountryFlag: countryCodeToFlagEmoji(s.hostCountryCode),
    university: s.university,
    degreeLevels: s.degreeLevels,
    category: s.category,
    eligibleCountries: s.eligibleCountries,
    fundingType: s.fundingType,
    fundingAmount: s.fundingAmount,
    benefits: s.benefits,
    applicationOpen: s.status === "OPEN",
    deadline: s.deadline ? s.deadline.toISOString() : null,
    applicationLink: s.applicationLink,
    officialWebsite: s.officialWebsite,
    description: s.description,
    fieldOfStudy: s.fieldOfStudy,
    imageUrl: s.imageUrl,
    status: s.status,
  };
}

export async function listOpenCurrentScholarships(): Promise<CurrentScholarshipResponse[]> {
  const scholarships = await findOpenCurrentScholarships();
  return scholarships.map(toResponse);
}

export async function getCurrentScholarshipById(id: string): Promise<CurrentScholarshipResponse> {
  const scholarship = await findCurrentScholarshipById(id);
  if (!scholarship) {
    throw new AppError("CURRENT_SCHOLARSHIP_NOT_FOUND", `Scholarship ${id} not found`, 404);
  }
  return toResponse(scholarship);
}
