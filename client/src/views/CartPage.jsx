"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiTag, FiX, FiCheck } from "react-icons/fi";
import { updateQty, removeFromCart, clearCart } from "../store/slices/cartSlice";
import api from "../api/axios";
import { getProductUrl } from "../utils/seo";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux States
  const { items, totalAmount, totalQty } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState(null); // { code, discountAmount, discountType, discountValue }
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Helper to re-validate coupon if cart total changes
  useEffect(() => {
    if (!activeCoupon) return;

    // If cart is empty, remove coupon
    if (items.length === 0) {
      handleRemoveCoupon();
      return;
    }

    // Call API validation again to ensure minOrderValue is still met
    const revalidate = async () => {
      try {
        const { data } = await api.post("/orders/validate-coupon", {
          code: activeCoupon.code,
          cartTotal: totalAmount,
        });
        if (data && data.success) {
          setActiveCoupon({
            code: data.code,
            discountAmount: data.discountAmount,
            discountType: data.discountType,
            discountValue: data.discountValue,
          });
        }
      } catch (err) {
        // Coupon invalidated because cart no longer meets requirements
        handleRemoveCoupon();
        setCouponError(err.response?.data?.message || "Coupon invalidated due to price changes.");
      }
    };

    // Only hit revalidate if subtotal changes to prevent unnecessary loops
    revalidate();
  }, [totalAmount]);

  const handleUpdateQty = (itemId, currentQty, increment) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    if (newQty >= 1) {
      dispatch(updateQty({ itemId, qty: newQty }));
    }
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  // Coupon apply handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;

    if (!isAuthenticated) {
      setCouponError("Please sign in to apply coupon codes.");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const { data } = await api.post("/orders/validate-coupon", {
        code: couponCode,
        cartTotal: totalAmount,
      });

      if (data && data.success) {
        setActiveCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
        });
        setCouponSuccess(`Coupon "${data.code}" applied!`);
        setCouponCode("");
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon code.");
      setActiveCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponSuccess("");
    setCouponError("");
  };

  // Checkout redirect handler
  const handleCheckoutRedirect = () => {
    if (isAuthenticated) {
      // Pass the active coupon code to CheckoutPage in state or URL search param
      const param = activeCoupon ? `?coupon=${activeCoupon.code}` : "";
      navigate(`/checkout${param}`);
    } else {
      // Preserve intent to return to checkout
      navigate("/login?redirect=/checkout");
    }
  };

  // Calculations
  const discount = activeCoupon ? activeCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, totalAmount - discount);

  return (
    <div className="min-h-[75vh] max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <h1 className="font-display font-bold text-3xl md:text-5xl text-white uppercase tracking-wider mb-8 text-center md:text-left">
        Shopping Bag
      </h1>

      {items.length === 0 ? (
        <div className="glass-card p-8 sm:p-16 text-center max-w-xl mx-auto flex flex-col gap-6 items-center">
          <span className="text-5xl">🛍️</span>
          <div>
            <h3 className="font-display font-bold text-xl md:text-2xl text-white">Your bag is empty</h3>
            <p className="font-serif italic text-[#9d8bbb] text-sm mt-1">
              Add some luxury items to make your style shine.
            </p>
          </div>
          <Link to="/" className="btn-primary w-fit">
            Discover Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => {
              const price = item.product.discountPrice ?? item.product.price;
              const thumbnail = item.product.images?.[0] || "https://placehold.co/100x120/1e1830/f0e8ff?text=Product";
              return (
                <div key={item.itemId} className="glass-card p-4 flex flex-col min-[520px]:flex-row gap-4 md:gap-6 min-[520px]:items-center justify-between">
                  <div className="flex gap-4 items-center min-w-0">
                    {/* Item Thumbnail */}
                    <div className="w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden border border-white/5 flex-shrink-0 bg-dark-900">
                      <img src={thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    {/* Item Info */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <Link to={getProductUrl(item.product)} className="font-sans text-xs md:text-sm font-semibold text-white/90 hover:text-primary-300 transition-colors line-clamp-1">
                        {item.product.name}
                      </Link>
                      <span className="text-[10px] md:text-xs text-[#9d8bbb] font-sans">
                        Size: {item.variant.size || "Default"} | Color: {item.variant.color || "Default"}
                      </span>
                      <span className="font-sans font-bold text-xs md:text-sm text-white mt-1">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between min-[520px]:justify-end gap-4 md:gap-8">
                    {/* Qty Selector */}
                    <div className="flex items-center border border-white/10 rounded-full py-1.5 px-3 bg-white/5">
                      <button onClick={() => handleUpdateQty(item.itemId, item.qty, false)} className="text-xs hover:text-primary-400 transition-colors text-white/60">
                        <FiMinus />
                      </button>
                      <span className="font-sans font-semibold text-xs text-white px-3.5 select-none">{item.qty}</span>
                      <button onClick={() => handleUpdateQty(item.itemId, item.qty, true)} className="text-xs hover:text-primary-400 transition-colors text-white/60">
                        <FiPlus />
                      </button>
                    </div>

                    {/* Trash Button */}
                    <button onClick={() => handleRemove(item.itemId)} className="text-white/40 hover:text-rose-400 text-sm md:text-base transition-colors" aria-label="Remove Item">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart Button */}
            <button onClick={() => dispatch(clearCart())} className="text-xs font-sans font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors text-right mt-2 self-end">
              Clear Bag
            </button>
          </div>

          {/* Cart Summary Card */}
          <div className="flex flex-col gap-6">
            
            {/* Coupon Application Box */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider">Promo Coupon</h3>
              
              {activeCoupon ? (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-xs text-green-400">
                  <div className="flex items-center gap-2 font-semibold">
                    <FiTag />
                    <span>{activeCoupon.code} Applied</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-white/60 hover:text-white">
                    <FiX />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex flex-col min-[420px]:flex-row gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. WELCOME10)"
                    className="w-full min-[420px]:flex-grow text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl px-4 py-2.5 text-white font-sans transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon}
                    className="btn-outline px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-white/20 hover:border-primary-400 text-white rounded-xl disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <span className="text-[10px] font-sans text-rose-400">{couponError}</span>
              )}
              {couponSuccess && (
                <span className="text-[10px] font-sans text-green-400">{couponSuccess}</span>
              )}
            </div>

            {/* Total Summary */}
            <div className="glass-card p-6 flex flex-col gap-6">
              <h3 className="font-sans font-semibold text-sm text-white uppercase tracking-wider pb-3 border-b border-white/5">
                Order Summary
              </h3>

              <div className="flex flex-col gap-3 font-sans text-xs text-[#9d8bbb]">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQty} items)</span>
                  <span className="text-white">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount</span>
                    <span>- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-white font-medium text-green-400">Free</span>
                </div>
              </div>

              <hr className="border-white/5" />

              <div className="flex justify-between font-sans text-sm font-bold text-white uppercase tracking-wider">
                <span>Total Amount</span>
                <span className="gradient-text">₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>

              <button
                onClick={handleCheckoutRedirect}
                className="btn-primary w-full justify-center py-3.5"
              >
                Proceed to Checkout <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
