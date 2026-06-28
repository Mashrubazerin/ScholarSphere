import type { DefaultSession } from "next-auth";

import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User {
    role?: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

// `next-auth/jwt` only re-exports `@auth/core/jwt`'s JWT interface (`export *`),
// which doesn't participate in declaration merging — augmenting the canonical
// module directly is what the `jwt`/`session` callback parameter types actually see.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
