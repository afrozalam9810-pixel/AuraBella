import React from "react";

export default function MobileBottomNavigation() {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-dark-900 border-t border-white/5 py-2 px-4 flex justify-around text-xs text-white/70 z-50 md:hidden pb-safe">
      <button className="flex flex-col items-center">
        <span>🏠</span>
        <span>Home</span>
      </button>
      <button className="flex flex-col items-center">
        <span>📂</span>
        <span>Categories</span>
      </button>
      <button className="flex flex-col items-center">
        <span>❤️</span>
        <span>Wishlist</span>
      </button>
      <button className="flex flex-col items-center">
        <span>🛒</span>
        <span>Cart</span>
      </button>
      <button className="flex flex-col items-center">
        <span>👤</span>
        <span>Profile</span>
      </button>
    </div>
  );
}
