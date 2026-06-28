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
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/90 backdrop-blur-xl transition-opacity",
        active ? "opacity-100" : "opacity-80",
        className,
      )}
    >
      {/* Image area — tall, "vertical" hero banner with the country/flag badge floating on top */}
      {scholarship.imageUrl ? (
        <div className="relative h-56 w-full shrink-0 sm:h-64">
          <Image
            src={scholarship.imageUrl}
            alt={scholarship.title}
            fill
            sizes="(max-width: 640px) 270px, (max-width: 1024px) 330px, 380px"
            className="object-cover object-top"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-base leading-none" aria-hidden="true">
              {scholarship.hostCountryFlag}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white">{scholarship.hostCountry}</span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-semibold text-white">{scholarship.title}</h3>

        {scholarship.university ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#94A3B8]">
            <Landmark className="h-3.5 w-3.5 shrink-0 text-[#06B6D4]" />
            <span className="truncate">{scholarship.university}</span>
          </p>
        ) : null}

        <span className="mt-3 inline-flex w-fit shrink-0 rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#C4B5FD]">
          {scholarship.fundingType}
        </span>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {scholarship.degreeLevels.map((level) => (
            <span
              key={level}
              className="flex items-center gap-1 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-2 py-0.5 text-[11px] font-medium text-[#C4B5FD]"
            >
              <GraduationCap className="h-3 w-3" />
              {level}
            </span>
          ))}
        </div>

        <ul className="mt-4 flex-1 space-y-1.5 overflow-hidden border-t border-white/10 pt-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-1.5 text-xs text-[#94A3B8]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#06B6D4]" />
              <span className="line-clamp-1">{benefit}</span>
            </li>
          ))}
          {extraBenefits > 0 ? (
            <li className="pl-5 text-xs text-[#94A3B8]/70">+{extraBenefits} more benefit{extraBenefits > 1 ? "s" : ""}</li>
          ) : null}
        </ul>

        <p className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-xs text-[#94A3B8]">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-[#3B82F6]" />
          {deadlineLabel ? `Deadline: ${deadlineLabel}` : "Applications Open"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={scholarship.applicationLink}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-transform hover:scale-[1.02]"
          >
            Apply Now
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            href={`/scholarships/${scholarship.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 py-2 text-xs font-medium text-[#C4B5FD] transition-colors hover:bg-[#7C3AED]/20"
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
