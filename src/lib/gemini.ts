import { GoogleGenAI } from "@google/genai";

import { env } from "@/lib/env";

/** Single shared client — server-side only, never import this from client components. */
export const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
