"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Hand, Sparkles } from "lucide-react";

import { CardStack, type CardStackItem } from "@/components/ui/card-stack";
import { CurrentScholarshipCard } from "@/components/ui/current-scholarship-card";
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

/** Cards run noticeably taller than wide here — the image banner alone is ~256px (h-64) on desktop — to match the reference's vertical card proportions. */
const MOBILE_SIZING: StackSizing = { cardWidth: 270, cardHeight: 700, maxVisible: 3, spreadDeg: 18, overlap: 0.64 };
const TABLET_SIZING: StackSizing = { cardWidth: 330, cardHeight: 700, maxVisible: 5, spreadDeg: 30, overlap: 0.54 };
const DESKTOP_SIZING: StackSizing = { cardWidth: 380, cardHeight: 720, maxVisible: 5, spreadDeg: 38, overlap: 0.48 };

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

  return (
    <section id="current-scholarships" className="relative overflow-x-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mx-auto max-w-2xl text-center">
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
        </div>

        <div className="mt-16">
          {error ? (
            <p className="text-center text-sm text-[#F87171]">{error}</p>
          ) : !scholarships ? (
            <p className="text-center text-sm text-[#94A3B8]">Loading current scholarships…</p>
          ) : scholarships.length === 0 ? (
            <p className="text-center text-sm text-[#94A3B8]">No open scholarships right now — check back soon.</p>
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
          <div className="mt-6 flex items-center justify-center gap-3 text-sm">
            <ArrowLeft className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10">
              <Hand className="h-4 w-4 text-[#C4B5FD]" aria-hidden="true" />
            </span>
            <p className="text-[#94A3B8]">
              <span className="font-semibold text-[#C4B5FD]">Swipe</span> to explore more scholarships
            </p>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CurrentScholarshipsSection;
