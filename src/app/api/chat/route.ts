import { NextRequest } from "next/server";

import { apiSuccess } from "@/lib/api-response";
import { withErrorHandling } from "@/middleware/withErrorHandling";
import { getNovaChatReply } from "@/services/novaChat.service";
import { novaChatRequestSchema } from "@/validation/novaChat.schema";

// Vercel's default serverless function timeout (10s on Hobby) is tight for
// this route: general questions make two sequential Gemini calls
// (extractIntent then answerGeneralQuestion), and production cold-starts +
// Vercel-to-Google network latency add on top of the ~3-5s each call takes
// in local testing — comfortably over 10s combined.
export const maxDuration = 60;

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { message } = novaChatRequestSchema.parse(await req.json());
  const reply = await getNovaChatReply(message);
  return apiSuccess(reply);
});
