import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { NovaParticleField } from "@/components/ui/nova-particle-field";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-24">
      <NovaParticleField className="fixed -z-10" />
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1120]/70 p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Sign in to continue to ScholarSphere AI.</p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-[#94A3B8]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#A78BFA] hover:text-white">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
