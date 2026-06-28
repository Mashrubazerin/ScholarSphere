"use client";

import { useActionState } from "react";

import { register } from "./actions";

export function RegisterForm() {
  const [errorMessage, formAction, isPending] = useActionState(register, undefined);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm text-[#94A3B8]">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Jane Doe"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-[#94A3B8]/60 focus:border-[#7C3AED] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-[#94A3B8]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-[#94A3B8]/60 focus:border-[#7C3AED] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-[#94A3B8]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-[#94A3B8]/60 focus:border-[#7C3AED] focus:outline-none"
        />
      </div>

      {errorMessage && <p className="text-sm text-[#EF4444]">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] py-2.5 font-semibold text-white transition-all hover:shadow-[0_0_24px_rgba(124,58,237,0.5)] disabled:opacity-60"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
