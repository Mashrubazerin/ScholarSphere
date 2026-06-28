import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { listOpenCurrentScholarships } from "@/services/currentScholarship.service";

export const GET = withErrorHandling(async () => {
  const scholarships = await listOpenCurrentScholarships();
  return apiSuccess(scholarships);
});
