import type { User } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export async function findUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } });
}

export async function createUser(data: { name: string; email: string; passwordHash: string }): Promise<User> {
  return db.user.create({ data });
}
