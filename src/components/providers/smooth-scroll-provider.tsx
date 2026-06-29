"use client";

import * as React from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Syncs GSAP's ticker to Lenis's RAF loop and tells ScrollTrigger to
 * recompute on every Lenis scroll event — the standard wiring for using
 * GSAP ScrollTrigger (CinematicIntro, scroll-reveal sections) on top of
 * Lenis's virtualized scroll instead of native browser scroll events.
 */
function useLenisGsapSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });

  React.useEffect(() => {
    gsap.ticker.lagSmoothing(0);
  }, []);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    // Lenis's eased-follow scrolling is itself a motion effect — skip it
    // entirely for reduced-motion users instead of just disabling easing.
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: true, lerp: 0.1, duration: 1.2 }}>
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}

function LenisGsapBridge() {
  useLenisGsapSync();
  return null;
}

export default SmoothScrollProvider;
