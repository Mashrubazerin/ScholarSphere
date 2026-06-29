"use client";

import React from "react";

interface GlowButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

/**
 * Previously built from 3 stacked, independently-animated `filter: blur()`
 * layers plus SVG <filter> references — that combination of overlapping
 * blurred/animated layers was demanding enough to produce a visible
 * dithered grid artifact across the whole compositing layer at 2x device
 * pixel ratio (confirmed: removing the component entirely eliminated it;
 * trimming the SVG filters alone did not — it's the cumulative layering,
 * not any one piece). A single box-shadow glow renders the same visual
 * idea with one layer instead of three, and matches the glow technique
 * already used everywhere else on this site (scholarship cards, CTA
 * buttons) instead of being a one-off.
 */
const GlowButton = ({ children = "Start Matching", onClick }: GlowButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="relative mx-8 flex h-[52px] w-[180px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(124,58,237,0.7),0_0_56px_rgba(6,182,212,0.35)] active:scale-[0.98]"
    >
      {children}
    </button>
  );
};

export { GlowButton };
