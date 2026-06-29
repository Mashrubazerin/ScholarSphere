"use client";

import { ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLenis } from "lenis/react";

import { GlowButton } from "@/components/ui/shiny-button-1";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ShimmerText } from "@/components/ui/shimmer-text";

export function CtaSection() {
  const router = useRouter();
  const { status } = useSession();
  const lenis = useLenis();

  function handleStartForFree() {
    router.push(status === "authenticated" ? "/dashboard" : "/register");
  }

  function handleHowItWorks() {
    if (lenis) {
      lenis.scrollTo("#nova", { duration: 1.2 });
    } else {
      document.getElementById("nova")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.18), transparent 65%)",
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <ScrollReveal>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Ready to Find Your{" "}
            <ShimmerText variant="cyan" className="font-display text-3xl sm:text-4xl font-bold">
              Fully Funded Future?
            </ShimmerText>
          </h2>
          <p className="mt-4 text-[#94A3B8]">
            Create your free ScholarSphere AI account and discover scholarships, universities, and funding
            opportunities tailored to your academic profile. Let Nova AI guide you from exploration to
            application—all in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <GlowButton onClick={handleStartForFree}>Start for Free</GlowButton>
            <button
              onClick={handleHowItWorks}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white border border-[#7C3AED]/50 rounded-lg hover:bg-[#7C3AED]/10 hover:border-[#7C3AED] transition-colors"
            >
              How It Works
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15} className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-base font-semibold text-white">🚀 Start for Free</p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Create your account in minutes and unlock personalized scholarship recommendations, save
              opportunities, and build your study-abroad journey.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-base font-semibold text-white">🤖 How It Works</p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Complete your academic profile, let Nova AI analyze your qualifications, and receive
              scholarship matches ranked by eligibility, funding, and deadlines.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default CtaSection;
