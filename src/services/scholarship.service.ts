import { AppError } from "@/middleware/withErrorHandling";
import {
  createScholarship as createScholarshipRecord,
  deleteScholarship as deleteScholarshipRecord,
  findManyScholarships,
  findScholarshipById,
  updateScholarship as updateScholarshipRecord,
  type ScholarshipWithRelations,
} from "@/repositories/scholarship.repository";
import type { PaginatedResult } from "@/types/api";
import type { CreateScholarshipInput, ListScholarshipsQuery, UpdateScholarshipInput } from "@/validation/scholarship.schema";

function assertFutureDeadline(deadline: Date) {
  if (deadline.getTime() <= Date.now()) {
    throw new AppError("INVALID_DEADLINE", "applicationDeadline must be in the future", 400);
  }
}

export async function listScholarships(query: ListScholarshipsQuery): Promise<PaginatedResult<ScholarshipWithRelations>> {
  const { page, pageSize, ...filters } = query;
  const { items, total } = await findManyScholarships(filters, { page, pageSize });

  return {
    items,
    page,
    pageSize,
    totalItems: total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getScholarshipById(id: string): Promise<ScholarshipWithRelations> {
  const scholarship = await findScholarshipById(id);
  if (!scholarship) {
    throw new AppError("SCHOLARSHIP_NOT_FOUND", `Scholarship ${id} not found`, 404);
  }
  return scholarship;
}

export async function createScholarship(input: CreateScholarshipInput): Promise<ScholarshipWithRelations> {
  assertFutureDeadline(input.applicationDeadline);
  return createScholarshipRecord(input);
}

export async function updateScholarship(id: string, input: UpdateScholarshipInput): Promise<ScholarshipWithRelations> {
  assertFutureDeadline(input.applicationDeadline);
  return updateScholarshipRecord(id, input);
}

export async function deleteScholarship(id: string): Promise<void> {
  await deleteScholarshipRecord(id);
}
