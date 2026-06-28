"use client";

import React, { useId } from "react";

interface GlowButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

const GlowButton = ({ children = "Start Matching", onClick }: GlowButtonProps) => {
  const id = useId().replace(/:/g, "");
  const filters = {
    unopaq: `unopaq-${id}`,
    unopaq2: `unopaq2-${id}`,
    unopaq3: `unopaq3-${id}`,
  };

  return (
    <div className="relative mx-8 group">
      {/* SVG Filters */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter width="300%" x="-100%" height="300%" y="-100%" id={filters.unopaq}>
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 9 0" />
        </filter>
        <filter width="300%" x="-100%" height="300%" y="-100%" id={filters.unopaq2}>
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 3 0" />
        </filter>
        <filter width="300%" x="-100%" height="300%" y="-100%" id={filters.unopaq3}>
          <feColorMatrix values="1 0 0 0.2 0 0 1 0 0.2 0 0 0 1 0.2 0 0 0 0 2 0" />
        </filter>
      </svg>

      {/* Hidden Button */}
      <button
        onClick={onClick}
        className="absolute w-[180px] h-[52px] z-20 outline-none border-none rounded-[17px] cursor-pointer opacity-0"
      />

      {/* Backdrop */}
      <div className="absolute dark:inset-[-9900%] dark:bg-[radial-gradient(circle_at_50%_50%,#0000_0,#0000_20%,#111111aa_50%)] bg-[length:3px_3px] -z-10" />

      {/* Button Container */}
      <div className="relative">
        {/* Outer Glow Layer */}
        <div
          className="absolute inset-0 -z-20 opacity-50 overflow-hidden transition-opacity duration-300
                     group-hover:opacity-75 group-active:opacity-100"
          style={{ filter: `blur(2em) url(#${filters.unopaq})` }}
        >
          <div
            className="absolute inset-[-150%] group-hover:animate-[speen_8s_cubic-bezier(0.56,0.15,0.28,0.86)_infinite,woah_4s_infinite]"
            style={{
              background: "linear-gradient(90deg, #7C3AED 30%, #0000 50%, #06B6D4 70%)",
            }}
          />
        </div>

        {/* Middle Glow Layer */}
        <div
          className="absolute inset-[-0.125em] -z-20 opacity-50 overflow-hidden transition-opacity duration-300
                     group-hover:opacity-75 group-active:opacity-100"
          style={{
            filter: `blur(0.25em) url(#${filters.unopaq2})`,
            borderRadius: "0.75em",
          }}
        >
          <div
            className="absolute inset-[-150%] group-hover:animate-[speen_8s_cubic-bezier(0.56,0.15,0.28,0.86)_infinite,woah_4s_infinite]"
            style={{
              background: "linear-gradient(90deg, #8B5CF6 20%, #0000 45% 55%, #22D3EE 80%)",
            }}
          />
        </div>

        {/* Button Border */}
        <div className="p-0.5 bg-[#0005] rounded-[17px]">
          <div className="relative">
            {/* Inner Glow Layer */}
            <div
              className="absolute inset-[-2px] -z-10 opacity-50 overflow-hidden transition-opacity duration-300
                         group-hover:opacity-75 group-active:opacity-100"
              style={{
                filter: `blur(2px) url(#${filters.unopaq3})`,
                borderRadius: "inherit",
              }}
            >
              <div
                className="absolute inset-[-150%] group-hover:animate-[speen_8s_cubic-bezier(0.56,0.15,0.28,0.86)_infinite,woah_4s_infinite]"
                style={{
                  background: "linear-gradient(90deg, #A78BFA 30%, #0000 45% 55%, #67E8F9 70%)",
                }}
              />
            </div>

            {/* Button Surface */}
            <div
              className="flex flex-col items-center justify-center w-[180px] h-[52px] rounded-[16px] text-white font-semibold overflow-hidden bg-gradient-to-br from-[#7C3AED] to-[#3B82F6]"
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { GlowButton };
