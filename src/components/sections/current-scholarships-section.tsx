"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Hand, Sparkles } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";

import { CardStack, type CardStackItem } from "@/components/ui/card-stack";
import { CurrentScholarshipCard } from "@/components/ui/current-scholarship-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ShimmerText } from "@/components/ui/shimmer-text";
import type { CurrentScholarship } from "@/types/currentScholarship";

type CurrentScholarshipItem = CurrentScholarship & CardStackItem;

interface StackSizing {
  cardWidth: number;
  cardHeight: number;
  maxVisible: number;
  spreadDeg: number;
  overlap: number;
}

/** maxVisible covers all 7 at once so the whole fan is reachable without looping out of view; loop (below) still lets drag/dots cycle past either end. */
const MOBILE_SIZING: StackSizing = { cardWidth: 200, cardHeight: 420, maxVisible: 5, spreadDeg: 22, overlap: 0.62 };
const TABLET_SIZING: StackSizing = { cardWidth: 230, cardHeight: 430, maxVisible: 7, spreadDeg: 34, overlap: 0.56 };
const DESKTOP_SIZING: StackSizing = { cardWidth: 260, cardHeight: 440, maxVisible: 7, spreadDeg: 42, overlap: 0.5 };

/** Fixed-pixel card sizing in CardStack isn't responsive on its own, so the section picks sizing props per breakpoint instead of touching the slider's internals. */
function useStackSizing(): StackSizing {
  const [sizing, setSizing] = React.useState<StackSizing>(DESKTOP_SIZING);

  React.useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setSizing(MOBILE_SIZING);
      else if (w < 1024) setSizing(TABLET_SIZING);
      else setSizing(DESKTOP_SIZING);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return sizing;
}

export function CurrentScholarshipsSection() {
  const [scholarships, setScholarships] = React.useState<CurrentScholarshipItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const sizing = useStackSizing();
  const lenis = useLenis();

  React.useEffect(() => {
    let cancelled = false;

    fetch("/api/scholarships/current")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) throw new Error(json?.error?.message ?? "Failed to load scholarships");
        const items: CurrentScholarshipItem[] = json.data.map((s: CurrentScholarship) => ({ ...s, title: s.title }));
        setScholarships(items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load scholarships");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Reserving min-height above keeps this from being a big jump, but
  // refresh anyway to keep ScrollTrigger's cached trigger positions (the
  // ScrollReveal entrances below, and anywhere else on the page) and
  // Lenis's scroll bounds in sync with the real, final layout.
  React.useEffect(() => {
    if (!scholarships) return;
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      lenis?.resize();
    });
    return () => cancelAnimationFrame(id);
  }, [scholarships, lenis]);

  return (
    <section id="current-scholarships" className="relative overflow-x-hidden py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display flex items-center justify-center gap-3 text-3xl sm:text-4xl font-bold text-white">
            <Sparkles className="h-6 w-6 shrink-0 text-[#7C3AED]" />
            <span>
              Current Available{" "}
              <ShimmerText variant="violet" className="font-display text-3xl sm:text-4xl font-bold">
                Scholarships
              </ShimmerText>
            </span>
            <Sparkles className="h-6 w-6 shrink-0 text-[#7C3AED]" />
          </h2>
          <p className="mt-4 text-[#94A3B8]">
            Explore fully funded scholarships currently accepting applications worldwide.
          </p>
        </ScrollReveal>

        <div className="mt-12">
          {error ? (
            <div style={{ minHeight: Math.max(380, sizing.cardHeight + 80) }} className="flex items-center justify-center">
              <p className="text-center text-sm text-[#F87171]">{error}</p>
            </div>
          ) : !scholarships ? (
            // Reserves the same height the loaded CardStack will occupy —
            // without this, the page is ~2500px shorter while this fetch is
            // in flight. A user who scrolls to "the bottom" during that
            // window sees the footer right there; the instant data
            // arrives, the page grows underneath them and the footer gets
            // pushed far below the viewport, reading as if it "disappeared".
            <div style={{ minHeight: Math.max(380, sizing.cardHeight + 80) }} className="flex items-center justify-center">
              <p className="text-center text-sm text-[#94A3B8]">Loading current scholarships…</p>
            </div>
          ) : scholarships.length === 0 ? (
            <div style={{ minHeight: Math.max(380, sizing.cardHeight + 80) }} className="flex items-center justify-center">
              <p className="text-center text-sm text-[#94A3B8]">No open scholarships right now — check back soon.</p>
            </div>
          ) : (
            <CardStack
              items={scholarships}
              maxVisible={sizing.maxVisible}
              cardWidth={sizing.cardWidth}
              cardHeight={sizing.cardHeight}
              overlap={sizing.overlap}
              spreadDeg={sizing.spreadDeg}
              loop
              showDots
              renderCard={(item, { active }) => <CurrentScholarshipCard scholarship={item} active={active} />}
            />
          )}
        </div>

        {scholarships && scholarships.length > 0 ? (
          <ScrollReveal delay={0.2} y={16} className="mt-6 flex items-center justify-center gap-3 text-sm">
            <ArrowLeft className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10">
              <Hand className="h-4 w-4 text-[#C4B5FD]" aria-hidden="true" />
            </span>
            <p className="text-[#94A3B8]">
              <span className="font-semibold text-[#C4B5FD]">Swipe</span> to explore more scholarships
            </p>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  );
}

export default CurrentScholarshipsSection;
