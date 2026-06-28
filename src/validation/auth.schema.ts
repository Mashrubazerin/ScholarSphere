import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  // bcrypt silently truncates input beyond 72 bytes — cap well under that.
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
