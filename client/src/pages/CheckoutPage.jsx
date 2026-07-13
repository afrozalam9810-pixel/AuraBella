import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FiCheckCircle, FiTruck, FiCreditCard, FiPlus, FiMapPin, FiArrowLeft, FiX, FiAlertCircle, FiScissors } from "react-icons/fi";
import { clearCart } from "../store/slices/cartSlice";
import api from "../api/axios";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Redux Cart State
  const { items, totalAmount, totalQty } = useSelector((state) => state.cart);

  // Checkout Progress State
  const [activeStep, setActiveStep] = useState(1); // 1: Shipping Address, 2: Payment & Place Order

  // Address States
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  // Coupon States
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod | online

  // General States
  const [loading, setLoading] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load profile addresses & validate query coupon on mount
  useEffect(() => {
    // 1. Fetch user saved addresses
    setLoading(true);
    api.get("/auth/me")
      .then((res) => {
        if (res.data && res.data.success) {
          const userObj = res.data.user;
          if (userObj.addresses && userObj.addresses.length > 0) {
            setSavedAddresses(userObj.addresses);
            // Default to first address or default address
            const defaultIdx = userObj.addresses.findIndex((addr) => addr.isDefault);
            setSelectedAddressIdx(defaultIdx !== -1 ? defaultIdx : 0);
          }
        }
      })
      .catch((err) => console.error("Error loading saved addresses", err))
      .finally(() => setLoading(false));

    // 2. Pre-apply coupon passed in query params
    const couponFromUrl = searchParams.get("coupon");
    if (couponFromUrl) {
      setValidatingCoupon(true);
      api.post("/orders/validate-coupon", {
        code: couponFromUrl,
        cartTotal: totalAmount,
      })
        .then((res) => {
          if (res.data && res.data.success) {
            setAppliedCoupon({
              code: res.data.code,
              discountAmount: res.data.discountAmount,
            });
          }
        })
        .catch((err) => console.error("Error validating query coupon", err))
        .finally(() => setValidatingCoupon(false));
    }
  }, [totalAmount, searchParams]);

  // Handle adding new address locally
  const handleAddNewAddress = (e) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode || !newAddress.phone) return;

    const label = newAddress.label || "Home";
    const completeAddress = { ...newAddress, label, _id: `local-${Date.now()}` };
    const updated = [...savedAddresses, completeAddress];
    setSavedAddresses(updated);
    setSelectedAddressIdx(updated.length - 1);
    setShowNewAddressForm(false);
    // Reset form
    setNewAddress({
      label: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
    });
  };

  // Helper to load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // If already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Submit checkout order
  const handlePlaceOrder = async () => {
    setErrorMsg("");
    if (selectedAddressIdx === null) {
      setErrorMsg("Please select or add a shipping address.");
      return;
    }

    const shippingAddress = savedAddresses[selectedAddressIdx];
    setSubmittingOrder(true);

    if (paymentMethod === "online") {
      try {
        // 1. Create payment order in backend
        const orderRes = await api.post("/payments/create-order", {
          shippingAddress: {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || "",
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            phone: shippingAddress.phone,
          },
          couponCode: appliedCoupon?.code,
        });
        if (!orderRes.data || !orderRes.data.success) {
          throw new Error("Could not initialize payment transaction.");
        }
        const orderData = orderRes.data.data;

        // 2. Load SDK
        const scriptLoaded = await loadRazorpayScript();

        // 3. Razorpay Options
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "AuraBella",
          description: "Premium Skincare Purchase",
          order_id: orderData.id,
          handler: async function (response) {
            try {
              // Verify signature
              const verifyRes = await api.post("/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data && verifyRes.data.success) {
                dispatch(clearCart());
                navigate(`/order-success/${verifyRes.data.data._id}`);
              }
            } catch (err) {
              setErrorMsg("Payment verification failed! Please try again or select cash payment.");
              setSubmittingOrder(false);
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: shippingAddress.phone || "",
          },
          theme: {
            color: "#8b5cf6",
          },
          modal: {
            ondismiss: function () {
              setErrorMsg("Payment cancelled. You can retry paying online or choose COD.");
              setSubmittingOrder(false);
            },
          },
        };

        if (!scriptLoaded) throw new Error("Could not load Razorpay Checkout. Please check your connection and retry.");
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        setErrorMsg(err.message || "Failed to initialize payment.");
        setSubmittingOrder(false);
      }
    } else {
      // COD Flow
      try {
        const payload = {
          shippingAddress: {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || "",
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            phone: shippingAddress.phone,
          },
          paymentMethod: "cod",
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        };

        const { data } = await api.post("/orders", payload);
        if (data && data.success) {
          dispatch(clearCart());
          navigate(`/order-success/${data.data._id}`);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || "Something went wrong while placing your order.");
      } finally {
        setSubmittingOrder(false);
      }
    }
  };

  // Subtotal calculations
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, totalAmount - discount);

  // If bag is empty
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <span className="text-5xl">🛍️</span>
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">No items in your bag</h2>
          <p className="font-serif italic text-[#9d8bbb] mt-2 max-w-sm">
            Add items to your bag before proceeding to checkout.
          </p>
        </div>
        <Link to="/" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-3xl md:text-5xl text-white uppercase tracking-wider mb-10 text-center md:text-left">
          Checkout
        </h1>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-xl px-4 py-3.5 mb-8 flex items-center gap-2">
            <FiAlertCircle className="text-base" /> {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Checkout Steps flow */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* PROGRESS STEPS INDICATOR BAR */}
            <div className="flex justify-between items-center relative pb-6 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${activeStep >= 1 ? "bg-brand-gradient text-white shadow-glow-violet" : "bg-white/5 text-white/40"}`}>
                  1
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${activeStep >= 1 ? "text-white" : "text-white/40"}`}>Shipping</span>
              </div>
              <div className="flex-grow h-0.5 bg-white/5 mx-4" />
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${activeStep >= 2 ? "bg-brand-gradient text-white shadow-glow-violet" : "bg-white/5 text-white/40"}`}>
                  2
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${activeStep >= 2 ? "text-white" : "text-white/40"}`}>Payment</span>
              </div>
            </div>

            {/* STEP 1: SHIPPING ADDRESS SECTION */}
            {activeStep === 1 && (
              <div className="flex flex-col gap-6">
                <div className="glass-card p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="font-sans font-bold text-sm uppercase tracking-wider">Select Shipping Address</h3>
                    <button
                      onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                      className="text-xs font-sans font-bold text-primary-300 hover:text-white uppercase tracking-wider flex items-center gap-1"
                    >
                      <FiPlus /> New Address
                    </button>
                  </div>

                  {loading ? (
                    <div className="animate-pulse flex flex-col gap-3">
                      <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                      <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedAddresses.map((addr, idx) => (
                        <div
                          key={addr._id}
                          onClick={() => setSelectedAddressIdx(idx)}
                          className={`glass-card p-5 cursor-pointer border transition-all hover:scale-[1.01] ${
                            selectedAddressIdx === idx
                              ? "border-primary-400 bg-primary-500/10 shadow-glow-violet"
                              : "border-white/5 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FiMapPin className={selectedAddressIdx === idx ? "text-primary-300" : "text-white/40"} />
                            <span className="font-sans font-bold text-xs uppercase tracking-wider">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="badge text-[9px] px-2 py-0.5 ml-auto">Default</span>
                            )}
                          </div>
                          <p className="font-sans text-xs text-[#9d8bbb] leading-relaxed truncate">{addr.line1}</p>
                          <p className="font-sans text-xs text-[#9d8bbb] leading-relaxed truncate">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="font-sans text-[10px] text-[#9d8bbb] mt-2 font-semibold">📞 {addr.phone}</p>
                        </div>
                      ))}

                      {savedAddresses.length === 0 && !showNewAddressForm && (
                        <div className="sm:col-span-2 text-center p-8 border border-dashed border-white/10 rounded-2xl">
                          <p className="font-serif italic text-xs text-[#9d8bbb]">No saved addresses. Please add a new address to continue.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* NEW ADDRESS DETAILED EXPAND FORM */}
                {showNewAddressForm && (
                  <form onSubmit={handleAddNewAddress} className="glass-card p-6 flex flex-col gap-4 animate-slide-up">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="font-sans font-bold text-xs uppercase tracking-wider">Add New Address</h3>
                      <button type="button" onClick={() => setShowNewAddressForm(false)} className="text-white/60 hover:text-white">
                        <FiX />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/50 uppercase font-semibold">Address Label (e.g. Home, Work)</label>
                        <input
                          type="text"
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          placeholder="Home"
                          className="text-xs bg-white/5 border border-white/10 focus:border-primary-400 focus:outline-none rounded-xl p-3 text-white transition-colors"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/50 uppercase font-semibold">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          placeholder="10-digit number"
                          className="text-xs bg-white/5 border border-white/10 focus:border-primary-400 focus:outline-none rounded-xl p-3 text-white transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-[10px] text-white/50 uppercase font-semibold">Street Address</label>
                        <input
                          type="text"
                          required
                          value={newAddress.line1}
                          onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                          placeholder="Apartment, building, street address"
                          className="text-xs bg-white/5 border border-white/10 focus:border-primary-400 focus:outline-none rounded-xl p-3 text-white transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-[10px] text-white/50 uppercase font-semibold">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={newAddress.line2}
                          onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                          placeholder="Suite, unit, floor, etc."
                          className="text-xs bg-white/5 border border-white/10 focus:border-primary-400 focus:outline-none rounded-xl p-3 text-white transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/50 uppercase font-semibold">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="Bangalore"
                          className="text-xs bg-white/5 border border-white/10 focus:border-primary-400 focus:outline-none rounded-xl p-3 text-white transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/50 uppercase font-semibold">State</label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          placeholder="Karnataka"
                          className="text-xs bg-white/5 border border-white/10 focus:border-primary-400 focus:outline-none rounded-xl p-3 text-white transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/50 uppercase font-semibold">Pincode</label>
                        <input
                          type="text"
                          required
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          placeholder="560001"
                          className="text-xs bg-white/5 border border-white/10 focus:border-primary-400 focus:outline-none rounded-xl p-3 text-white transition-colors"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary w-fit text-xs px-6 py-3 mt-2 self-end">
                      Save & Apply Address
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  disabled={selectedAddressIdx === null}
                  onClick={() => setActiveStep(2)}
                  className="btn-primary w-full justify-center py-4 text-sm disabled:opacity-40"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* STEP 2: PAYMENT & SUBMIT SECTION */}
            {activeStep === 2 && (
              <div className="flex flex-col gap-6">
                
                {/* Back button */}
                <button
                  onClick={() => setActiveStep(1)}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9d8bbb] hover:text-white transition-colors self-start"
                >
                  <FiArrowLeft /> Back to Shipping
                </button>

                {/* Selected address review */}
                <div className="glass-card p-5 flex items-center justify-between border-white/5 bg-white/5">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-semibold block mb-1">Shipping To:</span>
                    <p className="font-sans text-xs font-semibold text-white">
                      {savedAddresses[selectedAddressIdx]?.line1}, {savedAddresses[selectedAddressIdx]?.city}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveStep(1)}
                    className="text-xs font-sans font-bold text-primary-300 hover:text-white uppercase tracking-wider"
                  >
                    Change
                  </button>
                </div>

                {/* Payment Selection Form */}
                <div className="glass-card p-6 flex flex-col gap-5">
                  <h3 className="font-sans font-bold text-sm uppercase tracking-wider border-b border-white/5 pb-3">Select Payment Method</h3>
                  
                  <div className="flex flex-col gap-3">
                    <label
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-primary-400 bg-primary-500/10 text-white shadow-glow-violet"
                          : "border-white/5 bg-white/5 hover:border-white/10 text-[#9d8bbb]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-primary-400 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex items-center gap-2 font-sans text-xs font-semibold text-white">
                        <FiTruck className="text-base" /> Cash on Delivery (COD)
                      </div>
                    </label>

                    <label
                      onClick={() => setPaymentMethod("online")}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "online"
                          ? "border-primary-400 bg-primary-500/10 text-white shadow-glow-violet"
                          : "border-white/5 bg-white/5 hover:border-white/10 text-[#9d8bbb]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "online"}
                        onChange={() => setPaymentMethod("online")}
                        className="accent-primary-400 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex items-center gap-2 font-sans text-xs font-semibold text-white">
                        <FiCreditCard className="text-base" /> Pay Online (UPI, Card, Net Banking)
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={submittingOrder}
                  className="btn-primary w-full py-4 text-sm justify-center disabled:opacity-50"
                >
                  {submittingOrder ? "Processing Order..." : `Place Order (₹${finalTotal.toLocaleString("en-IN")})`}
                </button>

              </div>
            )}

          </div>

          {/* Right Panel: Checkout Bag Summary */}
          <div className="glass-card p-6 flex flex-col gap-5">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider pb-3 border-b border-white/5">
              Bag Summary
            </h3>

            {/* List items briefly */}
            <div className="flex flex-col gap-4 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
              {items.map((item) => {
                const price = item.product.discountPrice ?? item.product.price;
                const thumbnail = item.product.images?.[0] || "https://placehold.co/80x100/1e1830/f0e8ff?text=Product";
                return (
                  <div key={item.itemId} className="flex gap-3 items-center justify-between font-sans text-xs">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-12 rounded border border-white/5 overflow-hidden flex-shrink-0 bg-dark-900">
                        <img src={thumbnail} alt="thumb" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-white/90 line-clamp-1 max-w-[120px]">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] text-[#9d8bbb]">Qty: {item.qty} | {item.variant.size || "S"}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-white">₹{(price * item.qty).toLocaleString("en-IN")}</span>
                  </div>
                );
              })}
            </div>

            <hr className="border-white/5" />

            {/* Billing totals */}
            <div className="flex flex-col gap-3 font-sans text-xs text-[#9d8bbb]">
              <div className="flex justify-between">
                <span>Subtotal ({totalQty} items)</span>
                <span className="text-white">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span className="flex items-center gap-1"><FiScissors /> Coupon Discount</span>
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
          </div>

        </div>
      </div>

      {/* Removed mock payment UI: real Razorpay Checkout is opened above. */}
      {false && showSandboxPaymentModal.open && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans text-xs">
          <div className="glass-card max-w-sm w-full p-6 flex flex-col gap-6 relative border border-primary-500/30 animate-scale-up">
            <div className="text-center">
              <span className="badge text-[9px] tracking-widest uppercase mb-1">
                ✦ AuraBella Secure Gateway
              </span>
              <h3 className="font-display font-bold text-lg text-white">Razorpay Sandbox Mock</h3>
              <p className="font-serif italic text-xs text-[#9d8bbb] mt-1">Transaction ID: {showSandboxPaymentModal.orderId}</p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Merchant</span>
                <span className="text-white font-semibold">AuraBella Luxury Fashion</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Amount Payable</span>
                <span className="text-white font-bold text-sm">₹{showSandboxPaymentModal.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const mockPaymentId = "pay_" + Math.random().toString(36).substring(2, 12);
                  const mockSignature = "sandbox_approved_sig";
                  setShowSandboxPaymentModal({ ...showSandboxPaymentModal, open: false });
                  showSandboxPaymentModal.onSuccess(mockPaymentId, mockSignature);
                }}
                className="w-full py-3.5 btn-primary justify-center font-bold uppercase tracking-wider text-xs shadow-glow-violet"
              >
                Approve Test Payment (Success)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSandboxPaymentModal({ ...showSandboxPaymentModal, open: false });
                  showSandboxPaymentModal.onCancel();
                }}
                className="w-full py-3.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold uppercase tracking-wider rounded-xl transition-colors text-xs"
              >
                Decline Payment (Fail/Dismiss)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
