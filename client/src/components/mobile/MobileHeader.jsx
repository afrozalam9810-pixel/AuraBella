import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiMenu, FiHeart, FiShoppingBag, FiSearch, FiX } from "react-icons/fi";
import { toggleMobileMenu, closeAll } from "../../store/slices/uiSlice";
import MobileDrawer from "./MobileDrawer";

export default function MobileHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totalQty } = useSelector((state) => state.cart);
  const { mobileMenuOpen } = useSelector((state) => state.ui);
  
  // Search Query State
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-card border-b border-white/5 rounded-none backdrop-blur-md md:hidden">
        {/* Promotion bar */}
        <div className="w-full bg-brand-gradient text-center py-1 text-[9px] font-sans font-medium tracking-widest text-white uppercase select-none">
          ✦ Use Code: AURA10 for 10% Off ✦
        </div>

        <div className="px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: Hamburger menu toggle */}
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            aria-label="Toggle Navigation Drawer"
            className="text-white text-2xl transition-colors hover:text-primary-400 p-1"
          >
            <FiMenu />
          </button>

          {/* Center: Brand Logo */}
          <Link
            to="/"
            onClick={() => dispatch(closeAll())}
            className="flex-shrink-0"
            aria-label="AuraBella homepage"
          >
            <span className="font-display font-bold text-xl tracking-wider text-white gradient-text">
              AuraBella
            </span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-3.5 text-white text-xl">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              onClick={() => dispatch(closeAll())}
              aria-label="View wishlist"
              className="hover:text-primary-400 transition-colors p-1"
            >
              <FiHeart />
            </Link>

            {/* Cart Link with count badge */}
            <Link
              to="/cart"
              onClick={() => dispatch(closeAll())}
              aria-label="View cart"
              className="hover:text-primary-400 transition-colors relative p-1 flex items-center"
            >
              <FiShoppingBag />
              {totalQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-gradient text-white text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse-glow shadow-glow-rose">
                  {totalQty}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Permanent Search Bar */}
        <div className="border-t border-white/5 bg-dark-950/40 p-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input
              type="text"
              placeholder="Search for Dresses, Sarees, Jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-full py-2.5 pl-4 pr-10 text-white font-sans transition-all duration-300"
            />
            <button
              type="submit"
              aria-label="Submit search query"
              className="absolute right-4 text-white/50 hover:text-primary-400 transition-colors flex items-center"
            >
              <FiSearch className="text-base" />
            </button>
          </form>
        </div>
      </header>

      {/* Navigation Drawer Portal */}
      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => dispatch(closeAll())} />
    </>
  );
}
