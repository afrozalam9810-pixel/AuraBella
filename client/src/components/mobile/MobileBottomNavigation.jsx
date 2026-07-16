import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleMobileMenu, closeAll } from "../../store/slices/uiSlice";
import { FiHome, FiGrid, FiHeart, FiShoppingBag, FiUser } from "react-icons/fi";

export default function MobileBottomNavigation() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { totalQty } = useSelector((state) => state.cart);
  const currentPath = location.pathname;

  const handleCategoriesClick = (e) => {
    e.preventDefault();
    dispatch(toggleMobileMenu());
  };

  const handleTabClick = () => {
    dispatch(closeAll());
  };

  const isActive = (path) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-2 flex justify-around items-center text-[10px] text-slate-500 z-[90] md:hidden pb-[calc(8px+env(safe-area-inset-bottom,0px))] shadow-glow-dark">
      {/* Home */}
      <Link
        to="/"
        onClick={handleTabClick}
        className={`flex flex-col items-center gap-1 w-16 transition-colors duration-200 ${
          isActive("/") ? "text-primary-400 font-bold" : "hover:text-slate-900"
        }`}
      >
        <FiHome className="text-lg" />
        <span>Home</span>
      </Link>

      {/* Categories */}
      <button
        onClick={handleCategoriesClick}
        className="flex flex-col items-center gap-1 w-16 transition-colors duration-200 hover:text-slate-900"
      >
        <FiGrid className="text-lg" />
        <span>Categories</span>
      </button>

      {/* Wishlist */}
      <Link
        to="/wishlist"
        onClick={handleTabClick}
        className={`flex flex-col items-center gap-1 w-16 transition-colors duration-200 ${
          isActive("/wishlist") ? "text-primary-400 font-bold" : "hover:text-slate-900"
        }`}
      >
        <FiHeart className="text-lg" />
        <span>Wishlist</span>
      </Link>

      {/* Cart */}
      <Link
        to="/cart"
        onClick={handleTabClick}
        className={`flex flex-col items-center gap-1 w-16 transition-colors duration-200 relative ${
          isActive("/cart") ? "text-primary-400 font-bold" : "hover:text-slate-900"
        }`}
      >
        <FiShoppingBag className="text-lg" />
        {totalQty > 0 && (
          <span className="absolute top-0 right-3 bg-brand-gradient text-white text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-glow-rose">
            {totalQty}
          </span>
        )}
        <span>Cart</span>
      </Link>

      {/* Profile */}
      <Link
        to="/account"
        onClick={handleTabClick}
        className={`flex flex-col items-center gap-1 w-16 transition-colors duration-200 ${
          isActive("/account") || isActive("/login") || isActive("/register")
            ? "text-primary-400 font-bold"
            : "hover:text-slate-900"
        }`}
      >
        <FiUser className="text-lg" />
        <span>Profile</span>
      </Link>
    </div>
  );
}
