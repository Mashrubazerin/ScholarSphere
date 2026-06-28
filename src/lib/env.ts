import { z } from "zod";

/**
 * Validates process.env once at import time so a missing/malformed var fails
 * fast with a clear message, instead of surfacing as `undefined` deep inside
 * a service or a cryptic Gemini/Prisma error at request time.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  /**
   * Overridable so a model rename/deprecation is a config change, not a code
   * change. Gemini's free tier only covers Flash/Flash-Lite models — verify
   * this is still current at https://ai.google.dev/gemini-api/docs/models.
   * Deliberately NOT a "-preview" model: measured ~5-10x slower responses
   * (30-90s vs 3-5s) on the preview tier during testing, presumably lower
   * capacity priority — stick to stable releases for this latency-sensitive
   * chat path unless a preview model is specifically needed.
   */
  NOVA_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  /** Auth.js reads this directly itself too — validated here as well so a missing secret fails fast with our error format. */
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);
