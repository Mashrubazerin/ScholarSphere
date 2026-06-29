"use client";

import { motion, useReducedMotion } from "motion/react";
import { BadgeDollarSign, GraduationCap, Globe2, Landmark } from "lucide-react";

import DotCard from "@/components/ui/moving-dot-card";
import { GlobeAtmosphere } from "@/components/ui/globe-atmosphere";
import { NovaFloatingCards, type FloatingScholarshipCard } from "@/components/ui/nova-floating-cards";
import { ParticleWaveBackground } from "@/components/ui/particle-wave-background";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";

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

const HERO_FLOATING_CARDS: FloatingScholarshipCard[] = [
  {
    icon: GraduationCap,
    title: "AI Match",
    detail: "Personalized Recommendations",
    accent: "#7C3AED",
    position: "left-[2%] top-[8%] sm:left-[-6%]",
    float: { y: 10, duration: 5.5, delay: 0 },
  },
  {
    icon: Globe2,
    title: "150+ Countries",
    detail: "Global Opportunities",
    accent: "#06B6D4",
    position: "right-[2%] top-[16%] sm:right-[-8%]",
    float: { y: 12, duration: 6, delay: 0.5 },
  },
  {
    icon: Landmark,
    title: "Universities",
    detail: "Top Ranked Schools",
    accent: "#3B82F6",
    position: "left-[2%] bottom-[18%] sm:left-[-8%]",
    float: { y: 11, duration: 6.2, delay: 1 },
  },
  {
    icon: BadgeDollarSign,
    title: "Scholarships",
    detail: "Updated Daily",
    accent: "#A78BFA",
    position: "right-[0%] bottom-[6%] sm:right-[-4%]",
    float: { y: 13, duration: 5.8, delay: 1.5 },
  },
];

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="home" className="relative overflow-hidden min-h-[90vh] flex items-center">
      <ParticleWaveBackground particleColor="#A78BFA" />

      {/* Tiny twinkling stars layered with the wave, scoped to the hero only. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute h-[70%] w-[70%] -translate-x-1/4 -translate-y-1/4 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.16), transparent 70%)" }}
        />
        <div
          className="absolute right-0 top-1/3 h-[60%] w-[60%] translate-x-1/4 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.14), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-8 items-center">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/40 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-[#94A3B8] shadow-[0_0_20px_rgba(124,58,237,0.25)]"
              animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-[#A78BFA]">✨</span>
              AI-Powered Scholarship Discovery
            </motion.div>

            <h1 className="font-display mt-6 text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] text-white">
              <span className="block">Find Your</span>
              <span className="block">Fully Funded</span>
              <span className="hero-gradient-text block">Future</span>
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
          </motion.div>

          <div className="relative flex justify-center lg:justify-end">
            <GlobeAtmosphere />
            <RotatingEarth
              width={560}
              height={560}
              className="w-full max-w-[420px] sm:max-w-[560px]"
              destinations={globeDestinations}
            />
            <NovaFloatingCards cards={HERO_FLOATING_CARDS} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
