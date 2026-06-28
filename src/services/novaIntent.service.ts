import { z } from "zod";

import { env } from "@/lib/env";
import { gemini } from "@/lib/gemini";
import { AppError } from "@/middleware/withErrorHandling";

const extractionSchema = z.object({
  intent: z.enum(["scholarship_search", "general_question"]),
  /** 4.0 scale. Null if not mentioned — never guess a default. */
  cgpa: z.number().min(0).max(4).nullable(),
  /** 0-9 scale. Null if not mentioned. */
  ielts: z.number().min(0).max(9).nullable(),
  country: z.string().nullable(),
  degree: z.enum(["BACHELORS", "MASTERS", "PHD"]).nullable(),
  field: z.string().nullable(),
});

const extractionJsonSchema = z.toJSONSchema(extractionSchema, { target: "draft-7" });

export type NovaIntentExtraction = z.infer<typeof extractionSchema>;

const EXTRACTION_SYSTEM_PROMPT = `You are an intent classifier and field extractor for Nova, the AI scholarship advisor on ScholarSphere AI, a study-abroad scholarship discovery platform.

Classify the user's message as exactly one of:
- "scholarship_search": the user wants to find, filter, or browse scholarships — this includes specific criteria (CGPA, IELTS, country, degree, field) as well as vague requests like "what scholarships are available?"
- "general_question": anything else — asking what a specific program/acronym/visa/term means, general advice, greetings, thanks, or unrelated questions

Then extract any of the following the user explicitly stated. Use null for anything not mentioned or implied — never guess, infer, or default a value that wasn't actually said.
- cgpa: number on a 4.0 scale
- ielts: number on a 0-9 scale
- country: the country they want to study in, normalized to its common English name (e.g. "USA", "Japan", "South Korea")
- degree: one of BACHELORS, MASTERS, PHD
- field: their field of study in a few words (e.g. "Computer Science", "Artificial Intelligence")`;

const GENERAL_SYSTEM_PROMPT = `You are Nova, the friendly AI scholarship advisor for ScholarSphere AI, a study-abroad scholarship discovery platform. Answer the user's general question helpfully and concisely (2-4 sentences).

If asked about a specific scholarship, university, or visa program, you may explain what it generally is and how it works in broad terms. Do NOT state specific current funding amounts, application deadlines, CGPA/IELTS thresholds, or eligibility figures as fact for any named program — those change over time and you have no access to live data in this conversation. Instead, invite the user to ask you to find or search scholarships so you can check the current database, or point them to the official program website for exact current figures. Never invent scholarship details.`;

function wrapGeminiError(err: unknown): never {
  console.error("Gemini call failed:", err);
  throw new AppError("AI_SERVICE_ERROR", "Nova's AI service is temporarily unavailable", 503);
}

/** Single Gemini call doing both intent classification and field extraction. */
export async function extractIntent(message: string): Promise<NovaIntentExtraction> {
  let text: string | undefined;
  try {
    const response = await gemini.models.generateContent({
      model: env.NOVA_MODEL,
      contents: message,
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: extractionJsonSchema,
      },
    });
    text = response.text;
  } catch (err) {
    wrapGeminiError(err);
  }

  if (!text) {
    throw new AppError("AI_SERVICE_ERROR", "Nova's AI service returned an unexpected response", 503);
  }

  try {
    return extractionSchema.parse(JSON.parse(text));
  } catch (err) {
    console.error("Gemini returned a response that didn't match the expected schema:", text, err);
    throw new AppError("AI_SERVICE_ERROR", "Nova's AI service returned an unexpected response", 503);
  }
}

/** Free-text answer for anything that isn't a scholarship search. */
export async function answerGeneralQuestion(message: string): Promise<string> {
  let text: string | undefined;
  try {
    const response = await gemini.models.generateContent({
      model: env.NOVA_MODEL,
      contents: message,
      config: {
        systemInstruction: GENERAL_SYSTEM_PROMPT,
      },
    });
    text = response.text;
  } catch (err) {
    wrapGeminiError(err);
  }

  return text ?? "I'm not sure how to answer that — could you rephrase?";
}
