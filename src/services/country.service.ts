import type { University } from "@/generated/prisma/client";
import { countryCodeToFlagEmoji } from "@/lib/flag";
import { AppError } from "@/middleware/withErrorHandling";
import { findCountryById, findManyCountries, type CountryWithDetails } from "@/repositories/country.repository";
import type { PaginatedResult } from "@/types/api";
import type { ListCountriesQuery } from "@/validation/country.schema";

export interface CountryResponse {
  id: string;
  name: string;
  code: string;
  flag: string;
  language: string;
  livingCost: string;
  visaInfo: string;
  scholarshipCount: number;
  topUniversities: Pick<University, "id" | "name" | "ranking">[];
  createdAt: Date;
  updatedAt: Date;
}

function toCountryResponse(country: CountryWithDetails): CountryResponse {
  return {
    id: country.id,
    name: country.name,
    code: country.code,
    flag: countryCodeToFlagEmoji(country.code),
    language: country.language,
    livingCost: country.livingCost,
    visaInfo: country.visaInfo,
    scholarshipCount: country._count.scholarships,
    topUniversities: country.universities.map((u) => ({ id: u.id, name: u.name, ranking: u.ranking })),
    createdAt: country.createdAt,
    updatedAt: country.updatedAt,
  };
}

export async function listCountries(query: ListCountriesQuery): Promise<PaginatedResult<CountryResponse>> {
  const { items, total } = await findManyCountries(query);

  return {
    items: items.map(toCountryResponse),
    page: query.page,
    pageSize: query.pageSize,
    totalItems: total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getCountryById(id: string): Promise<CountryResponse> {
  const country = await findCountryById(id);
  if (!country) {
    throw new AppError("COUNTRY_NOT_FOUND", `Country ${id} not found`, 404);
  }
  return toCountryResponse(country);
}
