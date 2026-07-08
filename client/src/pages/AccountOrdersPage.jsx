import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiChevronRight, FiAlertCircle } from "react-icons/fi";
import api from "../api/axios";

const STATUS_COLORS = {
  placed: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  shipped: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  delivered: "text-green-400 bg-green-500/10 border-green-500/20",
  cancelled: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders")
      .then((res) => {
        if (res.data && res.data.success) {
          setOrders(res.data.data || []);
        }
      })
      .catch((err) => {
        console.error("Error fetching customer order history", err);
        setError("Could not load your order history. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] max-w-4xl mx-auto px-4 md:px-8 py-12">
      <h1 className="font-display font-bold text-3xl md:text-5xl text-white uppercase tracking-wider mb-2">
        My Orders
      </h1>
      <p className="font-serif italic text-[#9d8bbb] text-sm mb-10">
        Your complete order history
      </p>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <FiAlertCircle className="text-sm" /> {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-card p-16 text-center flex flex-col gap-6 items-center">
          <FiPackage className="text-5xl text-white/20" />
          <div>
            <h3 className="font-display font-bold text-xl text-white">No orders yet</h3>
            <p className="font-serif italic text-xs text-[#9d8bbb] mt-1">
              You haven't placed any orders with us yet.
            </p>
          </div>
          <Link to="/" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const hasItems = order.items && order.items.length > 0;
            return (
              <Link
                key={order._id}
                to={`/account/orders/${order._id}`}
                className="glass-card p-5 flex items-center gap-4 justify-between group border border-white/5 bg-white/5 hover:border-primary-400/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail stack */}
                  <div className="flex -space-x-3">
                    {hasItems && order.items.slice(0, 2).map((item, idx) => {
                      const image = item.product?.images?.[0] || "https://placehold.co/80x80/2a1040/f0e8ff?text=P";
                      return (
                        <div key={idx} className="w-12 h-12 rounded-lg border-2 border-dark-900 overflow-hidden flex-shrink-0 bg-dark-900">
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                    {hasItems && order.items.length > 2 && (
                      <div className="w-12 h-12 rounded-lg border-2 border-dark-900 bg-white/5 flex items-center justify-center text-[10px] text-white/50 font-sans font-semibold flex-shrink-0">
                        +{order.items.length - 2}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-sans font-semibold text-xs md:text-sm text-white group-hover:text-primary-300 transition-colors">
                      Order #{order._id.substring(Math.max(0, order._id.length - 8))}
                    </span>
                    <span className="font-sans text-[11px] text-[#9d8bbb]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric",
                      })} · {hasItems ? order.items.length : 0} item{hasItems && order.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="font-sans font-bold text-sm text-white">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <span className={`badge text-[10px] border capitalize ${STATUS_COLORS[order.orderStatus] || ""}`}>
                    {order.orderStatus}
                  </span>
                  <FiChevronRight className="text-white/30 group-hover:text-primary-400 transition-colors text-lg" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
