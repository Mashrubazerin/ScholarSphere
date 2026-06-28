import { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { registerUser } from "@/services/auth.service";
import { registerSchema } from "@/validation/auth.schema";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const input = registerSchema.parse(await req.json());
  const user = await registerUser(input);
  return apiSuccess(user, { status: 201 });
});
