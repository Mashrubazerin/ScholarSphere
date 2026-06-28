import type { Country, DegreeLevel, FundingType, Prisma, Scholarship, University } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type ScholarshipWithRelations = Scholarship & {
  country: Country;
  university: University;
};

export interface ScholarshipFilters {
  countryId?: string;
  universityId?: string;
  degreeLevel?: DegreeLevel;
  fundingType?: FundingType;
  fieldOfStudy?: string;
  search?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

const SCHOLARSHIP_INCLUDE = { country: true, university: true } satisfies Prisma.ScholarshipInclude;

function buildWhereClause(filters: ScholarshipFilters): Prisma.ScholarshipWhereInput {
  return {
    countryId: filters.countryId,
    universityId: filters.universityId,
    degreeLevel: filters.degreeLevel,
    fundingType: filters.fundingType,
    fieldOfStudy: filters.fieldOfStudy,
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { fieldOfStudy: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function findManyScholarships(
  filters: ScholarshipFilters,
  pagination: Pagination,
): Promise<{ items: ScholarshipWithRelations[]; total: number }> {
  const where = buildWhereClause(filters);
  const skip = (pagination.page - 1) * pagination.pageSize;

  const [items, total] = await Promise.all([
    db.scholarship.findMany({
      where,
      skip,
      take: pagination.pageSize,
      orderBy: { createdAt: "desc" },
      include: SCHOLARSHIP_INCLUDE,
    }),
    db.scholarship.count({ where }),
  ]);

  return { items, total };
}

export async function findScholarshipById(id: string): Promise<ScholarshipWithRelations | null> {
  return db.scholarship.findUnique({ where: { id }, include: SCHOLARSHIP_INCLUDE });
}

/**
 * Fetches the whole catalog, unfiltered and unpaginated — for the matching
 * engine, which needs to score every candidate itself rather than work off
 * a pre-filtered page. Fine at our current scale (hundreds of rows); a much
 * larger catalog would want filters pushed into this query instead.
 */
export async function findAllScholarshipsForMatching(): Promise<ScholarshipWithRelations[]> {
  return db.scholarship.findMany({ include: SCHOLARSHIP_INCLUDE, orderBy: { createdAt: "desc" } });
}

export async function createScholarship(data: Prisma.ScholarshipUncheckedCreateInput): Promise<ScholarshipWithRelations> {
  return db.scholarship.create({ data, include: SCHOLARSHIP_INCLUDE });
}

export async function updateScholarship(
  id: string,
  data: Prisma.ScholarshipUncheckedUpdateInput,
): Promise<ScholarshipWithRelations> {
  return db.scholarship.update({ where: { id }, data, include: SCHOLARSHIP_INCLUDE });
}

export async function deleteScholarship(id: string): Promise<void> {
  await db.scholarship.delete({ where: { id } });
}
