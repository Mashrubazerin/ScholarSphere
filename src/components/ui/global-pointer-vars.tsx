"use client";

import * as React from "react";

/**
 * Writes the cursor position into CSS custom properties on the document
 * root, once, for every spotlight-card consumer on the page to read via
 * normal CSS inheritance (see current-scholarship-card.tsx /
 * .spotlight-gradient-edge in globals.css). Previously each card ran its
 * own copy of this same document-level pointermove listener — harmless
 * with one card, but with up to 7 visible at once in the scholarships fan,
 * that was 7 redundant global listeners all firing (and each writing 4
 * inline styles) on every mouse movement anywhere on the page.
 */
export function GlobalPointerVars() {
  React.useEffect(() => {
    const root = document.documentElement;

    function syncPointer(e: PointerEvent) {
      const { clientX: x, clientY: y } = e;
      root.style.setProperty("--x", x.toFixed(2));
      root.style.setProperty("--xp", (x / window.innerWidth).toFixed(2));
      root.style.setProperty("--y", y.toFixed(2));
      root.style.setProperty("--yp", (y / window.innerHeight).toFixed(2));
    }

    document.addEventListener("pointermove", syncPointer, { passive: true });
    return () => document.removeEventListener("pointermove", syncPointer);
  }, []);

  return null;
}

export default GlobalPointerVars;
