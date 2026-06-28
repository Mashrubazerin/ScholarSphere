# repositories/

The only layer allowed to import `db` from `lib/db.ts` and talk to Prisma
directly. A repository answers "how do I fetch/store this" — plain CRUD and
query methods, no business rules.

Rules of thumb:
- One file per Prisma model, e.g. `scholarship.repository.ts`,
  `user.repository.ts`.
- Methods take/return plain types (often the Prisma-generated model type or
  a shape from `types/`), not framework objects.
- Keeps Prisma swappable in theory and mockable in tests — services depend
  on repository functions, not on Prisma's query API, so a test can stub a
  repository without spinning up a real database.

Nothing here yet — repositories wrap Prisma models, so this folder fills in
right after the schema is designed.
