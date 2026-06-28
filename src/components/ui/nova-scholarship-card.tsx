"use client";

import * as React from "react";
import { Award, Calendar, GraduationCap, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NovaScholarshipResult } from "@/services/novaChat.service";

const DEGREE_LABEL: Record<NovaScholarshipResult["degreeLevel"], string> = {
  BACHELORS: "Bachelor's",
  MASTERS: "Master's",
  PHD: "PhD",
};

function formatDeadline(iso: string): string {
  const date = new Date(iso);
  const daysLeft = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (daysLeft <= 0) return label;
  if (daysLeft <= 30) return `${label} · ${daysLeft}d left`;
  return label;
}

function matchAccent(score: number): string {
  if (score >= 85) return "#06B6D4";
  if (score >= 70) return "#7C3AED";
  return "#3B82F6";
}

interface NovaScholarshipCardProps {
  scholarship: NovaScholarshipResult;
  onViewDetails?: (id: string) => void;
  className?: string;
}

function NovaScholarshipCardImpl({ scholarship, onViewDetails, className }: NovaScholarshipCardProps) {
  const accent = matchAccent(scholarship.matchPercentage);

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{scholarship.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[#94A3B8]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {scholarship.university}, {scholarship.country}
            </span>
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ color: accent, backgroundColor: `${accent}1A`, border: `1px solid ${accent}40` }}
        >
          {scholarship.matchPercentage}% Match
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
          <span className="truncate">{scholarship.funding}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[#06B6D4]" />
          <span className="truncate">{DEGREE_LABEL[scholarship.degreeLevel]}</span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-[#3B82F6]" />
          <span className="truncate">{formatDeadline(scholarship.deadline)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewDetails?.(scholarship.id)}
        className="mt-3 w-full rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 py-2 text-xs font-medium text-[#C4B5FD] transition-colors hover:bg-[#7C3AED]/20"
      >
        View Details
      </button>
    </div>
  );
}

export const NovaScholarshipCard = React.memo(NovaScholarshipCardImpl);

export default NovaScholarshipCard;
