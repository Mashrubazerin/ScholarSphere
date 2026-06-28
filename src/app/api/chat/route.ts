import { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { getNovaChatReply } from "@/services/novaChat.service";
import { novaChatRequestSchema } from "@/validation/novaChat.schema";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { message } = novaChatRequestSchema.parse(await req.json());
  const reply = await getNovaChatReply(message);
  return apiSuccess(reply);
});
