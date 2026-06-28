import { z } from "zod";

export const universityIdParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

/** Query params for GET /api/universities — every value arrives as a string. */
export const listUniversitiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  countryId: z.string().trim().min(1).optional(),
  /** "Top N" threshold — ranking is lower-is-better, so this is an upper bound. */
  maxRanking: z.coerce.number().int().min(1).optional(),
  /** Matches universities with at least one scholarship in this field of study. */
  field: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});
export type ListUniversitiesQuery = z.infer<typeof listUniversitiesQuerySchema>;
