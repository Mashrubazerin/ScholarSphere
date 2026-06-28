"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Mail } from "lucide-react";

import { cn } from "@/lib/utils";

interface FooterLink {
  label: string;
  href: string;
}

const PLATFORM_LINKS: FooterLink[] = [
  { label: "Scholarships", href: "/#current-scholarships" },
  { label: "Universities", href: "#" },
  { label: "Countries", href: "#" },
  { label: "Nova AI", href: "/#nova" },
  { label: "Pricing", href: "#" },
];

const RESOURCE_LINKS: FooterLink[] = [
  { label: "Success Stories", href: "#" },
  { label: "Scholarship Guides", href: "#" },
  { label: "FAQs", href: "#" },
  { label: "Blog", href: "#" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
];

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const linkListVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const linkItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405c1.02.005 2.045.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.225.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.87 0-2.132 1.46-2.132 2.967v5.7h-3v-11h2.879v1.5c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2 3.6 4.59v6.473z" />
    </svg>
  );
}

function SocialIconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#94A3B8] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#7C3AED]/50 hover:text-white hover:shadow-[0_0_16px_rgba(124,58,237,0.45)]"
    >
      {children}
    </a>
  );
}

function FooterLinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <motion.div variants={columnVariants}>
      <h4 className="text-xs uppercase tracking-wide text-white/80 mb-3">{title}</h4>
      <motion.ul variants={linkListVariants} className="space-y-2 text-sm text-[#94A3B8]">
        {links.map((link) => (
          <motion.li key={link.label} variants={linkItemVariants}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

function CreatorCard() {
  return (
    <motion.div variants={columnVariants} className="relative">
      <div
        className="footer-card-glow pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-[#7C3AED]/30 to-[#06B6D4]/30 blur-xl"
        aria-hidden="true"
      />

      <div
        className={cn(
          "footer-card-float group relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl",
          "transition-all duration-300 hover:-translate-y-1 hover:border-[#7C3AED]/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]",
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">Created By</p>
        <p className="footer-gradient-name mt-2 font-display text-xl font-bold">Mashruba Sultana Zerin</p>
        <p className="mt-1 text-xs font-medium text-[#C4B5FD]">Software Engineer • AI Developer</p>
        <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">
          Passionate about building intelligent platforms that make global education more accessible through AI
          and modern web technologies.
        </p>
        <p className="footer-quote-glow mt-4 text-xs italic text-[#67E8F9]">
          &ldquo;Turning ambition into opportunity through technology.&rdquo;
        </p>
      </div>
    </motion.div>
  );
}

export function SiteFooter() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.footer
      initial={reduceMotion ? undefined : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.15 }}
      variants={columnVariants}
      className="relative overflow-hidden border-t border-white/5 bg-[#020617]"
    >
      <div className="footer-divider" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="footer-aurora"
          style={{ top: "-15%", left: "0%", width: "55%", height: "70%", background: "radial-gradient(circle, #7C3AED, transparent 70%)" }}
        />
        <div
          className="footer-aurora"
          style={{ bottom: "-25%", right: "0%", width: "55%", height: "70%", background: "radial-gradient(circle, #06B6D4, transparent 70%)", animationDelay: "-10s" }}
        />
      </div>

      <motion.div
        initial={reduceMotion ? undefined : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="relative mx-auto max-w-7xl px-6 py-16"
      >
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <motion.div variants={columnVariants}>
            <span className="font-display font-semibold text-white text-lg">
              ScholarSphere{" "}
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">AI</span>
            </span>
            <p className="mt-2 text-sm text-[#94A3B8]">Find Your Fully Funded Future</p>
            <p className="mt-3 text-sm text-[#94A3B8] max-w-xs">
              AI-powered scholarship discovery platform helping students unlock fully funded opportunities
              worldwide.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <SocialIconLink href="#" label="GitHub">
                <GithubIcon className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink href="#" label="LinkedIn">
                <LinkedinIcon className="h-4 w-4" />
              </SocialIconLink>
              <SocialIconLink href="mailto:hello@scholarsphere.ai" label="Email">
                <Mail className="h-4 w-4" />
              </SocialIconLink>
            </div>
          </motion.div>

          <FooterLinkColumn title="Platform" links={PLATFORM_LINKS} />
          <FooterLinkColumn title="Resources" links={RESOURCE_LINKS} />
          <FooterLinkColumn title="Company" links={COMPANY_LINKS} />
          <CreatorCard />
        </div>
      </motion.div>

      <div className="relative border-t border-[#7C3AED]/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-center text-xs text-[#94A3B8] sm:flex-row sm:text-left">
          <span>© 2026 ScholarSphere AI. All Rights Reserved.</span>
          <span>Built with Next.js • React • D3.js • Prisma • PostgreSQL • Gemini</span>
          <span>
            Designed &amp; Developed by{" "}
            <a href="#" className="footer-name-link">
              Mashruba Sultana Zerin
            </a>
          </span>
        </div>
      </div>
    </motion.footer>
  );
}

export default SiteFooter;
