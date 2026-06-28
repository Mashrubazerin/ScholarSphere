import type { Country, Prisma, University } from "@/generated/prisma/client";
import { db } from "@/lib/db";

/** How many universities to surface as a country's "top universities". */
const TOP_UNIVERSITIES_LIMIT = 5;

export type CountryWithDetails = Country & {
  universities: University[];
  _count: { scholarships: number };
};

export interface Pagination {
  page: number;
  pageSize: number;
}

const COUNTRY_INCLUDE = {
  universities: {
    orderBy: [{ ranking: { sort: "asc", nulls: "last" } }, { name: "asc" }],
    take: TOP_UNIVERSITIES_LIMIT,
  },
  _count: { select: { scholarships: true } },
} satisfies Prisma.CountryInclude;

export async function findManyCountries(pagination: Pagination): Promise<{ items: CountryWithDetails[]; total: number }> {
  const skip = (pagination.page - 1) * pagination.pageSize;

  const [items, total] = await Promise.all([
    db.country.findMany({
      skip,
      take: pagination.pageSize,
      orderBy: { name: "asc" },
      include: COUNTRY_INCLUDE,
    }),
    db.country.count(),
  ]);

  return { items, total };
}

export async function findCountryById(id: string): Promise<CountryWithDetails | null> {
  return db.country.findUnique({ where: { id }, include: COUNTRY_INCLUDE });
}
