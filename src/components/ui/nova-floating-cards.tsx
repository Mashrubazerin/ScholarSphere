"use client";

import { motion } from "motion/react";
import { type LucideIcon, Award, Clock, GraduationCap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingScholarshipCard {
  icon: LucideIcon;
  title: string;
  detail: string;
  accent: string;
  position: string;
  float: { y: number; duration: number; delay: number };
}

const DEFAULT_CARDS: FloatingScholarshipCard[] = [
  {
    icon: Award,
    title: "Fulbright Award",
    detail: "$35,000 / yr",
    accent: "#7C3AED",
    position: "left-[2%] top-[6%] sm:left-[-4%]",
    float: { y: 12, duration: 5.5, delay: 0 },
  },
  {
    icon: GraduationCap,
    title: "DAAD Germany",
    detail: "Fully Funded",
    accent: "#06B6D4",
    position: "right-[0%] top-[12%] sm:right-[-6%]",
    float: { y: 10, duration: 6.5, delay: 0.6 },
  },
  {
    icon: Clock,
    title: "Vanier CGS",
    detail: "Deadline in 12d",
    accent: "#3B82F6",
    position: "left-[-2%] bottom-[14%] sm:left-[-8%]",
    float: { y: 14, duration: 6, delay: 1.1 },
  },
  {
    icon: Sparkles,
    title: "98% Match",
    detail: "MEXT Japan",
    accent: "#A78BFA",
    position: "right-[4%] bottom-[4%] sm:right-[-2%]",
    float: { y: 11, duration: 5.8, delay: 1.6 },
  },
];

interface NovaFloatingCardsProps {
  cards?: FloatingScholarshipCard[];
  className?: string;
}

export function NovaFloatingCards({ cards = DEFAULT_CARDS, className }: NovaFloatingCardsProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            className={cn("absolute", card.position)}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: "easeOut" }}
          >
            <motion.div
              animate={{ y: [0, -card.float.y, 0] }}
              transition={{
                duration: card.float.duration,
                delay: card.float.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center gap-3 rounded-2xl border bg-[#0B1120]/70 px-4 py-3 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              style={{ borderColor: `${card.accent}33` }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: `${card.accent}1A`, boxShadow: `0 0 16px ${card.accent}55` }}
              >
                <Icon className="h-4 w-4" style={{ color: card.accent }} />
              </div>
              <div className="whitespace-nowrap">
                <p className="text-xs font-semibold text-white">{card.title}</p>
                <p className="text-[11px] text-[#94A3B8]">{card.detail}</p>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default NovaFloatingCards;
