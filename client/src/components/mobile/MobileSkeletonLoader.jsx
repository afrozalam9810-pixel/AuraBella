import React from "react";

export default function MobileSkeletonLoader({ type = "home" }) {
  if (type === "home") {
    return (
      <div className="flex flex-col gap-6 w-full p-4 animate-pulse md:hidden">
        {/* Banner placeholder */}
        <div className="w-full aspect-[16/10] bg-white/5 rounded-2xl" />
        
        {/* Categories row placeholder */}
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-16">
              <div className="w-14 h-14 rounded-full bg-white/5" />
              <div className="w-10 h-3 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Section title placeholder */}
        <div className="w-40 h-6 bg-white/5 rounded mt-4" />

        {/* Products row placeholder */}
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 flex-shrink-0 w-36">
              <div className="bg-white/5 aspect-[3/4] rounded-2xl" />
              <div className="w-2/3 h-3 bg-white/5 rounded" />
              <div className="w-1/2 h-3 bg-white/5 rounded" />
              <div className="w-1/3 h-4 bg-white/5 rounded mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="grid grid-cols-2 gap-3 w-full p-3 animate-pulse md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="bg-white/5 aspect-[3/4] rounded-2xl" />
            <div className="w-2/3 h-3 bg-white/5 rounded" />
            <div className="w-1/2 h-3 bg-white/5 rounded" />
            <div className="w-1/3 h-4 bg-white/5 rounded mt-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full p-4 animate-pulse md:hidden">
      <div className="w-full aspect-square bg-white/5 rounded-2xl" />
      <div className="w-1/3 h-4 bg-white/5 rounded" />
      <div className="w-2/3 h-6 bg-white/5 rounded" />
      <div className="w-1/4 h-5 bg-white/5 rounded" />
      <div className="w-full h-20 bg-white/5 rounded-2xl mt-4" />
    </div>
  );
}
