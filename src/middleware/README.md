# middleware/

Composable wrappers around individual route handlers — App Router route
handlers don't have an Express-style middleware chain, so this is the
convention used instead: `export const GET = withAuth(withErrorHandling(handler))`.

This is **not** the same as the special root-level `middleware.ts` that
Next.js runs on the Edge for every matched request (e.g. redirects, locale
detection, coarse auth gating before a request even reaches a route). That
file, if/when needed, lives at the project root, not here. This folder is
for per-route, composable logic that runs inside the Node runtime alongside
the handler.

- `withErrorHandling.ts` (already here) — catches thrown errors (including
  Zod `ValidationError`s) and returns a consistent `ApiFailure` response.
- `withAuth.ts` (next) — verifies the session/JWT, attaches the current
  user to the request context, throws `AppError("UNAUTHORIZED", ...)` if
  missing. Added once auth is designed.
- `withRateLimit.ts` (later) — protects expensive routes (e.g. the AI chat
  endpoint) from abuse.
