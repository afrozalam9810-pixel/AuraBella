import { Link } from "react-router-dom";
import { SiVisa, SiMastercard, SiStripe, SiPaypal } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="w-full bg-dark-900 border-t border-white/5 py-12 md:py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <Link to="/">
            <span className="font-display font-bold text-2xl tracking-wider text-white gradient-text">
              AuraBella
            </span>
          </Link>
          <p className="font-sans text-xs text-[#9d8bbb] leading-relaxed max-w-xs">
            Indulge in premium beauty, skincare, and luxury accessories curated specifically to align with and amplify your natural aura.
          </p>
          {/* Payment Icons */}
          <div className="flex items-center gap-3 text-white/40 text-2xl mt-2">
            <SiVisa className="hover:text-[#1A1F71] transition-colors" />
            <SiMastercard className="hover:text-[#EB001B] transition-colors" />
            <SiStripe className="hover:text-[#635BFF] transition-colors" />
            <SiPaypal className="hover:text-[#003087] transition-colors" />
          </div>
        </div>

        {/* Quick Links Shop */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-semibold text-sm text-white uppercase tracking-wider">
            Curated Collections
          </h4>
          <ul className="flex flex-col gap-2.5 font-sans text-xs text-[#9d8bbb]">
            <li>
              <Link to="/category/clothing" className="hover:text-white transition-colors">
                Clothing & Apparel
              </Link>
            </li>
            <li>
              <Link to="/category/footwear" className="hover:text-white transition-colors">
                Premium Footwear
              </Link>
            </li>
            <li>
              <Link to="/category/makeup" className="hover:text-white transition-colors">
                High-End Makeup
              </Link>
            </li>
            <li>
              <Link to="/category/jewellery" className="hover:text-white transition-colors">
                Luxurious Jewellery
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-semibold text-sm text-white uppercase tracking-wider">
            Customer Care
          </h4>
          <ul className="flex flex-col gap-2.5 font-sans text-xs text-[#9d8bbb]">
            <li>
              <Link to="/faq" className="hover:text-white transition-colors">
                Help &amp; FAQs
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About AuraBella
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact Support
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-white transition-colors">
                My Profile Account
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white transition-colors">
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-white transition-colors">
                My Wishlist
              </Link>
            </li>
            <li>
              <Link to="/shipping-policy" className="hover:text-white transition-colors">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link to="/return-policy" className="hover:text-white transition-colors">
                Return &amp; Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-semibold text-sm text-white uppercase tracking-wider">
            Aura Club
          </h4>
          <p className="font-sans text-xs text-[#9d8bbb] leading-relaxed">
            Subscribe to our newsletter to receive exclusive updates, priority launches, and 10% discount on your first order.
          </p>
          <form className="flex flex-col min-[420px]:flex-row w-full max-w-sm mt-1">
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-full min-[420px]:rounded-r-none py-2.5 px-4 text-white font-sans transition-colors"
            />
            <button
              type="submit"
              className="btn-primary rounded-full min-[420px]:rounded-none min-[420px]:rounded-r-full px-6 py-2.5 font-semibold text-xs tracking-wide shadow-none mt-2 min-[420px]:mt-0"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-[10px] md:text-xs text-white/30">
        <p>&copy; {new Date().getFullYear()} AuraBella Inc. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white/60 transition-colors">Terms &amp; Conditions</Link>
          <a href="#" className="hover:text-white/60 transition-colors font-sans">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
}
