import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ParticlesProvider } from "@/components/providers/particles-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { GraduationCapCursor } from "@/components/ui/graduation-cap-cursor";
import { GlobalPointerVars } from "@/components/ui/global-pointer-vars";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScholarSphere AI — Find Your Fully Funded Future",
  description:
    "ScholarSphere AI is an AI-powered scholarship discovery platform that helps students find fully funded scholarships, universities, and study-abroad opportunities tailored to their academic profile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#020617] text-white font-sans">
        <SessionProvider>
          <GlobalPointerVars />
          <GraduationCapCursor />
          <SmoothScrollProvider>
            <ParticlesProvider>{children}</ParticlesProvider>
          </SmoothScrollProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
