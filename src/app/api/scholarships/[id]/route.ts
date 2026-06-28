import { NextRequest, NextResponse } from "next/server";

import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { deleteScholarship, getScholarshipById, updateScholarship } from "@/services/scholarship.service";
import { scholarshipIdParamSchema, updateScholarshipSchema } from "@/validation/scholarship.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandling<RouteContext>(async (_req, { params }) => {
  const { id } = scholarshipIdParamSchema.parse(await params);
  const scholarship = await getScholarshipById(id);
  return apiSuccess(scholarship);
});

export const PUT = withErrorHandling<RouteContext>(async (req: NextRequest, { params }) => {
  const { id } = scholarshipIdParamSchema.parse(await params);
  const body = updateScholarshipSchema.parse(await req.json());
  const scholarship = await updateScholarship(id, body);
  return apiSuccess(scholarship);
});

export const DELETE = withErrorHandling<RouteContext>(async (_req, { params }) => {
  const { id } = scholarshipIdParamSchema.parse(await params);
  await deleteScholarship(id);
  return new NextResponse(null, { status: 204 });
});
