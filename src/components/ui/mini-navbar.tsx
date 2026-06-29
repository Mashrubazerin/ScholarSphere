"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { useLenis } from "lenis/react";

function useNavScroll() {
  const lenis = useLenis();

  return (href: string) => {
    const id = href.replace("#", "");
    if (lenis) {
      lenis.scrollTo(`#${id}`, { duration: 1.2 });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };
}

const AnimatedNavLink = ({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: (href: string) => void;
  children: React.ReactNode;
}) => {
  const defaultTextColor = "text-[#94A3B8]";
  const hoverTextColor = "text-white";
  const textSizeClass = "text-sm";

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(href);
      }}
      className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass}`}
    >
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </a>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavScroll();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);
    };
  }, []);

  const logoElement = (
    <a
      href="#home"
      onClick={(e) => {
        e.preventDefault();
        navigate("#home");
      }}
      className="flex items-center gap-2"
    >
      <div className="relative w-7 h-7 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-[#06B6D4]/50" />
        <span className="absolute inset-[-3px] rounded-full border border-[#7C3AED]/30 rotate-45" />
        <Globe
          className="w-4 h-4 relative z-10"
          style={{ color: "#06B6D4" }}
          strokeWidth={2}
        />
      </div>
      <span className="font-display font-semibold tracking-tight text-white text-[15px]">
        ScholarSphere{" "}
        <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
          AI
        </span>
      </span>
    </a>
  );

  const navLinksData = [
    { label: "Home", href: "#home" },
    { label: "Current Scholarships", href: "#current-scholarships" },
    { label: "Nova AI", href: "#nova" },
  ];

  const loginButtonElement = (
    <Link
      href="/login"
      className="px-3 py-2 text-sm text-[#94A3B8] hover:text-white transition-colors duration-200 w-full sm:w-auto text-center"
    >
      Sign In
    </Link>
  );

  const signupButtonElement = (
    <Link
      href="/register"
      className="relative z-10 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] transition-all duration-200 hover:shadow-[0_0_24px_rgba(124,58,237,0.5)] hover:scale-[1.03] w-full sm:w-auto text-center"
    >
      Get Started Free
    </Link>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-[#020617]/85" : "bg-[#020617]/60"
      } backdrop-blur-2xl border-b border-[#7C3AED]/25 shadow-[0_1px_24px_rgba(124,58,237,0.18)]`}
    >
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-x-6">
        {logoElement}

        <nav className="hidden lg:flex items-center space-x-6 text-sm">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.label} href={link.href} onNavigate={navigate}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2">
          {loginButtonElement}
          {signupButtonElement}
        </div>

        <button
          className="sm:hidden flex items-center justify-center w-8 h-8 text-[#94A3B8] focus:outline-none"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`sm:hidden flex flex-col items-center w-full bg-[#0F172A] transition-all ease-in-out duration-300 overflow-hidden ${
          isOpen ? "max-h-[1000px] opacity-100 py-4" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {navLinksData.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#94A3B8] hover:text-white transition-colors w-full text-center"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                navigate(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-3 mt-4 w-full px-6">
          {loginButtonElement}
          {signupButtonElement}
        </div>
      </div>
    </header>
  );
}
