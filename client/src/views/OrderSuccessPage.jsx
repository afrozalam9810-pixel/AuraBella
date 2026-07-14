import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheckCircle, FiPackage, FiShoppingBag, FiTruck } from "react-icons/fi";
import api from "../api/axios";

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch order details for the summary
    api.get(`/orders/${orderId}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setOrder(res.data.data);
        }
      })
      .catch((err) => console.error("Error loading order confirmation details", err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="glass-card p-5 sm:p-8 md:p-12 text-center max-w-2xl w-full flex flex-col gap-6 items-center">
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-400 text-4xl shadow-glow-rose mb-2">
          ✓
        </div>
        
        <div>
          <span className="badge text-[10px] tracking-widest uppercase mb-2">
            ✦ Confirmation
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white tracking-wide">
            Order Placed Successfully!
          </h2>
          <p className="font-serif italic text-[#9d8bbb] mt-2 text-sm">
            Thank you for shopping with AuraBella. Your order ID is <span className="text-white font-semibold">#{orderId}</span>
          </p>
        </div>

        {order && (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-left flex flex-col gap-4 font-sans text-xs">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[10px]">Order Summary</h4>
            <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
              {order.items?.map((item) => (
                <div key={item._id} className="flex justify-between items-center gap-3 text-white/80">
                  <span className="line-clamp-1 max-w-[280px] min-w-0">
                    {item.product?.name} <span className="text-white/40">({item.variant?.size})</span> x {item.qty}
                  </span>
                  <span className="font-semibold text-white">₹{(item.priceAtPurchase * item.qty).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>

            <hr className="border-white/5" />

            <div className="flex flex-col gap-2 text-[#9d8bbb]">
              <div className="flex justify-between gap-4">
                <span>Shipping Status</span>
                <span className="text-white capitalize flex items-center gap-1">
                  <FiTruck /> {order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Delivery Address</span>
                <span className="text-white text-right max-w-[200px] truncate">
                  {order.shippingAddress?.line1}, {order.shippingAddress?.city}
                </span>
              </div>
              <hr className="border-white/5 my-1" />
              <div className="flex justify-between font-bold text-sm text-white">
                <span>Amount Paid</span>
                <span className="gradient-text">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
          <Link to="/account/orders" className="btn-outline justify-center py-3 px-8 text-xs font-semibold uppercase tracking-wider text-white">
            <FiPackage className="text-sm" /> View All Orders
          </Link>
          <Link to="/" className="btn-primary justify-center py-3 px-8 text-xs font-semibold uppercase tracking-wider text-white">
            <FiShoppingBag className="text-sm" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
