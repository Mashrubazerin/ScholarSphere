import { z } from "zod";

export const countryIdParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

/** Query params for GET /api/countries — every value arrives as a string. */
export const listCountriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListCountriesQuery = z.infer<typeof listCountriesQuerySchema>;
