import { Link, Outlet, useLocation } from "react-router-dom";
import { FiSliders, FiPackage, FiFolder, FiShoppingBag, FiTag, FiUsers, FiHome } from "react-icons/fi";

const SIDEBAR_ITEMS = [
  { path: "/admin", name: "Dashboard", icon: <FiSliders /> },
  { path: "/admin/products", name: "Products", icon: <FiPackage /> },
  { path: "/admin/categories", name: "Categories", icon: <FiFolder /> },
  { path: "/admin/orders", name: "Orders", icon: <FiShoppingBag /> },
  { path: "/admin/coupons", name: "Coupons", icon: <FiTag /> },
  { path: "/admin/users", name: "Users", icon: <FiUsers /> },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-dark-800 border-r border-white/5 py-8 px-4 flex flex-col gap-6 md:min-h-screen">
        <div className="px-3">
          <span className="badge text-[9px] tracking-widest uppercase mb-1">
            ✦ AuraBella Control
          </span>
          <h2 className="font-display font-bold text-xl text-white tracking-wider">
            Management Panel
          </h2>
        </div>

        <hr className="border-white/5" />

        <nav className="flex flex-col gap-1.5 flex-grow">
          {SIDEBAR_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-brand-gradient text-white shadow-glow-violet border-transparent"
                    : "text-[#9d8bbb] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <hr className="border-white/5" />

        <Link
          to="/"
          className="flex items-center gap-3.5 px-4 py-3 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider text-[#9d8bbb] hover:bg-white/5 hover:text-white transition-all"
        >
          <FiHome className="text-base" /> Back to Storefront
        </Link>
      </aside>

      {/* Main Admin Pages Panel */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
