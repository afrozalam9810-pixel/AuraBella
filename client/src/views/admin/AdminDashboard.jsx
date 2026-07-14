import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiDollarSign, FiShoppingBag, FiPackage, FiUsers, FiArrowUpRight, FiClock, FiStar } from "react-icons/fi";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    topProducts: [],
    salesTrends: [],
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Aggregated Admin Stats
        const statsRes = await api.get("/admin/stats");
        let statsData = {
          totalOrders: 0,
          totalRevenue: 0,
          topProducts: [],
          salesTrends: [],
          totalUsers: 0,
        };
        if (statsRes.data && statsRes.data.success) {
          statsData = statsRes.data.data;
        }

        // 2. Fetch Recent Orders from admin order API
        const ordersRes = await api.get("/admin/orders");
        let recent = [];
        if (ordersRes.data && ordersRes.data.success) {
          recent = (ordersRes.data.data || []).slice(0, 5);
        }

        setStats(statsData);
        setRecentOrders(recent);
      } catch (err) {
        console.error("Error loading dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardItems = [
    { label: "Total Revenue", val: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: <FiDollarSign />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Total Orders", val: stats.totalOrders, icon: <FiShoppingBag />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { label: "Top Product Units", val: stats.topProducts.reduce((sum, p) => sum + p.quantitySold, 0), icon: <FiPackage />, color: "text-primary-300 bg-primary-500/10 border-primary-500/20" },
    { label: "Active Customers", val: stats.totalUsers, icon: <FiUsers />, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  ];

  // SVG Chart Calculations
  const chartHeight = 120;
  const chartWidth = 500;
  const trends = stats.salesTrends || [];
  const maxSales = trends.length > 0 ? Math.max(...trends.map((t) => t.amount), 1000) : 1000;

  // Build SVG points
  const points = trends
    .map((t, idx) => {
      const x = (idx / (trends.length - 1 || 1)) * (chartWidth - 40) + 20;
      const y = chartHeight - (t.amount / maxSales) * (chartHeight - 30) - 15;
      return `${x},${y}`;
    })
    .join(" ");

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans text-xs">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-4xl text-white tracking-wide">
          Dashboard Overview
        </h1>
        <p className="font-serif italic text-[#9d8bbb] text-xs md:text-sm mt-1">
          Store performance metrics and management shortcuts.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cardItems.map((item, idx) => (
          <div key={idx} className="glass-card p-5 flex items-center gap-4 border border-white/5 bg-white/5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border flex-shrink-0 ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#9d8bbb] tracking-wider">{item.label}</p>
              <h3 className="font-bold text-base md:text-xl text-white mt-0.5">{item.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="glass-card p-6 flex flex-col gap-4 border border-white/5 bg-white/5">
        <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          📈 Sales Revenue Performance Trend
        </h3>
        <div className="w-full overflow-hidden bg-dark-900/50 rounded-2xl border border-white/5 p-4 flex flex-col items-center">
          {trends.length === 0 ? (
            <p className="font-serif italic text-[11px] text-[#9d8bbb] py-10">Waiting for transaction history to generate chart...</p>
          ) : (
            <div className="w-full max-w-2xl flex flex-col gap-4">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
                {/* Defs for gradient */}
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d946ef" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal reference lines */}
                <line x1="10" y1="15" x2={chartWidth - 10} y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="10" y1="55" x2={chartWidth - 10} y2="55" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="10" y1="95" x2={chartWidth - 10} y2="95" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Fill area under curve */}
                {trends.length > 1 && (
                  <polygon
                    points={`20,${chartHeight - 10} ${points} ${chartWidth - 20},${chartHeight - 10}`}
                    fill="url(#chartGrad)"
                  />
                )}

                {/* Line path */}
                <polyline
                  fill="none"
                  stroke="url(#purpleGrad)" // custom theme gradient or fallbacks
                  strokeWidth="2"
                  points={points}
                  className="stroke-primary-400"
                />

                {/* Dots on nodes */}
                {trends.map((t, idx) => {
                  const x = (idx / (trends.length - 1 || 1)) * (chartWidth - 40) + 20;
                  const y = chartHeight - (t.amount / maxSales) * (chartHeight - 30) - 15;
                  return (
                    <g key={idx} className="group cursor-pointer">
                      <circle cx={x} cy={y} r="3" className="fill-white stroke-primary-500 stroke-2" />
                      <circle cx={x} cy={y} r="8" className="fill-transparent hover:fill-primary-500/20 transition-all" />
                    </g>
                  );
                })}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between px-4 text-[9px] text-[#9d8bbb] font-semibold uppercase tracking-wider">
                {trends.map((t, idx) => (
                  <span key={idx}>{t.date}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products */}
        <div className="glass-card p-6 flex flex-col gap-4 border border-white/5 bg-white/5">
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <FiStar className="text-yellow-400" /> Best Selling Products
          </h3>
          <div className="flex flex-col gap-3">
            {stats.topProducts.map((item, idx) => {
              const prod = item.product;
              const thumb = prod.images?.[0] || "https://placehold.co/50x50/1e1830/f0e8ff?text=P";
              return (
                <div key={idx} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                  <span className="font-serif italic text-[#9d8bbb] text-sm w-4">#{idx + 1}</span>
                  <img src={thumb} alt="" className="w-9 h-11 object-cover rounded bg-dark-900 border border-white/5" />
                  <div className="flex-grow">
                    <p className="font-semibold text-white truncate max-w-[200px]">{prod.name}</p>
                    <p className="text-[10px] text-[#9d8bbb] mt-0.5">{prod.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{item.quantitySold} units</p>
                    <p className="text-[9px] text-[#9d8bbb] mt-0.5">₹{(prod.price * item.quantitySold).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              );
            })}

            {stats.topProducts.length === 0 && (
              <p className="font-serif italic text-xs text-[#9d8bbb] text-center py-6">No sales recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-card p-6 flex flex-col gap-4 border border-white/5 bg-white/5">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <FiClock /> Recent Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-[10px] font-semibold text-primary-300 hover:text-white uppercase tracking-wider flex items-center gap-1"
            >
              View All <FiArrowUpRight />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="font-semibold text-white">Order #{o._id.substring(o._id.length - 8)}</p>
                  <p className="text-[10px] text-[#9d8bbb] mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")} · 📞 {o.shippingAddress?.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">₹{o.totalAmount.toLocaleString("en-IN")}</p>
                  <span className="inline-block mt-1 text-[8px] uppercase tracking-wider font-bold text-primary-300">
                    {o.orderStatus}
                  </span>
                </div>
              </div>
            ))}

            {recentOrders.length === 0 && (
              <p className="font-serif italic text-xs text-[#9d8bbb] text-center py-6">No orders found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
