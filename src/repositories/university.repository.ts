import type { Country, Prisma, University } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type UniversityWithRelations = University & {
  country: Country;
};

export interface UniversityFilters {
  countryId?: string;
  /** Upper bound on ranking (lower is better), i.e. "top N". */
  maxRanking?: number;
  /** Matches universities with at least one scholarship in this field of study. */
  field?: string;
  search?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

const UNIVERSITY_INCLUDE = { country: true } satisfies Prisma.UniversityInclude;

function buildWhereClause(filters: UniversityFilters): Prisma.UniversityWhereInput {
  return {
    countryId: filters.countryId,
    ranking: filters.maxRanking ? { lte: filters.maxRanking } : undefined,
    scholarships: filters.field ? { some: { fieldOfStudy: { equals: filters.field, mode: "insensitive" } } } : undefined,
    name: filters.search ? { contains: filters.search, mode: "insensitive" } : undefined,
  };
}

export async function findManyUniversities(
  filters: UniversityFilters,
  pagination: Pagination,
): Promise<{ items: UniversityWithRelations[]; total: number }> {
  const where = buildWhereClause(filters);
  const skip = (pagination.page - 1) * pagination.pageSize;

  const [items, total] = await Promise.all([
    db.university.findMany({
      where,
      skip,
      take: pagination.pageSize,
      orderBy: [{ ranking: { sort: "asc", nulls: "last" } }, { name: "asc" }],
      include: UNIVERSITY_INCLUDE,
    }),
    db.university.count({ where }),
  ]);

  return { items, total };
}

export async function findUniversityById(id: string): Promise<UniversityWithRelations | null> {
  return db.university.findUnique({ where: { id }, include: UNIVERSITY_INCLUDE });
}
