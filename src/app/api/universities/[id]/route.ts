import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { getUniversityById } from "@/services/university.service";
import { universityIdParamSchema } from "@/validation/university.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withErrorHandling<RouteContext>(async (_req, { params }) => {
  const { id } = universityIdParamSchema.parse(await params);
  const university = await getUniversityById(id);
  return apiSuccess(university);
});
