"use client";

import { NovaOrb } from "@/components/ui/nova-orb";
import { NovaFloatingCards } from "@/components/ui/nova-floating-cards";
import { NovaChatPanel } from "@/components/ui/nova-chat-panel";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function NovaAISection() {
  return (
    <section id="nova" className="relative overflow-hidden py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/40 bg-white/5 px-4 py-1.5 text-sm text-[#94A3B8] backdrop-blur">
            <span className="animate-pulse text-[#7C3AED]">✦</span>
            Meet Your AI Advisor
          </div>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Nova Finds Your Funding,{" "}
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
              You Focus on Your Future
            </span>
          </h2>
          <p className="mt-4 text-[#94A3B8]">
            Chat with Nova to instantly match scholarships, track deadlines, and get essay
            guidance — tailored to your academic profile.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-12">
          {/* left: animated orb + floating scholarship cards */}
          <ScrollReveal
            delay={0.1}
            x={-24}
            y={0}
            className="relative mx-auto flex h-[420px] w-full max-w-[460px] items-center justify-center sm:h-[480px]"
          >
            <NovaOrb size="clamp(240px, 70vw, 340px)" />
            <NovaFloatingCards />
          </ScrollReveal>

          {/* right: glassmorphism chat interface — staggered in last */}
          <ScrollReveal delay={0.25} x={24} y={0} className="mx-auto w-full max-w-xl">
            <NovaChatPanel />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default NovaAISection;
