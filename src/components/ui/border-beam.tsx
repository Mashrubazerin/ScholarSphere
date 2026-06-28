"use client";

import { CSSProperties, useEffect, useRef } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  lightWidth?: number;
  duration?: number;
  lightColor?: string;
  borderWidth?: number;
  className?: string;
}

export function BorderBeam({
  lightWidth = 200,
  duration = 10,
  lightColor = "#7C3AED",
  borderWidth = 1,
  className,
}: BorderBeamProps) {
  const pathRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePath = () => {
      const div = pathRef.current;
      if (!div) return;
      div.style.setProperty(
        "--path",
        `path("M 0 0 H ${div.offsetWidth} V ${div.offsetHeight} H 0 V 0")`,
      );
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    return () => window.removeEventListener("resize", updatePath);
  }, []);

  return (
    <div
      ref={pathRef}
      style={
        {
          "--duration": duration,
          "--border-width": `${borderWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full w-full rounded-[inherit]",
        "after:absolute after:inset-[var(--border-width)] after:rounded-[inherit] after:content-['']",
        "border-[length:var(--border-width)] [mask-clip:padding-box,border-box]!",
        "[mask-composite:intersect]! [mask:linear-gradient(transparent,transparent),linear-gradient(red,red)]",
        "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:border-[length:var(--border-width)] before:border-white/10",
        className,
      )}
    >
      <motion.div
        className="absolute inset-0 aspect-square bg-[radial-gradient(ellipse_at_center,var(--light-color),transparent,transparent)]"
        style={
          {
            "--light-color": lightColor,
            "--light-width": `${lightWidth}px`,
            width: "var(--light-width)",
            offsetPath: "var(--path)",
          } as CSSProperties
        }
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default BorderBeam;
