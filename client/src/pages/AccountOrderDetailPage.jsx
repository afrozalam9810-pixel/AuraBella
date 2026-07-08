import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiTruck, FiMapPin, FiCreditCard } from "react-icons/fi";
import api from "../api/axios";

const STATUS_STEPS = ["placed", "shipped", "delivered"];

const STATUS_COLORS = {
  placed: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  shipped: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  delivered: "text-green-400 bg-green-500/10 border-green-500/20",
  cancelled: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function AccountOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setOrder(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching order details", err);
        setError(err.response?.data?.message || "Could not retrieve order details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] max-w-4xl mx-auto px-4 py-12 text-center flex flex-col gap-6 items-center">
        <FiAlertCircle className="text-6xl text-rose-500" />
        <div>
          <h3 className="font-display font-bold text-xl md:text-2xl text-white">Order Details Not Found</h3>
          <p className="font-serif italic text-xs text-[#9d8bbb] mt-1 max-w-xs">{error || "This order does not exist."}</p>
        </div>
        <Link to="/account/orders" className="btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="min-h-[60vh] max-w-4xl mx-auto px-4 md:px-8 py-12">
      {/* Back */}
      <Link
        to="/account/orders"
        className="flex items-center gap-2 text-[#9d8bbb] hover:text-white text-xs font-sans font-semibold uppercase tracking-wider mb-8 transition-colors w-fit"
      >
        <FiArrowLeft /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-white tracking-wide">
            Order #{order._id.substring(Math.max(0, order._id.length - 8))}
          </h1>
          <p className="font-sans text-xs text-[#9d8bbb] mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <span className={`badge border text-xs capitalize self-start ${STATUS_COLORS[order.orderStatus] || ""}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Items + Tracker */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Order Tracker */}
          {order.orderStatus !== "cancelled" && (
            <div className="glass-card p-6">
              <h3 className="font-sans font-semibold text-[10px] text-white/40 uppercase tracking-wider mb-6">
                Order Progress
              </h3>
              <div className="flex items-center justify-between relative px-2">
                {/* Connector line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-white/5" />
                <div
                  className="absolute top-4 left-6 h-0.5 bg-brand-gradient transition-all duration-700"
                  style={{ width: `${currentStep >= 0 ? (currentStep / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                />

                {STATUS_STEPS.map((step, idx) => (
                  <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                        idx <= currentStep
                          ? "bg-brand-gradient border-primary-400 text-white shadow-glow-violet"
                          : "border-white/10 bg-dark-800 text-white/30"
                      }`}
                    >
                      {idx < currentStep ? "✓" : idx + 1}
                    </div>
                    <span className={`font-sans text-[10px] capitalize font-semibold ${idx <= currentStep ? "text-white" : "text-white/30"}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-sans font-semibold text-[10px] text-white/40 uppercase tracking-wider">
              Items Ordered
            </h3>
            {order.items?.map((item) => {
              const image = item.product?.images?.[0] || "https://placehold.co/80x100/1e1830/f0e8ff?text=Product";
              return (
                <div key={item._id} className="flex gap-4 items-center py-3 border-b border-white/5 last:border-0">
                  <div className="w-14 h-16 rounded-lg overflow-hidden border border-white/5 bg-dark-900 flex-shrink-0">
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-sans text-xs md:text-sm font-semibold text-white">{item.product?.name || "Product Item"}</p>
                    <p className="font-sans text-[10px] text-[#9d8bbb] mt-0.5">
                      Size: {item.variant?.size || "Default"} | Color: {item.variant?.color || "Default"} · Qty: {item.qty}
                    </p>
                  </div>
                  <span className="font-sans font-bold text-xs md:text-sm text-white flex-shrink-0">
                    ₹{(item.priceAtPurchase * item.qty).toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Address & Payment Summary */}
        <div className="flex flex-col gap-4">
          
          {/* Delivery Address */}
          <div className="glass-card p-5 flex flex-col gap-3">
            <h3 className="font-sans font-semibold text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <FiMapPin /> Delivery Address
            </h3>
            <p className="font-sans text-xs text-white leading-relaxed">
              {order.shippingAddress?.line1}
            </p>
            {order.shippingAddress?.line2 && (
              <p className="font-sans text-xs text-white leading-relaxed">{order.shippingAddress.line2}</p>
            )}
            <p className="font-sans text-xs text-[#9d8bbb]">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
            </p>
            <p className="font-sans text-xs text-[#9d8bbb] mt-1 font-semibold">📞 {order.shippingAddress?.phone}</p>
          </div>

          {/* Payment Summary */}
          <div className="glass-card p-5 flex flex-col gap-3">
            <h3 className="font-sans font-semibold text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <FiCreditCard /> Payment details
            </h3>
            <div className="flex justify-between text-xs font-sans text-[#9d8bbb]">
              <span>Method</span>
              <span className="text-white uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-xs font-sans text-[#9d8bbb]">
              <span>Status</span>
              <span className="text-green-400 capitalize">{order.paymentStatus}</span>
            </div>
            <hr className="border-white/5" />
            <div className="flex justify-between text-sm font-sans font-bold text-white uppercase tracking-wider">
              <span>Total paid</span>
              <span className="gradient-text">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
