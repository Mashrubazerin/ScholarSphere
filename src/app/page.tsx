"use client";

import { Navbar } from "@/components/ui/mini-navbar";
import { NovaParticleField } from "@/components/ui/nova-particle-field";
import { HeroSection } from "@/components/sections/hero-section";
import { CurrentScholarshipsSection } from "@/components/sections/current-scholarships-section";
import { NovaAISection } from "@/components/sections/nova-ai-section";
import { CtaSection } from "@/components/sections/cta-section";
import { SiteFooter } from "@/components/sections/site-footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1 pt-16">
        {/* HERO */}
        <HeroSection />

        {/* Starfield only behind these sections, not the hero above — the hero already has its own particle wave. */}
        <div className="relative">
          <NovaParticleField className="-z-10" />

          {/* CURRENT AVAILABLE SCHOLARSHIPS */}
          <CurrentScholarshipsSection />

          {/* NOVA AI ADVISOR */}
          <NovaAISection />

          {/* CTA BANNER */}
          <CtaSection />
        </div>
      </main>

      {/* FOOTER */}
      <SiteFooter />
    </>
  );
}
