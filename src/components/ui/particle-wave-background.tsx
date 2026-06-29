"use client";

import * as React from "react";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

interface ParticleWaveBackgroundProps {
  className?: string;
  /** Grid is density x density particles. */
  density?: number;
  speed?: number;
  amplitude?: number;
  separation?: number;
  particleColor?: string;
}

// A plain canvas.getContext() probe returns null on failure with no console
// noise — checking this first lets us skip the wave silently when WebGL is
// unavailable, instead of letting THREE.WebGLRenderer's own constructor run:
// it calls console.error() internally before throwing, and Next.js's dev
// overlay flags that console.error regardless of whether the exception
// thrown afterward gets caught.
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function createParticleMaterial(color: string): THREE.SpriteMaterial {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2, true);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return new THREE.SpriteMaterial({ map: texture, transparent: true });
}

/**
 * A WebGL plane of sprites rippling in a sine wave, with the camera
 * parallaxing toward the cursor. Adapted from a standalone demo component:
 * stripped of its debug control panel (sliders/color pickers/a third-party
 * promo button — none of that belongs in production), given a transparent
 * background so it layers over the page's existing dark theme instead of
 * painting a flat color, and sized to its container instead of the window.
 */
export function ParticleWaveBackground({
  className,
  density = 36,
  speed = 0.08,
  amplitude = 45,
  separation = 110,
  particleColor = "#A78BFA",
}: ParticleWaveBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    // A field of particles rippling on a permanent loop is exactly the kind
    // of motion prefers-reduced-motion users are opting out of — skip
    // mounting the scene at all rather than rendering it motionless.
    if (reduceMotion) return;

    const container = containerRef.current;
    if (!container) return;

    // The browser's GPU process can run out of WebGL contexts (too many
    // tabs/demos open, or contexts leaked across a long dev session) — skip
    // mounting the scene silently rather than letting THREE.WebGLRenderer's
    // constructor run and log its own console.error about it.
    if (!isWebGLAvailable()) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
    camera.position.set(0, 800, 1000);

    const scene = new THREE.Scene();

    // Transparent canvas — an opaque clear color paints a flat rectangle
    // over the camera's empty "sky" region (it looks down at the particle
    // field from above, so the top portion of the frame has no geometry),
    // which shows up as a visible seam against the page's actual gradient
    // background behind it.
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearAlpha(0);
    container.appendChild(renderer.domElement);

    const material = createParticleMaterial(particleColor);
    const particles: THREE.Sprite[] = [];

    // Random jitter on x/z breaks up the otherwise-perfect lattice — a
    // perfectly regular grid of particles reads as a visible grid pattern
    // at a distance regardless of individual particle brightness/size.
    for (let ix = 0; ix < density; ix++) {
      for (let iy = 0; iy < density; iy++) {
        const particle = new THREE.Sprite(material);
        const jitterX = (Math.random() - 0.5) * separation * 0.7;
        const jitterZ = (Math.random() - 0.5) * separation * 0.7;
        particle.position.x = ix * separation - (density * separation) / 2 + jitterX;
        particle.position.z = iy * separation - (density * separation) / 2 + jitterZ;
        particle.position.y = -400;
        particle.scale.setScalar(10);
        particles.push(particle);
        scene.add(particle);
      }
    }

    const mouse = { x: 0, y: 0 };
    let windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let count = 0;
    let animationId = 0;
    let isVisible = true;

    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.clientX - windowHalf.x;
      mouse.y = e.clientY - windowHalf.y;
    }

    // No preventDefault here (unlike the original demo) — this listens on
    // `document`, so blocking the default would break page scroll on touch.
    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      mouse.x = e.touches[0].clientX - windowHalf.x;
      mouse.y = e.touches[0].clientY - windowHalf.y;
    }

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      camera.aspect = width / height || 1;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    function animate() {
      animationId = requestAnimationFrame(animate);
      if (!isVisible) return;

      camera.position.x += (mouse.x - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      let i = 0;
      for (let ix = 0; ix < density; ix++) {
        for (let iy = 0; iy < density; iy++) {
          const particle = particles[i++];
          if (!particle) continue;
          particle.position.y = -400 + Math.sin((ix + count) * 0.3) * amplitude + Math.sin((iy + count) * 0.5) * amplitude;
          const scale = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;
          particle.scale.setScalar(scale * 2);
        }
      }

      renderer.render(scene, camera);
      count += speed;
    }

    // Heavier than a CSS animation — stop rendering once scrolled offscreen.
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      particles.forEach((particle) => scene.remove(particle));
      material.map?.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reduceMotion, density, speed, amplitude, separation, particleColor]);

  return <div ref={containerRef} className={cn("absolute inset-0", className)} aria-hidden="true" />;
}

export default ParticleWaveBackground;
