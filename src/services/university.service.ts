import { AppError } from "@/middleware/withErrorHandling";
import { findManyUniversities, findUniversityById, type UniversityWithRelations } from "@/repositories/university.repository";
import type { PaginatedResult } from "@/types/api";
import type { ListUniversitiesQuery } from "@/validation/university.schema";

export async function listUniversities(query: ListUniversitiesQuery): Promise<PaginatedResult<UniversityWithRelations>> {
  const { page, pageSize, ...filters } = query;
  const { items, total } = await findManyUniversities(filters, { page, pageSize });

  return {
    items,
    page,
    pageSize,
    totalItems: total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getUniversityById(id: string): Promise<UniversityWithRelations> {
  const university = await findUniversityById(id);
  if (!university) {
    throw new AppError("UNIVERSITY_NOT_FOUND", `University ${id} not found`, 404);
  }
  return university;
}
