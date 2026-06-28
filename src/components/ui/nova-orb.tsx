"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface NovaOrbProps {
  size?: number | string;
  className?: string;
}

const RING_COUNT = 10;
const RING_COLORS = ["#7C3AED", "#06B6D4", "#3B82F6"];

const rings = Array.from({ length: RING_COUNT }, (_, i) => {
  const step = 90 / (RING_COUNT / 2);
  return {
    axis: i % 2 === 0 ? "Y" : "X",
    angle: i * step,
    color: RING_COLORS[i % RING_COLORS.length],
  };
});

export function NovaOrb({ size = 380, className }: NovaOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 120,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative mx-auto flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* ambient halo */}
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.35), transparent 65%)" }}
      />
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle at 60% 35%, rgba(6,182,212,0.3), transparent 60%)" }}
      />

      {/* pulsing radar rings */}
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-[#06B6D4]/40"
          style={{ width: "72%", height: "72%" }}
          animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 2, ease: "easeInOut" }}
        />
      ))}

      {/* glowing core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "44%",
          height: "44%",
          background:
            "radial-gradient(circle at 35% 30%, #ffffff 0%, #c4b5fd 22%, #7c3aed 52%, #3b82f6 78%, transparent 100%)",
          boxShadow:
            "0 0 60px 12px rgba(124,58,237,0.55), 0 0 130px 40px rgba(6,182,212,0.25)",
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* wireframe lattice (mouse-tilt wrapper -> continuous spin wrapper -> static rings) */}
      <motion.div
        className="absolute inset-[6%]"
        style={{ perspective: 900, rotateX, rotateY }}
      >
        <div className="nova-orb-spin relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {rings.map((ring, i) => (
            <div
              key={i}
              className="nova-orb-ring"
              style={{
                transform: ring.axis === "Y" ? `rotateY(${ring.angle}deg)` : `rotateX(${ring.angle}deg)`,
                borderColor: ring.color,
                boxShadow: `0 0 16px ${ring.color}`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* orbiting sparks */}
      <div className="nova-orb-orbit absolute inset-[2%]">
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[#06B6D4] shadow-[0_0_12px_3px_rgba(6,182,212,0.8)]" />
      </div>
      <div
        className="nova-orb-orbit absolute inset-[14%]"
        style={{ animationDuration: "13s", animationDirection: "reverse" }}
      >
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#A78BFA] shadow-[0_0_10px_3px_rgba(167,139,250,0.8)]" />
      </div>
    </div>
  );
}

export default NovaOrb;
