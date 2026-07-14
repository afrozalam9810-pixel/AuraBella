import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiCheck, FiAlertCircle, FiX, FiMapPin, FiCreditCard } from "react-icons/fi";
import api from "../../api/axios";

const STATUS_COLORS = {
  placed: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  shipped: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  delivered: "text-green-400 bg-green-500/10 border-green-500/20",
  cancelled: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "all" ? "/admin/orders" : `/admin/orders?status=${statusFilter}`;
      const { data } = await api.get(url);
      if (data && data.success) {
        setOrders(data.data || []);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const { data } = await api.put(`/admin/orders/${orderId}/status`, { orderStatus: newStatus });
      if (data && data.success) {
        setSuccessMsg(`Order #${orderId.substring(orderId.length - 8)} updated to ${newStatus}!`);
        // If the selected order is open in the modal, update it too
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
        fetchOrders();
      }
    } catch (err) {
      setErrorMsg("Failed to update order status.");
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans text-xs">
      <div className="flex justify-between items-end border-b border-white/5 pb-5 gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-white tracking-wide">
            Manage Orders
          </h1>
          <p className="font-serif italic text-[#9d8bbb] text-xs mt-1">
            Fulfill packages, update logistics, and cancel orders.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase font-semibold text-white/50">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold tracking-wider font-sans focus:outline-none transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <FiCheck /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl px-4 py-3 flex items-center gap-2">
          <FiAlertCircle /> {errorMsg}
        </div>
      )}

      {/* Orders Table */}
      <div className="glass-card p-6 flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-10 font-serif italic text-[#9d8bbb]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <p className="font-serif italic text-xs text-[#9d8bbb] text-center py-6">No orders found.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#9d8bbb] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Customer Phone</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="py-3.5 px-2 text-white font-semibold">
                      <Link to={`/admin/orders/${o._id}`} className="hover:underline text-primary-300">
                        #{o._id.substring(o._id.length - 8)}
                      </Link>
                    </td>
                    <td className="py-3.5 px-2 text-[#9d8bbb]">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-2 text-[#9d8bbb]">{o.shippingAddress?.phone}</td>
                    <td className="py-3.5 px-2 text-white font-bold">₹{o.totalAmount.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-2">
                      <span className={`badge text-[9px] capitalize border ${STATUS_COLORS[o.orderStatus] || ""}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <Link
                          to={`/admin/orders/${o._id}`}
                          className="text-[10px] text-primary-300 hover:text-white font-bold uppercase tracking-wider"
                        >
                          View Details
                        </Link>
                        
                        {o.orderStatus !== "delivered" && o.orderStatus !== "cancelled" && (
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                            className="bg-dark-900 border border-white/10 rounded-lg px-2 py-1 text-[9px] uppercase font-bold focus:outline-none transition-colors"
                          >
                            <option value="placed">Placed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-6 relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar animate-scale-up">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-lg"
            >
              <FiX />
            </button>

            <div>
              <span className={`badge text-[9px] border capitalize ${STATUS_COLORS[selectedOrder.orderStatus] || ""}`}>
                {selectedOrder.orderStatus}
              </span>
              <h2 className="font-display font-bold text-xl text-white tracking-wide mt-1">
                Order #{selectedOrder._id}
              </h2>
              <p className="font-sans text-[10px] text-[#9d8bbb] mt-0.5">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
              </p>
            </div>

            <hr className="border-white/5" />

            {/* Items list */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-white/40">Order Items</h4>
              {selectedOrder.items?.map((item) => (
                <div key={item._id} className="flex gap-4 items-center py-2 border-b border-white/5 last:border-0">
                  <div className="w-10 h-12 rounded overflow-hidden border border-white/5 bg-dark-900 flex-shrink-0">
                    <img src={item.product?.images?.[0] || "https://placehold.co/40x50/1e1830/f0e8ff?text=P"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-white truncate max-w-[250px]">{item.product?.name || "Product Item"}</p>
                    <p className="text-[9px] text-[#9d8bbb] mt-0.5">
                      Size: {item.variant?.size || "Default"} | Color: {item.variant?.color || "Default"} · Qty: {item.qty}
                    </p>
                  </div>
                  <span className="font-bold text-white">₹{(item.priceAtPurchase * item.qty).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shipping Address */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <FiMapPin /> Shipping Address
                </h4>
                <p className="text-[#9d8bbb] leading-relaxed">
                  {selectedOrder.shippingAddress?.line1}
                  {selectedOrder.shippingAddress?.line2 && <span className="block">{selectedOrder.shippingAddress.line2}</span>}
                  <span className="block">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</span>
                </p>
                <p className="text-[#9d8bbb] font-semibold mt-1">📞 {selectedOrder.shippingAddress?.phone}</p>
              </div>

              {/* Payment Details */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <FiCreditCard /> Payment Summary
                </h4>
                <div className="flex justify-between text-xs text-[#9d8bbb]">
                  <span>Method</span>
                  <span className="text-white uppercase">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs text-[#9d8bbb]">
                  <span>Payment Status</span>
                  <span className="text-white capitalize">{selectedOrder.paymentStatus}</span>
                </div>
                <hr className="border-white/5 my-1" />
                <div className="flex justify-between text-sm font-bold text-white uppercase tracking-wider">
                  <span>Grand Total</span>
                  <span className="gradient-text">₹{selectedOrder.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
              {selectedOrder.orderStatus !== "delivered" && selectedOrder.orderStatus !== "cancelled" && (
                <div className="flex gap-2">
                  {selectedOrder.orderStatus === "placed" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, "shipped")}
                      className="px-4 py-2 border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-400 font-bold uppercase tracking-wider rounded-xl transition-colors"
                    >
                      Ship Package
                    </button>
                  )}
                  {selectedOrder.orderStatus === "shipped" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder._id, "delivered")}
                      className="px-4 py-2 border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-400 font-bold uppercase tracking-wider rounded-xl transition-colors"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-white/10 text-white/60 hover:text-white rounded-xl transition-colors font-bold uppercase tracking-wider"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
