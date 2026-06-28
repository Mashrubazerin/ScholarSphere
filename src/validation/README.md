# validation/

Zod schemas for everything that crosses a trust boundary: API route request
bodies/query params, and (optionally) form input on the client.

Rules of thumb:
- One file per feature, e.g. `scholarship.schema.ts`, `chat.schema.ts`,
  `auth.schema.ts`.
- Export both the schema and its inferred type:
  `export type CreateScholarshipInput = z.infer<typeof createScholarshipSchema>`.
  Routes and services then import the *type*, not a hand-written interface,
  so validation and types can never drift apart.
- Route handlers call `schema.parse(body)` and let
  `middleware/withErrorHandling.ts` turn a thrown `ZodError` into a 400
  response — routes don't write their own try/catch for this.

Nothing here yet — schemas validate specific request shapes, which don't
exist until the corresponding API routes are designed.
