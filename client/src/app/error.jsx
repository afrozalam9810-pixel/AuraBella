"use client";

import { useEffect } from "react";
import { FiAlertOctagon, FiRefreshCw, FiHome } from "react-icons/fi";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-8">
      {/* Animated warning icon */}
      <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
        <FiAlertOctagon className="text-4xl animate-pulse" />
      </div>

      <div className="flex flex-col gap-3 max-w-md">
        <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-wide uppercase">
          Portal Disrupted
        </h2>
        <p className="font-serif italic text-[#9d8bbb] text-sm md:text-base leading-relaxed">
          Our styling gateway has encountered an unexpected runtime anomaly. Let's try to restore alignment.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider text-white"
        >
          <FiRefreshCw className="animate-spin-slow" /> Try Again
        </button>

        <a
          href="/"
          className="btn-outline flex items-center gap-2 px-6 py-3 text-xs md:text-sm font-semibold uppercase tracking-wider text-white border-white/10 hover:border-primary-400"
        >
          <FiHome /> Back to Store
        </a>
      </div>
    </div>
  );
}
