import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/lib/env";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 removed the built-in query engine — every client now needs an
 * explicit driver adapter. This is the Postgres one; swapping databases
 * later means swapping this adapter, not anything in services/repositories.
 */
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

/**
 * Next.js dev hot-reload re-evaluates this module on every edit, which would
 * otherwise spin up a fresh PrismaClient (and a fresh connection pool) each
 * time. Caching the instance on `globalThis` survives reloads in dev while
 * staying a plain singleton in production.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
