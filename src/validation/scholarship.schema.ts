import { z } from "zod";

import { DegreeLevel, FundingType } from "@/generated/prisma/client";

const degreeLevelSchema = z.enum(DegreeLevel);
const fundingTypeSchema = z.enum(FundingType);

/** Shared by create and update — PUT replaces the whole resource, so it needs every field too. */
const scholarshipBodySchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  description: z.string().trim().min(1, "description is required"),
  countryId: z.string().trim().min(1, "countryId is required"),
  universityId: z.string().trim().min(1, "universityId is required"),
  fundingType: fundingTypeSchema,
  fundingAmount: z.string().trim().min(1, "fundingAmount is required"),
  degreeLevel: degreeLevelSchema,
  fieldOfStudy: z.string().trim().min(1, "fieldOfStudy is required"),
  cgpaRequirement: z.coerce.number().min(0).max(4),
  ieltsRequirement: z.coerce.number().min(0).max(9).nullish(),
  nationalityRestriction: z.string().trim().min(1).nullish(),
  applicationDeadline: z.coerce.date(),
  applicationLink: z.string().trim().url("applicationLink must be a valid URL"),
  eligibility: z.string().trim().min(1, "eligibility is required"),
});

export const createScholarshipSchema = scholarshipBodySchema;
export type CreateScholarshipInput = z.infer<typeof createScholarshipSchema>;

export const updateScholarshipSchema = scholarshipBodySchema;
export type UpdateScholarshipInput = z.infer<typeof updateScholarshipSchema>;

export const scholarshipIdParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

/** Query params for GET /api/scholarships — every value arrives as a string. */
export const listScholarshipsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  countryId: z.string().trim().min(1).optional(),
  universityId: z.string().trim().min(1).optional(),
  degreeLevel: degreeLevelSchema.optional(),
  fundingType: fundingTypeSchema.optional(),
  fieldOfStudy: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});
export type ListScholarshipsQuery = z.infer<typeof listScholarshipsQuerySchema>;
