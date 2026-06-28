import { NextResponse } from "next/server";

import type { ApiResponse } from "@/types/api";

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, init);
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: { code, message, details } },
    { status },
  );
}
