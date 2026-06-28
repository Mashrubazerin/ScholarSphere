# types/

Shared TypeScript types that don't belong to any single layer.

- `api.ts` (already here) — the `ApiResponse<T>` envelope and pagination
  shapes every route returns.
- Future per-feature files (`scholarship.types.ts`, `chat.types.ts`, ...) —
  only for types that don't already come for free from
  `@/generated/prisma` (Prisma generates a type for every model) or from a
  `validation/*.schema.ts`'s `z.infer<...>`. Most domain types should be
  derived from one of those two instead of hand-written here, to avoid
  three sources of truth for the same shape.
