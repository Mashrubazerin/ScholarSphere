import bcrypt from "bcryptjs";

import { AppError } from "@/middleware/withErrorHandling";
import { createUser, findUserByEmail } from "@/repositories/user.repository";
import type { RegisterInput } from "@/validation/auth.schema";

const BCRYPT_SALT_ROUNDS = 12;

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
}

export async function registerUser(input: RegisterInput): Promise<RegisteredUser> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new AppError("EMAIL_IN_USE", "An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
  const user = await createUser({ name: input.name, email: input.email, passwordHash });

  return { id: user.id, name: user.name, email: user.email };
}
