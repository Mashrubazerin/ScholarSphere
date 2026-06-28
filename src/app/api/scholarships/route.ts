import { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { createScholarship, listScholarships } from "@/services/scholarship.service";
import { createScholarshipSchema, listScholarshipsQuerySchema } from "@/validation/scholarship.schema";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const query = listScholarshipsQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  const result = await listScholarships(query);
  return apiSuccess(result);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = createScholarshipSchema.parse(await req.json());
  const scholarship = await createScholarship(body);
  return apiSuccess(scholarship, { status: 201 });
});
