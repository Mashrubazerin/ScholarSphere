"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * Replaces the system cursor with a floating graduation-cap glyph (gradient
 * fill + glow filter standing in for "3D", since this project has no WebGL
 * renderer to do a literal 3D model). Fine-pointer only — touch devices have
 * no hover cursor to replace, and forcing this on would just be dead code
 * there. Text inputs are excluded in CSS so typing keeps a real caret.
 */
export function GraduationCapCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rotate = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 700, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 700, damping: 40, mass: 0.4 });
  const springRotate = useSpring(rotate, { stiffness: 260, damping: 25 });

  React.useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // `enabled` starts false so SSR and the pre-hydration client render match
    // (no `window` on the server); this effect's only job is flipping it once
    // we know, client-only, whether a real pointer device is present.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.body.classList.add("cap-cursor-active");

    let lastX = window.innerWidth / 2;

    function handleMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!reduceMotion) {
        rotate.set(Math.max(-20, Math.min(20, (e.clientX - lastX) * 0.9)));
      }
      lastX = e.clientX;
    }

    // passive: true — this handler never calls preventDefault, so the
    // browser doesn't need to block scrolling/other input on this listener
    // to check whether it might.
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.body.classList.remove("cap-cursor-active");
    };
  }, [reduceMotion, rotate, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-[15%] -translate-y-[10%]"
      style={{ x: springX, y: springY, rotate: reduceMotion ? 0 : springRotate }}
    >
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: "drop-shadow(0 3px 8px rgba(2,6,23,0.6)) drop-shadow(0 0 8px rgba(124,58,237,0.65)) drop-shadow(0 0 4px rgba(6,182,212,0.55))",
        }}
      >
        <defs>
          <linearGradient id="cap-cursor-gradient" x1="1" y1="3" x2="22" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <path d="M12 2.5 1 8l11 5.5L22 8 12 2.5Z" fill="url(#cap-cursor-gradient)" />
        <path
          d="M5.5 10.6V15c0 1.4 2.9 3 6.5 3s6.5-1.6 6.5-3v-4.4L12 15.1 5.5 10.6Z"
          fill="url(#cap-cursor-gradient)"
          opacity="0.8"
        />
        <path d="M21 9v5.2" stroke="url(#cap-cursor-gradient)" strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="21" cy="14.6" r="0.9" fill="#22D3EE" />
      </svg>
    </motion.div>
  );
}

export default GraduationCapCursor;
