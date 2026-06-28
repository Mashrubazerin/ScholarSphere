import { apiSuccess } from "@/lib/api-response";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/middleware/withErrorHandling";

export const GET = withErrorHandling(async () => {
  await db.$queryRaw`SELECT 1`;
  return apiSuccess({ status: "ok", timestamp: new Date().toISOString() });
});
