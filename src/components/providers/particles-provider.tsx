"use client";

import type { ReactNode } from "react";
import type { Engine } from "@tsparticles/engine";
import { ParticlesProvider as TsParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const initParticles = async (engine: Engine) => {
  await loadSlim(engine);
};

export function ParticlesProvider({ children }: { children: ReactNode }) {
  return (
    <TsParticlesProvider init={initParticles}>{children}</TsParticlesProvider>
  );
}
