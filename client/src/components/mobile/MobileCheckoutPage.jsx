import React, { useState } from "react";
import { FiCheckCircle, FiTruck, FiCreditCard, FiMapPin, FiX, FiAlertCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function MobileCheckoutPage({
  items = [],
  totalAmount,
  totalQty,
  activeStep,
  setActiveStep,
  savedAddresses = [],
  selectedAddressIdx,
  setSelectedAddressIdx,
  showNewAddressForm,
  setShowNewAddressForm,
  newAddress,
  setNewAddress,
  appliedCoupon,
  paymentMethod,
  setPaymentMethod,
  loading,
  submittingOrder,
  errorMsg,
  handleAddNewAddress,
  handlePlaceOrder,
}) {
  const [activeAccordion, setActiveAccordion] = useState("shipping"); // shipping | payment | summary

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, totalAmount - discount);

  return (
    <div className="bg-dark-950 min-h-screen text-white pb-36 md:hidden select-none">
      {/* 1. Header banner */}
      <div className="px-4 py-3 bg-dark-900/60 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-sm font-bold uppercase tracking-wider text-white">
          Secure Checkout
        </h1>
        <Link to="/cart" className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
          Cancel
        </Link>
      </div>

      {errorMsg && (
        <div className="mx-4 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-2 text-xs font-sans">
          <FiAlertCircle className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500" />
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-3">
          
          {/* STEP 1: Shipping Address Accordion */}
          <div className="bg-dark-900 border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveAccordion("shipping")}
              aria-expanded={activeAccordion === "shipping"}
              className="w-full p-4 flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-2">
                <FiMapPin className="text-primary-400 text-sm" />
                <span className="text-xs font-bold uppercase tracking-wider">Shipping Address</span>
              </div>
              {selectedAddressIdx !== null && activeAccordion !== "shipping" && (
                <FiCheckCircle className="text-green-500 text-sm" />
              )}
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === "shipping" ? "max-h-[500px] overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 pb-4 flex flex-col gap-3">
                {savedAddresses.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedAddressIdx === idx;
                      return (
                        <button
                          key={addr._id || idx}
                          onClick={() => {
                            setSelectedAddressIdx(idx);
                            setActiveAccordion("payment"); // Auto-advance
                          }}
                          className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-colors ${
                            isSelected
                              ? "bg-primary-500/10 border-primary-500/30 text-white"
                              : "bg-white/5 border-white/10 text-white/70"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9d8bbb]">
                              {addr.label}
                            </span>
                            {isSelected && <span className="text-[8px] bg-primary-500 text-white px-2 py-0.5 rounded font-sans uppercase font-bold">Selected</span>}
                          </div>
                          <p className="text-xs font-sans">
                            {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <span className="text-[10px] font-sans text-white/50">Phone: {addr.phone}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-white/40 font-sans">No saved addresses found. Please add a shipping address below.</p>
                )}

                {/* New Address Form Toggle */}
                {!showNewAddressForm ? (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white/90 uppercase tracking-wider"
                  >
                    + Add New Address
                  </button>
                ) : (
                  <form onSubmit={handleAddNewAddress} className="border-t border-white/5 pt-3 flex flex-col gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Address Label (e.g. Home, Work)"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="bg-dark-950 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                      className="bg-dark-950 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={newAddress.line2}
                      onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                      className="bg-dark-950 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="bg-dark-950 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 text-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="bg-dark-950 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 text-white"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="bg-dark-950 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 text-white"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="bg-dark-950 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400 text-white"
                        required
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="flex-1 py-2 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/60"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-primary-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: Payment Method Accordion */}
          <div className="bg-dark-900 border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveAccordion("payment")}
              aria-expanded={activeAccordion === "payment"}
              className="w-full p-4 flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-2">
                <FiCreditCard className="text-primary-400 text-sm" />
                <span className="text-xs font-bold uppercase tracking-wider">Payment Method</span>
              </div>
              {paymentMethod && activeAccordion !== "payment" && (
                <FiCheckCircle className="text-green-500 text-sm" />
              )}
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === "payment" ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 pb-4 flex flex-col gap-2 text-xs">
                {/* Online Payment */}
                <button
                  onClick={() => {
                    setPaymentMethod("online");
                    setActiveAccordion("summary");
                  }}
                  className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    paymentMethod === "online"
                      ? "bg-primary-500/10 border-primary-500/30 text-white"
                      : "bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">Pay Online</span>
                    <span className="text-[9px] text-[#9d8bbb] font-sans">Razorpay (Cards, UPI, Netbanking)</span>
                  </div>
                  {paymentMethod === "online" && <span className="w-2.5 h-2.5 rounded-full bg-primary-400" />}
                </button>

                {/* COD Payment - Disabled / Coming Soon */}
                <div
                  className="p-3.5 rounded-lg border border-white/5 bg-white/5 text-white/40 flex items-center justify-between opacity-50 cursor-not-allowed select-none"
                  aria-disabled="true"
                  title="Cash on Delivery is currently unavailable"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">Cash On Delivery</span>
                    <span className="text-[9px] text-[#9d8bbb] font-sans">Pay with cash upon receipt</span>
                  </div>
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Order Summary Accordion */}
          <div className="bg-dark-900 border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveAccordion("summary")}
              aria-expanded={activeAccordion === "summary"}
              className="w-full p-4 flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-2">
                <FiTruck className="text-primary-400 text-sm" />
                <span className="text-xs font-bold uppercase tracking-wider">Order Summary ({totalQty})</span>
              </div>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === "summary" ? "max-h-[400px] overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 pb-4 flex flex-col gap-4">
                {/* Items Summary list */}
                <div className="flex flex-col gap-2">
                  {items.map((item) => {
                    const price = item.product.discountPrice ?? item.product.price;
                    return (
                      <div key={item.itemId} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-semibold text-white/90 truncate max-w-[200px]">{item.product.name}</span>
                          <span className="text-[9px] text-[#9d8bbb] font-sans">Qty: {item.qty} | Size: {item.variant.size}</span>
                        </div>
                        <span className="font-sans font-semibold">₹{(price * item.qty).toLocaleString("en-IN")}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="flex flex-col gap-2 text-xs border-t border-white/5 pt-2">
                  <div className="flex justify-between py-0.5">
                    <span className="text-white/45">Subtotal</span>
                    <span className="font-sans">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between py-0.5 text-green-500 font-semibold">
                      <span>Discount</span>
                      <span className="font-sans">-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5">
                    <span className="text-white/45">Shipping</span>
                    <span className="text-green-500 font-bold uppercase text-[10px]">Free</span>
                  </div>
                  <div className="h-px bg-white/5 my-1" />
                  <div className="flex justify-between text-sm font-bold py-1">
                    <span>Total Amount</span>
                    <span className="font-sans text-primary-300">
                      ₹{finalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Order Action Bar
           Positioned above MobileBottomNavigation (z-[90], ~52px tall) using
           a safe-area-aware bottom offset so it is always visible.
           handlePlaceOrder is the EXACT same handler from CheckoutPage —
           no business logic is duplicated here. */}
      {!loading && (
        <div
          className="fixed inset-x-0 bg-white border-t border-slate-200 p-3.5 flex items-center justify-between gap-4 z-[80] shadow-glow-dark md:hidden select-none"
          style={{ bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-sans">Total Payable</span>
            <span className="text-sm font-bold text-slate-900 font-sans">
              ₹{finalTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={selectedAddressIdx === null || !paymentMethod || submittingOrder || items.length === 0}
            aria-label={
              submittingOrder
                ? "Processing your order"
                : paymentMethod === "online"
                ? "Pay now with Razorpay"
                : "Place cash on delivery order"
            }
            className={`py-3 px-6 font-bold rounded-xl text-xs uppercase tracking-wider transition-opacity
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white
              ${
                selectedAddressIdx === null || !paymentMethod || submittingOrder || items.length === 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"
                  : "bg-brand-gradient text-white shadow-glow-violet active:scale-[0.98]"
              }`}
          >
            {submittingOrder
              ? "Processing..."
              : paymentMethod === "online"
              ? "Pay Now"
              : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
}
