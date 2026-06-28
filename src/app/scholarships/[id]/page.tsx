import { Calendar, CheckCircle2, ExternalLink, GraduationCap, Landmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppError } from "@/middleware/withErrorHandling";
import { getCurrentScholarshipById } from "@/services/currentScholarship.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDeadline(iso: string | null): string | null {
  if (!iso) return null;
  // timeZone: "UTC" — these are calendar deadlines, not instants; without
  // this, a viewer east of UTC would see the date roll over to the next day.
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default async function ScholarshipDetailPage({ params }: PageProps) {
  const { id } = await params;

  const scholarship = await getCurrentScholarshipById(id).catch((err: unknown) => {
    if (err instanceof AppError && err.status === 404) notFound();
    throw err;
  });

  const deadlineLabel = formatDeadline(scholarship.deadline);

  return (
    <main className="min-h-screen py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/#current-scholarships" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
          ← Back to Current Scholarships
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/90 backdrop-blur-xl">
          {scholarship.imageUrl ? (
            <div className="relative h-64 w-full bg-[#020617] sm:h-80">
              <Image
                src={scholarship.imageUrl}
                alt={scholarship.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
                priority
              />
            </div>
          ) : null}

          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl leading-none" aria-hidden="true">
                  {scholarship.hostCountryFlag}
                </span>
                <span className="text-sm font-medium uppercase tracking-wide text-[#94A3B8]">{scholarship.hostCountry}</span>
              </div>
              <span className="shrink-0 rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#C4B5FD]">
                {scholarship.fundingType}
              </span>
            </div>

            <h1 className="font-display mt-4 text-2xl sm:text-3xl font-bold text-white">{scholarship.title}</h1>

            {scholarship.university ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[#94A3B8]">
                <Landmark className="h-4 w-4 shrink-0 text-[#06B6D4]" />
                {scholarship.university}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {scholarship.degreeLevels.map((level) => (
                <span
                  key={level}
                  className="flex items-center gap-1 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-3 py-1 text-xs font-medium text-[#C4B5FD]"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  {level}
                </span>
              ))}
            </div>

            {scholarship.description ? <p className="mt-6 text-sm leading-relaxed text-[#CBD5E1]">{scholarship.description}</p> : null}

            {scholarship.fieldOfStudy ? (
              <p className="mt-4 text-sm text-[#94A3B8]">
                <span className="text-white font-medium">Field of Study:</span> {scholarship.fieldOfStudy}
              </p>
            ) : null}

            <div className="mt-6">
              <h2 className="text-xs uppercase tracking-wide text-white/80 mb-2">Benefits</h2>
              <ul className="space-y-2">
                {scholarship.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-[#94A3B8]">
              <Calendar className="h-4 w-4 shrink-0 text-[#3B82F6]" />
              {deadlineLabel ? `Application Deadline: ${deadlineLabel}` : "Applications Open"}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={scholarship.applicationLink}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.35)] transition-transform hover:scale-[1.02]"
              >
                Apply Now
                <ExternalLink className="h-4 w-4" />
              </a>
              {scholarship.officialWebsite && scholarship.officialWebsite !== scholarship.applicationLink ? (
                <a
                  href={scholarship.officialWebsite}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-6 py-3 text-sm font-medium text-[#C4B5FD] transition-colors hover:bg-[#7C3AED]/20"
                >
                  Official Website
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
