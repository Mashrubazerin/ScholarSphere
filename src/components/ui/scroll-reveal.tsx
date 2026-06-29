"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
}

/**
 * A one-time fade/slide/scale-in reveal driven by GSAP ScrollTrigger, used
 * across every normal-scroll section (Hero, Scholarships, Nova AI, CTA) for
 * a consistent premium feel without scroll-jacking anything — `once: true`
 * just toggles the animation when the element crosses 85% up the viewport,
 * the same trigger point motion/react's `whileInView` would use, so it
 * composes safely with sections that have their own drag/input
 * interactions (the scholarship card carousel, Nova's chat input).
 */
export function ScrollReveal({ children, className, delay = 0, x = 0, y = 32, scale = 0.97 }: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (reduceMotion || !ref.current) return;
    const el = ref.current;

    gsap.set(el, { opacity: 0, x, y, scale });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(el, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, delay, ease: "power3.out" });
      },
    });

    return () => trigger.kill();
  }, [reduceMotion, delay, x, y, scale]);

  return <div ref={ref} className={className}>{children}</div>;
}

export default ScrollReveal;
