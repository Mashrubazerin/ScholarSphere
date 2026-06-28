import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { getCurrentScholarshipById } from "@/services/currentScholarship.service";
import { currentScholarshipIdParamSchema } from "@/validation/currentScholarship.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandling<RouteContext>(async (_req, { params }) => {
  const { id } = currentScholarshipIdParamSchema.parse(await params);
  const scholarship = await getCurrentScholarshipById(id);
  return apiSuccess(scholarship);
});
