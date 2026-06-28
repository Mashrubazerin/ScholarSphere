import { z } from "zod";

export const novaChatRequestSchema = z.object({
  message: z.string().trim().min(1, "message is required").max(2000),
});

export type NovaChatRequestInput = z.infer<typeof novaChatRequestSchema>;
