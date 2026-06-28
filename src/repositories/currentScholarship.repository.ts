import { CurrentScholarshipStatus } from "@/generated/prisma/client";
import type { CurrentScholarship } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export function findOpenCurrentScholarships(): Promise<CurrentScholarship[]> {
  return db.currentScholarship.findMany({
    where: { status: CurrentScholarshipStatus.OPEN },
    orderBy: { createdAt: "desc" },
  });
}

export function findCurrentScholarshipById(id: string): Promise<CurrentScholarship | null> {
  return db.currentScholarship.findUnique({ where: { id } });
}
