"use client";

import { Navbar } from "@/components/ui/mini-navbar";
import { GlowButton } from "@/components/ui/shiny-button-1";
import { ShimmerText } from "@/components/ui/shimmer-text";
import DotCard from "@/components/ui/moving-dot-card";
import { ParticleWaveBackground } from "@/components/ui/particle-wave-background";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import { NovaAISection } from "@/components/sections/nova-ai-section";
import { CurrentScholarshipsSection } from "@/components/sections/current-scholarships-section";
import { CtaSection } from "@/components/sections/cta-section";
import { SiteFooter } from "@/components/sections/site-footer";

/** Feeds the hero globe's markers — the "Top Destinations" section that used to display this in card form was removed. */
const destinations = [
  { flag: "🇯🇵", name: "Japan", lat: 36.2048, lng: 138.2529, highlight: "MEXT, JASSO, University Scholarships" },
  { flag: "🇩🇪", name: "Germany", lat: 51.1657, lng: 10.4515, highlight: "DAAD, Deutschlandstipendium, Erasmus+" },
  { flag: "🇨🇦", name: "Canada", lat: 56.1304, lng: -106.3468, highlight: "Vanier CGS, Trudeau Foundation, University Awards" },
  { flag: "🇺🇸", name: "USA", lat: 37.0902, lng: -95.7129, highlight: "Fulbright, Gates Cambridge, Ivy scholarships" },
];

const globeDestinations = destinations.map((d) => ({
  name: d.name,
  flag: d.flag,
  lat: d.lat,
  lng: d.lng,
  scholarships: d.highlight.split(", "),
}));

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1 pt-16">
        {/* HERO */}
        <section
          id="home"
          className="relative overflow-hidden min-h-[90vh] flex items-center"
        >
          <ParticleWaveBackground particleColor="#A78BFA" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/40 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-[#94A3B8] mb-6">
                  <span className="text-[#7C3AED] animate-pulse">✦</span>
                  AI-Powered Scholarship Discovery
                </div>

                <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] text-white">
                  <span className="block">Find Your Fully</span>
                  <ShimmerText
                    variant="violet"
                    className="block font-display text-5xl sm:text-6xl md:text-7xl font-bold"
                  >
                    Funded Future
                  </ShimmerText>
                </h1>

                <p className="mt-6 text-lg sm:text-xl text-[#94A3B8] max-w-xl">
                  Discover scholarships, universities, and opportunities
                  tailored to your academic profile using advanced AI.
                </p>

                <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
                  <DotCard
                    target={50000}
                    duration={1800}
                    label="Scholarships"
                    formatValue={(v) => `${Math.floor(v).toLocaleString()}+`}
                  />
                  <DotCard
                    target={150}
                    duration={1800}
                    label="Countries"
                    formatValue={(v) => `${Math.floor(v)}+`}
                  />
                  <DotCard
                    target={500}
                    duration={1800}
                    label="Funding"
                    formatValue={(v) => `$${Math.floor(v)}M+`}
                  />
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <GlowButton>Start Matching →</GlowButton>
                  <button className="px-5 py-3 text-sm font-medium text-white border border-[#7C3AED]/50 rounded-lg hover:bg-[#7C3AED]/10 hover:border-[#7C3AED] transition-colors">
                    Explore Scholarships
                  </button>
                </div>

                <p className="mt-8 text-xs text-[#94A3B8]">
                  Trusted by students who won scholarships to 5,000+
                  universities
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <RotatingEarth
                  width={560}
                  height={560}
                  className="w-full max-w-[420px] sm:max-w-[560px]"
                  destinations={globeDestinations}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CURRENT AVAILABLE SCHOLARSHIPS */}
        <CurrentScholarshipsSection />

        {/* Scroll target for the CTA section's "How It Works" button — lands at the Nova AI walkthrough below. */}
        <div id="how-it-works" />

        {/* NOVA AI ADVISOR */}
        <NovaAISection />

        {/* CTA BANNER */}
        <CtaSection />
      </main>

      {/* FOOTER */}
      <SiteFooter />
    </>
  );
}
