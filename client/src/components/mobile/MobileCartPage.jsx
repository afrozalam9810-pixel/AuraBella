import React from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiTag, FiX } from "react-icons/fi";
import { getProductUrl } from "../../utils/seo";

export default function MobileCartPage({
  items = [],
  totalAmount,
  totalQty,
  couponCode,
  setCouponCode,
  activeCoupon,
  couponError,
  couponSuccess,
  validatingCoupon,
  handleUpdateQty,
  handleRemove,
  handleApplyCoupon,
  handleRemoveCoupon,
  handleCheckoutRedirect,
  discount,
  finalTotal,
}) {
  return (
    <div className="bg-dark-950 min-h-screen text-white pb-24 md:hidden">
      {/* 1. Header banner */}
      <div className="px-4 py-3 bg-dark-900/60 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-sm font-bold uppercase tracking-wider text-white">
          Shopping Bag ({totalQty})
        </h1>
        <Link to="/" className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">
          Add More
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-20 text-center flex flex-col gap-5 items-center justify-center min-h-[60vh] select-none">
          <span className="text-5xl">🛍️</span>
          <div>
            <h3 className="font-semibold text-sm">Your bag is empty</h3>
            <p className="text-xs text-white/40 mt-1 max-w-[200px] mx-auto">
              Add some luxury items to make your style shine.
            </p>
          </div>
          <Link
            to="/"
            className="bg-brand-gradient text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md"
          >
            Discover Collections
          </Link>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-4">
          {/* 2. Cart Items List */}
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const price = item.product.discountPrice ?? item.product.price;
              const thumbnail = item.product.images?.[0] || "https://placehold.co/100x120/1e1830/f0e8ff?text=Product";
              return (
                <div
                  key={item.itemId}
                  className="bg-dark-900 border border-white/5 p-3 rounded-xl flex gap-3 items-center justify-between"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-14 h-18 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-dark-950">
                      <img
                        src={thumbnail}
                        alt={item.product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <Link
                        to={getProductUrl(item.product)}
                        className="text-xs font-semibold text-white/90 hover:text-primary-300 transition-colors truncate"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-[9px] text-[#9d8bbb] font-sans">
                        Size: {item.variant.size || "Default"} | Color: {item.variant.color || "Default"}
                      </span>
                      <span className="text-xs font-bold text-white mt-1">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Remove Action */}
                  <div className="flex flex-col items-end gap-2.5">
                    <button
                      onClick={() => handleRemove(item.itemId)}
                      aria-label="Remove item from bag"
                      className="text-white/40 hover:text-rose-400 transition-colors p-1"
                    >
                      <FiX className="text-sm" />
                    </button>

                    <div className="flex items-center border border-white/10 rounded-lg bg-dark-950">
                      <button
                        onClick={() => handleUpdateQty(item.itemId, item.qty, false)}
                        aria-label="Decrease quantity"
                        className="px-2 py-1 text-white/50 hover:text-white"
                      >
                        <FiMinus className="text-[10px]" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold font-sans select-none">{item.qty}</span>
                      <button
                        onClick={() => handleUpdateQty(item.itemId, item.qty, true)}
                        aria-label="Increase quantity"
                        className="px-2 py-1 text-white/50 hover:text-white"
                      >
                        <FiPlus className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Coupon Apply Code Box */}
          <div className="bg-dark-900 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9d8bbb]">
              Apply Coupon
            </h3>
            {activeCoupon ? (
              <div className="flex items-center justify-between bg-primary-500/10 border border-primary-500/20 py-2.5 px-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiTag className="text-primary-400 text-sm" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
                    {activeCoupon.code}
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  aria-label="Remove applied coupon"
                  className="text-white/40 hover:text-rose-400 p-1"
                >
                  <FiX className="text-sm" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-grow text-xs bg-dark-950 border border-white/10 focus:border-primary-400 focus:outline-none rounded-lg px-3 py-2 text-white font-sans uppercase tracking-wider"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-4 rounded-lg disabled:opacity-40"
                >
                  {validatingCoupon ? "..." : "Apply"}
                </button>
              </form>
            )}
            {couponError && <p className="text-[10px] text-rose-500 font-sans">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] text-green-500 font-sans">{couponSuccess}</p>}
          </div>

          {/* 4. Cart Totals Summary */}
          <div className="bg-dark-900 border border-white/5 p-4 rounded-xl flex flex-col gap-2.5 text-xs">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9d8bbb] mb-1">
              Price Details
            </h3>
            <div className="flex justify-between py-0.5">
              <span className="text-white/45">Bag Total</span>
              <span className="font-sans">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-0.5 text-green-500 font-semibold">
                <span>Coupon Discount</span>
                <span className="font-sans">-₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5">
              <span className="text-white/45">Delivery Fee</span>
              <span className="text-green-500 font-bold uppercase text-[10px]">Free</span>
            </div>
            <div className="h-px bg-white/5 my-1" />
            <div className="flex justify-between text-sm font-bold py-1">
              <span>Total Payable</span>
              <span className="font-sans text-primary-300">
                ₹{finalTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Sticky Bottom Place Order CTA */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-dark-950 border-t border-white/10 p-3.5 flex items-center justify-between gap-4 z-50 pb-[calc(14px+env(safe-area-inset-bottom,0px))] shadow-glow-dark md:hidden select-none">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-white/50 font-sans">Total Payable</span>
            <span className="text-sm font-bold text-white font-sans">
              ₹{finalTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={handleCheckoutRedirect}
            aria-label="Proceed to checkout placement"
            className="py-3 px-6 bg-brand-gradient text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-glow-violet active:scale-[0.98]"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}
