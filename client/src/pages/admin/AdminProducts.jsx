import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiTrash2, FiEdit, FiSearch, FiCheck, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products?limit=100");
      if (data && data.success) {
        setProducts(data.data || []);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.delete(`/products/${id}`);
      setSuccessMsg("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      setErrorMsg("Failed to delete product.");
    }
  };

  // Local Search filter
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      (p.category?.name && p.category.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col gap-8 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-5 gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-white tracking-wide">
            Manage Products
          </h1>
          <p className="font-serif italic text-[#9d8bbb] text-xs mt-1">
            Create catalog items, specify prices, and check stock levels.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="btn-primary py-2.5 px-5 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FiPlus /> Add Product
        </Link>
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

      {/* Toolbar / Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-dark-800/40 border border-white/5 p-4 rounded-2xl">
        <div className="relative flex-grow max-w-sm">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
          <input
            type="text"
            placeholder="Search by name, brand, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-2.5 pl-11 pr-4 text-white transition-colors"
          />
        </div>
        <div className="text-xs text-[#9d8bbb] font-sans">
          Total: <span className="text-white font-semibold">{filteredProducts.length}</span> items
        </div>
      </div>

      {/* Products list table */}
      <div className="glass-card p-6 flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-10 font-serif italic text-[#9d8bbb]">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <p className="font-serif italic text-xs text-[#9d8bbb] text-center py-6">No products found matching query.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#9d8bbb] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Image</th>
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Brand</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const thumb = p.images?.[0] || "https://placehold.co/40x50/1e1830/f0e8ff?text=P";
                  return (
                    <tr key={p._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="py-2.5 px-2">
                        <img src={thumb} alt="" className="w-8 h-10 object-cover rounded bg-dark-900 border border-white/5" />
                      </td>
                      <td className="py-2.5 px-2 text-white font-semibold">{p.name}</td>
                      <td className="py-2.5 px-2 text-[#9d8bbb]">{p.brand}</td>
                      <td className="py-2.5 px-2 text-[#9d8bbb]">{p.category?.name || "Uncategorized"}</td>
                      <td className="py-2.5 px-2 text-white font-bold">
                        ₹{(p.discountPrice ?? p.price).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="text-primary-300 hover:text-white p-1.5 hover:bg-primary-500/10 rounded-lg transition-all"
                          >
                            <FiEdit className="text-base" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="text-rose-400 hover:text-rose-300 font-semibold p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                          >
                            <FiTrash2 className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
