"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle2, ExternalLink, GraduationCap, Landmark } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CurrentScholarship } from "@/types/currentScholarship";

const MAX_BENEFITS_SHOWN = 4;

function formatDeadline(iso: string | null): string | null {
  if (!iso) return null;
  // timeZone: "UTC" — these are calendar deadlines, not instants; without
  // this, a viewer east of UTC would see the date roll over to the next day.
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/**
 * Cyan (hue 188, #06B6D4) sweeping to violet (hue 263, #7C3AED) as the
 * cursor moves left-to-right — matches the site's two-tone brand gradient.
 * --radius matches rounded-2xl (16px).
 *
 * The permanent purple-to-aqua border itself comes from the
 * `.spotlight-gradient-edge` background-layer trick (globals.css), not from
 * this `border` property — `border-color` can only ever be one solid color,
 * so it can't show both brand colors at once. This element's own `border`
 * is transparent and exists only to reserve the --border-size of physical
 * space the gradient (and the cursor spotlight layered on top of it) paint
 * into. Both stay within the box, so neither gets clipped by CardStack's
 * overflow-hidden wrapper (see card-stack.tsx).
 */
const SPOTLIGHT_STYLE = {
  "--base": 188,
  "--spread": 75,
  "--saturation": 95,
  "--lightness": 65,
  "--radius": "16",
  "--border": "2.5",
  "--size": "240",
  "--outer": "0.95",
  "--border-size": "calc(var(--border, 2) * 1px)",
  "--spotlight-size": "calc(var(--size, 150) * 1px)",
  "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
  border: "var(--border-size) solid transparent",
} as React.CSSProperties;

interface CurrentScholarshipCardProps {
  scholarship: CurrentScholarship;
  active?: boolean;
  className?: string;
}

function CurrentScholarshipCardImpl({ scholarship, active = true, className }: CurrentScholarshipCardProps) {
  const benefits = scholarship.benefits.slice(0, MAX_BENEFITS_SHOWN);
  const extraBenefits = scholarship.benefits.length - benefits.length;
  const deadlineLabel = formatDeadline(scholarship.deadline);

  return (
    <div
      data-glow
      style={SPOTLIGHT_STYLE}
      className={cn(
        // spotlight-gradient-edge supplies both the card's fill (its first
        // background layer) and the permanent purple-to-aqua border (its
        // second), so bg-[#0B1120]/90 isn't needed here anymore. The inset
        // shadow (not outset) and the cursor spotlight above both stay
        // within this box for the same reason — CardStack's wrapper around
        // this card has its own overflow-hidden that clips anything drawn
        // outside it.
        "spotlight-gradient-edge flex h-full w-full flex-col overflow-hidden rounded-2xl shadow-[inset_0_0_45px_rgba(124,58,237,0.55)] backdrop-blur-xl transition-opacity",
        active ? "opacity-100" : "opacity-75",
        className,
      )}
    >
      <div data-glow aria-hidden="true" />
      {/* Image area — compact banner with the country/flag badge floating on top */}
      {scholarship.imageUrl ? (
        <div className="relative h-28 w-full shrink-0 sm:h-32">
          <Image
            src={scholarship.imageUrl}
            alt={scholarship.title}
            fill
            sizes="(max-width: 640px) 200px, (max-width: 1024px) 230px, 260px"
            className="object-cover object-top"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
            <span className="text-xs leading-none" aria-hidden="true">
              {scholarship.hostCountryFlag}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wide text-white">{scholarship.hostCountry}</span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-white">{scholarship.title}</h3>

        {scholarship.university ? (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-[#94A3B8]">
            <Landmark className="h-3 w-3 shrink-0 text-[#06B6D4]" />
            <span className="truncate">{scholarship.university}</span>
          </p>
        ) : null}

        <span className="mt-2 inline-flex w-fit shrink-0 rounded-full bg-[#7C3AED] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          {scholarship.fundingType}
        </span>

        {scholarship.degreeLevels.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {scholarship.degreeLevels.map((level) => (
              <span
                key={level}
                className="flex items-center gap-1 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-1.5 py-0.5 text-[9px] font-medium text-[#C4B5FD]"
              >
                <GraduationCap className="h-2.5 w-2.5" />
                {level}
              </span>
            ))}
          </div>
        ) : null}

        <ul className="mt-2 flex-1 space-y-1 overflow-hidden border-t border-white/10 pt-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-1.5 text-[11px] text-[#94A3B8]">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#06B6D4]" />
              <span className="line-clamp-1">{benefit}</span>
            </li>
          ))}
          {extraBenefits > 0 ? (
            <li className="pl-[18px] text-[10px] text-[#94A3B8]/70">+{extraBenefits} more benefit{extraBenefits > 1 ? "s" : ""}</li>
          ) : null}
        </ul>

        <p className="mt-1.5 flex items-center gap-1.5 border-t border-white/10 pt-2 text-[11px] text-[#94A3B8]">
          <Calendar className="h-3 w-3 shrink-0 text-[#3B82F6]" />
          {deadlineLabel ? `Deadline: ${deadlineLabel}` : "Applications Open Now"}
        </p>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <a
            href={scholarship.applicationLink}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] py-1.5 text-[10px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-transform hover:scale-[1.02]"
          >
            Apply Now
            <ExternalLink className="h-3 w-3" />
          </a>
          <Link
            href={`/scholarships/${scholarship.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center rounded-lg border border-[#7C3AED]/30 bg-[#7C3AED]/10 py-1.5 text-[10px] font-medium text-[#C4B5FD] transition-colors hover:bg-[#7C3AED]/20"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export const CurrentScholarshipCard = React.memo(CurrentScholarshipCardImpl);

export default CurrentScholarshipCard;
