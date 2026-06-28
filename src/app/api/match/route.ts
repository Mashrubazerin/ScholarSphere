import { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { matchScholarships } from "@/services/match.service";
import { matchRequestSchema } from "@/validation/match.schema";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const input = matchRequestSchema.parse(await req.json());
  const scholarships = await matchScholarships(input);
  return apiSuccess({ scholarships });
});
