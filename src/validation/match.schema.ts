import { z } from "zod";

const degreeSchema = z.enum(["BACHELORS", "MASTERS", "PHD"]);
const budgetSchema = z.enum(["fully-funded-only", "open-to-partial-funding"]);

export const matchRequestSchema = z
  .object({
    cgpa: z.coerce.number().min(0).max(4).optional(),
    ielts: z.coerce.number().min(0).max(9).optional(),
    degree: degreeSchema.optional(),
    country: z.string().trim().min(1).optional(),
    field: z.string().trim().min(1).optional(),
    budget: budgetSchema.optional(),
    /** Top N to return. Defaults to 5 (the engine's own default). */
    limit: z.coerce.number().int().min(1).max(20).optional(),
  })
  .refine(
    (data) =>
      data.cgpa !== undefined ||
      data.ielts !== undefined ||
      data.degree !== undefined ||
      data.country !== undefined ||
      data.field !== undefined,
    { message: "Provide at least one of cgpa, ielts, degree, country, or field" },
  );

export type MatchRequestInput = z.infer<typeof matchRequestSchema>;
