import React from "react";

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-50 bg-dark-900 border-b border-white/5 px-4 py-3 text-white flex justify-between items-center md:hidden">
      <div className="font-semibold">☰ Hamburger</div>
      <div className="font-display font-bold text-xl tracking-wider gradient-text">AuraBella</div>
      <div className="flex gap-3">🔍 👤 🛒</div>
    </header>
  );
}
