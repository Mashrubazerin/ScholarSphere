"use client";

import React, { useState, useEffect } from "react";

interface DotCardProps {
  target?: number;
  duration?: number;
  label?: string;
  formatValue?: (value: number) => string;
}

export default function DotCard({
  target = 777000,
  duration = 2000,
  label = "Views",
  formatValue,
}: DotCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const range = end - start;
    if (range <= 0) return;
    const increment = Math.ceil(end / (duration / 50));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 50);
    return () => clearInterval(timer);
  }, [target, duration]);

  const display = formatValue
    ? formatValue(count)
    : count < 1000
      ? count
      : `${Math.floor(count / 1000)}k`;

  return (
    <div className="dot-card-outer">
      <div className="dot-card-dot" />
      <div className="dot-card-card">
        <div className="dot-card-ray" />
        <div className="dot-card-text">{display}</div>
        <div className="dot-card-label">{label}</div>
        <div className="dot-card-line topl" />
        <div className="dot-card-line leftl" />
        <div className="dot-card-line bottoml" />
        <div className="dot-card-line rightl" />
      </div>
    </div>
  );
}
