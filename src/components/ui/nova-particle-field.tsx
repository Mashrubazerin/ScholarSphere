"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NovaParticleFieldProps {
  className?: string;
}

function generateStarShadow(count: number, color: string) {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadows.push(`${x}px ${y}px ${color}`);
  }
  return shadows.join(", ");
}

export function NovaParticleField({ className }: NovaParticleFieldProps) {
  const [smallStars, setSmallStars] = useState("");
  const [mediumStars, setMediumStars] = useState("");
  const [largeStars, setLargeStars] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSmallStars(generateStarShadow(400, "#FFFFFF"));
      setMediumStars(generateStarShadow(120, "#C4B5FD"));
      setLargeStars(generateStarShadow(60, "#67E8F9"));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-[#020617]", className)}
      aria-hidden="true"
    >
      {/* ambient color blobs for the dark-space theme */}
      <div
        className="absolute -left-1/4 top-0 h-[60%] w-[60%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)" }}
      />
      <div
        className="absolute -right-1/4 bottom-0 h-[60%] w-[60%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.16), transparent 70%)" }}
      />
      <div
        className="absolute left-1/3 top-1/3 h-[40%] w-[40%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)" }}
      />

      {/* drifting starfield */}
      <div className="nova-stars" style={{ boxShadow: smallStars, animationDuration: "140s" }} />
      <div
        className="nova-stars"
        style={{ width: 2, height: 2, boxShadow: mediumStars, animationDuration: "110s" }}
      />
      <div
        className="nova-stars"
        style={{ width: 3, height: 3, boxShadow: largeStars, animationDuration: "80s" }}
      />
    </div>
  );
}

export default NovaParticleField;
