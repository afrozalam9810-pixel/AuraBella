import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { closeAll } from "../../store/slices/uiSlice";
import { logout } from "../../store/slices/authSlice";
import { FiX, FiChevronDown, FiUser, FiHeart, FiShoppingBag, FiInfo, FiMail, FiFileText, FiLogOut } from "react-icons/fi";

const CATEGORIES_MENU = [
  { name: "Women", sub: ["Dresses", "Tops & Tees", "Sarees", "Kurtas", "Skirts"] },
  { name: "Men", sub: ["Shirts", "T-shirts", "Jeans", "Trousers", "Jackets"] },
  { name: "Kids", sub: ["Boys", "Girls", "Infants", "Toys"] },
  { name: "Jewellery", sub: ["Necklaces", "Earrings", "Rings", "Bracelets"] },
  { name: "Beauty", sub: ["Skincare", "Makeup Essentials", "Fragrances", "Haircare"] },
  { name: "Footwear", sub: ["Heels", "Sneakers", "Flats", "Boots"] },
  { name: "Accessories", sub: ["Bags", "Belts", "Sunglasses", "Watches"] },
];

export default function MobileDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const drawerRef = useRef(null);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [expandedSection, setExpandedSection] = useState(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key close & Focus return
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;
    
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const focusableElements = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    firstElement.focus();
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeAll());
    navigate("/login");
  };

  const handleLinkClick = () => {
    dispatch(closeAll());
  };

  const toggleExpand = (sectionName) => {
    if (expandedSection === sectionName) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionName);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 md:hidden ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Body */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Drawer"
        className={`absolute top-0 left-0 bottom-0 w-[290px] sm:w-[320px] bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Section / User Profile */}
        <div className="bg-brand-gradient p-5 flex flex-col gap-4 relative">
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="absolute top-4 right-4 text-white hover:scale-110 transition-transform p-1 bg-black/20 rounded-full"
          >
            <FiX className="text-lg" />
          </button>

          <Link to="/" onClick={handleLinkClick} className="w-fit">
            <span className="font-display font-bold text-2xl tracking-wider text-white">
              AuraBella
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 mt-2 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold text-lg uppercase">
                {user?.name?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="font-sans font-semibold text-sm truncate">{user?.name}</p>
                <p className="font-sans text-xs text-white/70 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 mt-2">
              <p className="font-sans font-medium text-xs text-white/80">Welcome to AuraBella</p>
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="w-fit text-xs font-sans font-bold bg-white text-dark-950 px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors uppercase tracking-wider"
              >
                Login / Register
              </Link>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-grow overflow-y-auto py-4 px-3 flex flex-col gap-0.5 custom-scrollbar">
          {/* Shop categories */}
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 mb-2">
            Shop Categories
          </div>

          {CATEGORIES_MENU.map((item) => {
            const isExpanded = expandedSection === item.name;
            return (
              <div key={item.name} className="flex flex-col border-b border-slate-100 pb-1">
                <button
                  onClick={() => toggleExpand(item.name)}
                  aria-expanded={isExpanded}
                  className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg text-sm text-slate-900 font-medium hover:bg-slate-50 transition-all text-left"
                >
                  <span>{item.name}</span>
                  <FiChevronDown
                    className={`text-xs transition-transform duration-200 text-slate-500 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Subcategory List with smooth max-height accordion */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-[250px] opacity-100 mt-1" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-1 pl-4 pr-2">
                    {item.sub.map((subItem) => (
                      <Link
                        key={subItem}
                        to={`/category/${item.name.toLowerCase()}?subCategory=${encodeURIComponent(subItem)}`}
                        onClick={handleLinkClick}
                        className="py-2 px-3 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                      >
                        {subItem}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Links */}
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 mt-6 mb-2">
            Quick Links
          </div>

          <Link
            to="/wishlist"
            onClick={handleLinkClick}
            className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            <FiHeart className="text-slate-500" />
            <span>Wishlist</span>
          </Link>

          <Link
            to={isAuthenticated ? "/account/orders" : "/login"}
            onClick={handleLinkClick}
            className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            <FiShoppingBag className="text-slate-500" />
            <span>My Orders</span>
          </Link>

          <Link
            to={isAuthenticated ? "/account" : "/login"}
            onClick={handleLinkClick}
            className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            <FiUser className="text-slate-500" />
            <span>My Profile</span>
          </Link>

          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 mt-6 mb-2">
            Support & Policies
          </div>

          <Link
            to="/contact"
            onClick={handleLinkClick}
            className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            <FiMail className="text-slate-500" />
            <span>Contact Support</span>
          </Link>

          <Link
            to="/about"
            onClick={handleLinkClick}
            className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            <FiInfo className="text-slate-500" />
            <span>About AuraBella</span>
          </Link>

          <Link
            to="/return-policy"
            onClick={handleLinkClick}
            className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            <FiFileText className="text-slate-500" />
            <span>Return Policy</span>
          </Link>

          <Link
            to="/privacy"
            onClick={handleLinkClick}
            className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-slate-900 font-medium hover:bg-slate-50 transition-colors"
          >
            <FiFileText className="text-slate-500" />
            <span>Privacy Policy</span>
          </Link>
        </div>

        {/* Footer section / Logout */}
        {isAuthenticated && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
