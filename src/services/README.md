# services/

Business logic. A service answers "what should happen" for a use case —
e.g. `scholarship.service.ts` might combine a CGPA-eligibility filter, a
match-score calculation, and an OpenAI call to explain the ranking.

Rules of thumb:
- Services call **repositories** for data access — never `db` (Prisma) directly.
- Services call **lib/openai.ts** directly for AI calls (there's no
  "repository" for an external API, the service owns that integration).
- Services are framework-agnostic: no `NextRequest`/`NextResponse` in here.
  That keeps them callable from API routes, server actions, cron jobs, or
  tests without changing a line.
- One file per domain concept, e.g. `scholarship.service.ts`,
  `chat.service.ts`, `user.service.ts`.

Nothing here yet — will be filled in once the Prisma schema (the data these
services operate on) exists.
