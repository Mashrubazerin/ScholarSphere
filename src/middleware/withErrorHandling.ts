import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { apiError } from "@/lib/api-response";
import { Prisma } from "@/generated/prisma/client";

type RouteHandler<Ctx = unknown> = (req: NextRequest, ctx: Ctx) => Promise<NextResponse>;

/**
 * Wraps a route handler so every thrown error becomes a consistent
 * ApiFailure response instead of an unhandled 500 with a leaked stack trace.
 * Feature-specific errors (e.g. `ScholarshipNotFoundError`) should extend
 * `AppError` below so they map to the right status code here.
 *
 * Generic over `Ctx` so dynamic routes can type their own `{ params }` shape:
 * `withErrorHandling<{ params: Promise<{ id: string }> }>(async (req, { params }) => ...)`.
 */
export function withErrorHandling<Ctx = unknown>(handler: RouteHandler<Ctx>): RouteHandler<Ctx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return apiError("VALIDATION_ERROR", "Invalid request data", 400, err.flatten());
      }
      if (err instanceof AppError) {
        return apiError(err.code, err.message, err.status);
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return mapPrismaError(err);
      }
      if (err instanceof SyntaxError) {
        // Most commonly req.json() choking on a missing/malformed body — a client error, not a 500.
        return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
      }

      console.error("Unhandled API error:", err);
      return apiError("INTERNAL_ERROR", "Something went wrong", 500);
    }
  };
}

/** Translates the Prisma error codes routes actually hit into proper HTTP responses. */
function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): NextResponse {
  switch (err.code) {
    case "P2025": // record to update/delete/connect doesn't exist
      return apiError("NOT_FOUND", "Resource not found", 404);
    case "P2003": // foreign key constraint failed (e.g. bad countryId/universityId)
      return apiError("INVALID_REFERENCE", "Referenced resource does not exist", 400, { field: err.meta?.field_name });
    case "P2002": // unique constraint failed
      return apiError("DUPLICATE", "Resource already exists", 409, { target: err.meta?.target });
    default:
      console.error("Unhandled Prisma error:", err);
      return apiError("DATABASE_ERROR", "A database error occurred", 500);
  }
}

/** Base class for expected, feature-thrown errors (e.g. not-found, conflict). */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}
