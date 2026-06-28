/**
 * Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` (the
 * `proxy` runtime is always Node.js now, not configurable — which is also
 * why `auth.ts` no longer needs an Edge-safe split config; it can be
 * imported here directly). Route protection happens via the `authorized`
 * callback in auth.ts.
 */
import { auth } from "@/auth";

export default auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
