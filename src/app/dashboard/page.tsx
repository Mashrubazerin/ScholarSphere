import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { NovaParticleField } from "@/components/ui/nova-particle-field";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { savedScholarships: true, applications: true } } },
  });
  if (!user) redirect("/login");

  return (
    <main className="relative min-h-screen px-6 py-24">
      <NovaParticleField className="fixed -z-10" />
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1120]/70 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div>
            <p className="text-sm text-[#94A3B8]">Welcome back</p>
            <h1 className="font-display text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-[#94A3B8]">{user.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/5"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wide text-[#94A3B8]">Saved Scholarships</p>
            <p className="mt-1 text-3xl font-bold text-white">{user._count.savedScholarships}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wide text-[#94A3B8]">Applications</p>
            <p className="mt-1 text-3xl font-bold text-white">{user._count.applications}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wide text-[#94A3B8]">Profile</p>
            <p className="mt-1 text-3xl font-bold text-white">{user.cgpa ? "Complete" : "Incomplete"}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
