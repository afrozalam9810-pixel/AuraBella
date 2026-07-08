import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import {
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import { toggleMobileMenu, closeAll } from "../store/slices/uiSlice";
import { logout } from "../store/slices/authSlice";

const NAVIGATION_LINKS = [
  { name: "Clothing", slug: "clothing" },
  { name: "Footwear", slug: "footwear" },
  { name: "Makeup", slug: "makeup" },
  { name: "Jewellery", slug: "jewellery" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalQty } = useSelector((state) => state.cart);
  const { mobileMenuOpen } = useSelector((state) => state.ui);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
      dispatch(closeAll());
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setAccountDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-white/5 rounded-none backdrop-blur-md">
      {/* Promotion bar */}
      <div className="w-full bg-brand-gradient text-center py-1 text-[10px] md:text-xs font-sans font-medium tracking-widest text-white uppercase select-none">
        ✦ Free shipping on orders above ₹2000 | Use Code: AURA10 ✦
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Mobile Menu Icon */}
        <button
          onClick={() => dispatch(toggleMobileMenu())}
          className="text-white hover:text-primary-400 md:hidden text-2xl transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Brand Logo */}
        <Link to="/" onClick={() => dispatch(closeAll())} className="flex-shrink-0">
          <span className="font-display font-bold text-2xl md:text-3xl tracking-wider text-white gradient-text">
            AuraBella
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-sm font-medium tracking-wide">
          {NAVIGATION_LINKS.map((link) => (
            <Link
              key={link.slug}
              to={`/category/${link.slug}`}
              className="text-[#f0e8ff]/85 hover:text-white transition-colors relative group py-2"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-gradient transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-full max-w-[200px] lg:max-w-[280px]">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-full py-2 pl-4 pr-10 text-white font-sans transition-all duration-300"
          />
          <button type="submit" className="absolute right-3 text-white/50 hover:text-primary-400 transition-colors">
            <FiSearch />
          </button>
        </form>

        {/* Actions Menu */}
        <div className="flex items-center gap-4 md:gap-6 text-white text-lg">
          {/* Mobile Search Button (routes to home or opens search modal, here redirect to home) */}
          <Link to="/" className="md:hidden hover:text-primary-400 transition-colors">
            <FiSearch />
          </Link>

          {/* Wishlist */}
          <Link to="/wishlist" className="hover:text-primary-400 transition-colors relative">
            <FiHeart />
          </Link>

          {/* Cart Icon with badge count */}
          <Link to="/cart" className="hover:text-primary-400 transition-colors relative flex items-center">
            <FiShoppingBag />
            {totalQty > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-brand-gradient text-white text-[9px] font-sans font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-glow shadow-glow-rose">
                {totalQty}
              </span>
            )}
          </Link>

          {/* Account Dropdown */}
          <div className="relative">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-1.5 text-sm hover:text-primary-400 transition-colors py-1.5 focus:outline-none"
                >
                  <FiUser className="text-lg" />
                  <span className="hidden lg:inline-block max-w-[80px] truncate text-white/90">
                    {user?.name.split(" ")[0]}
                  </span>
                  <FiChevronDown className={`text-xs transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 glass-card border border-white/10 rounded-xl overflow-hidden py-1 shadow-card-hover animate-fade-in bg-dark-800">
                    <Link
                      to="/account"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#f0e8ff]/85 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <FiUser /> Profile Account
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#f0e8ff]/85 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <FiShoppingBag /> My Orders
                    </Link>
                    <hr className="border-white/5 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 hover:text-primary-400 transition-colors text-sm">
                <FiUser className="text-lg" />
                <span className="hidden md:inline font-sans font-medium text-xs">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[88px] bg-dark-900 border-b border-white/5 py-6 px-6 shadow-card animate-slide-up">
          {/* Categories Links */}
          <nav className="flex flex-col gap-4 font-sans text-sm font-semibold tracking-wide">
            {NAVIGATION_LINKS.map((link) => (
              <Link
                key={link.slug}
                to={`/category/${link.slug}`}
                onClick={() => dispatch(closeAll())}
                className="text-[#f0e8ff]/85 hover:text-white py-2 border-b border-white/5"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
