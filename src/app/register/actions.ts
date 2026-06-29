"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { AppError } from "@/middleware/withErrorHandling";
import { registerUser } from "@/services/auth.service";
import { registerSchema } from "@/validation/auth.schema";

export async function register(_prevState: string | undefined, formData: FormData): Promise<string | undefined> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid input.";
  }

  try {
    await registerUser(parsed.data);
  } catch (error) {
    if (error instanceof AppError) return error.message;
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Account created — please sign in.";
    }
    throw error;
  }
}
