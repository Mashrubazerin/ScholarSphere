import { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { listUniversities } from "@/services/university.service";
import { listUniversitiesQuerySchema } from "@/validation/university.schema";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const query = listUniversitiesQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  const result = await listUniversities(query);
  return apiSuccess(result);
});
