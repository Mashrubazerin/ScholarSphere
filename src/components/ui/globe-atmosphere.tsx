"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

interface GlobeAtmosphereProps {
  className?: string;
}

const STREAKS = [
  { top: "12%", left: "-4%", rotate: 18, delay: 0, duration: 4.5 },
  { top: "62%", left: "92%", rotate: -24, delay: 2.2, duration: 5.2 },
  { top: "82%", left: "8%", rotate: 12, delay: 4.1, duration: 4.8 },
];

const NODES = [
  { top: "8%", left: "50%", delay: 0 },
  { top: "50%", left: "94%", delay: 0.6 },
  { top: "92%", left: "50%", delay: 1.2 },
  { top: "50%", left: "4%", delay: 1.8 },
];

// Anchor points roughly matching where the floating panels sit around the
// globe (see page.tsx) — these are stylistic tethers, not pixel-exact
// connections to each panel's actual edge, since that would be too fragile
// across breakpoints for the visual payoff.
const TETHERS = [
  { x1: 10, y1: 14 },
  { x1: 90, y1: 22 },
  { x1: 10, y1: 84 },
  { x1: 92, y1: 92 },
];

// Scattered toward the edges/corners (the globe itself occupies the center
// ~80%) so these read as dust drifting around the globe rather than dots
// sitting on top of it. Fixed positions, not Math.random(), so SSR and the
// first client render produce identical markup.
const SPARKLES = [
  { top: "4%", left: "22%", size: 2, color: "#FFFFFF", delay: 0.2, duration: 2.6 },
  { top: "10%", left: "68%", size: 1.5, color: "#67E8F9", delay: 1.1, duration: 3.1 },
  { top: "2%", left: "46%", size: 2, color: "#C4B5FD", delay: 2, duration: 2.8 },
  { top: "20%", left: "4%", size: 1.5, color: "#FFFFFF", delay: 0.6, duration: 3.4 },
  { top: "30%", left: "96%", size: 2, color: "#67E8F9", delay: 1.8, duration: 2.4 },
  { top: "46%", left: "0%", size: 1.5, color: "#C4B5FD", delay: 0.9, duration: 3.6 },
  { top: "52%", left: "100%", size: 2, color: "#FFFFFF", delay: 2.4, duration: 2.9 },
  { top: "66%", left: "2%", size: 2, color: "#67E8F9", delay: 0.4, duration: 3.2 },
  { top: "72%", left: "92%", size: 1.5, color: "#C4B5FD", delay: 1.5, duration: 2.7 },
  { top: "88%", left: "30%", size: 2, color: "#FFFFFF", delay: 2.1, duration: 3.5 },
  { top: "94%", left: "62%", size: 1.5, color: "#67E8F9", delay: 0.7, duration: 2.5 },
  { top: "80%", left: "8%", size: 1.5, color: "#FFFFFF", delay: 1.3, duration: 3.0 },
  { top: "14%", left: "88%", size: 1.5, color: "#C4B5FD", delay: 2.6, duration: 2.6 },
  { top: "96%", left: "44%", size: 1.5, color: "#67E8F9", delay: 0.1, duration: 3.3 },
];

/**
 * Pure CSS/SVG atmosphere layered behind the globe — orbit rings, drifting
 * nodes, comet streaks, a soft aura — without touching the globe's own
 * canvas rendering (wireframe-dotted-globe.tsx is untouched by this).
 */
export function GlobeAtmosphere({ className }: GlobeAtmosphereProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 flex items-center justify-center", className)} aria-hidden="true">
      {/* volumetric aura */}
      <div
        className="absolute h-[90%] w-[90%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.22), rgba(124,58,237,0.12) 55%, transparent 75%)" }}
      />

      {/* orbit rings */}
      {[1, 1.18, 1.38].map((scale, i) => (
        <div
          key={scale}
          className="absolute rounded-full border border-dashed"
          style={{
            width: `${scale * 78}%`,
            height: `${scale * 78}%`,
            borderColor: i === 1 ? "rgba(124,58,237,0.25)" : "rgba(6,182,212,0.18)",
            animation: reduceMotion ? undefined : `globe-orbit-spin ${28 + i * 10}s linear infinite ${i % 2 === 0 ? "" : "reverse"}`,
          }}
        />
      ))}

      {/* sparkling particles drifting around the globe */}
      {SPARKLES.map((sparkle) => (
        <motion.span
          key={sparkle.top + sparkle.left}
          className="absolute rounded-full"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: sparkle.color,
            boxShadow: `0 0 ${sparkle.size * 3}px ${sparkle.size}px ${sparkle.color}99`,
          }}
          animate={reduceMotion ? undefined : { opacity: [0, 1, 0], scale: [0.6, 1.3, 0.6] }}
          transition={{ duration: sparkle.duration, delay: sparkle.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* pulsing connection nodes riding the outer ring */}
      {NODES.map((node) => (
        <motion.span
          key={node.top + node.left}
          className="absolute h-2 w-2 rounded-full bg-[#06B6D4]"
          style={{ top: node.top, left: node.left, boxShadow: "0 0 12px 3px rgba(6,182,212,0.7)" }}
          animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.4, delay: node.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* shooting light streaks */}
      {!reduceMotion &&
        STREAKS.map((streak) => (
          <motion.span
            key={streak.top + streak.left}
            className="absolute h-px w-16 bg-gradient-to-r from-transparent via-[#A78BFA] to-transparent"
            style={{ top: streak.top, left: streak.left, rotate: streak.rotate }}
            animate={{ opacity: [0, 1, 0], x: [0, 60] }}
            transition={{ duration: streak.duration, delay: streak.delay, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          />
        ))}

      {/* glowing tethers toward where the floating panels sit */}
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="tether-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
            <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {TETHERS.map((t) => (
          <motion.line
            key={`${t.x1}-${t.y1}`}
            x1={t.x1}
            y1={t.y1}
            x2={50}
            y2={50}
            stroke="url(#tether-gradient)"
            strokeWidth={0.3}
            strokeDasharray="2 2"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>
    </div>
  );
}

export default GlobeAtmosphere;
