import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    parentCategory: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/categories");
      if (data && data.success) {
        setCategories(data.data || []);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This might orphan sub-categories or products!")) return;
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.delete(`/categories/${id}`);
      setSuccessMsg("Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      setErrorMsg("Failed to delete category.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data } = await api.post("/categories", {
        name: form.name,
        parentCategory: form.parentCategory || undefined,
      });
      if (data && data.success) {
        setSuccessMsg("Category added successfully!");
        setShowAddForm(false);
        setForm({ name: "", parentCategory: "" });
        fetchCategories();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create category.");
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans text-xs">
      <div className="flex justify-between items-center border-b border-white/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-white tracking-wide">
            Manage Categories
          </h1>
          <p className="font-serif italic text-[#9d8bbb] text-xs mt-1">
            Build product taxonomies and nest sub-categories.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary py-2.5 px-5 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5"
          >
            <FiPlus /> Add Category
          </button>
        )}
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

      {/* Add Category Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-4 max-w-md animate-slide-up">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-sans font-bold text-sm uppercase tracking-wide">New Category</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-white/60 hover:text-white">
              <FiX />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-semibold text-white/50">Category Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ethnic Wear or Heels"
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-semibold text-white/50">Parent Category (Optional)</label>
              <select
                value={form.parentCategory}
                onChange={(e) => setForm({ ...form, parentCategory: e.target.value })}
                className="bg-dark-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
              >
                <option value="">None (Creates Parent Category)</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 border border-white/10 text-white/60 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 btn-primary rounded-xl justify-center">
              Create Category
            </button>
          </div>
        </form>
      )}

      {/* Categories tree lists */}
      {loading ? (
        <div className="text-center py-10 font-serif italic text-[#9d8bbb]">Loading categories...</div>
      ) : categories.length === 0 ? (
        <p className="font-serif italic text-xs text-[#9d8bbb] text-center py-6">No categories found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat._id} className="glass-card p-6 flex flex-col gap-4 border border-white/5 bg-white/5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-display font-bold text-base text-white">{cat.name}</span>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/5 hover:bg-rose-500/10 rounded border border-rose-500/10 transition-colors"
                >
                  <FiTrash2 className="text-xs" />
                </button>
              </div>

              {/* Sub-categories */}
              <div className="flex flex-col gap-2.5 pl-4 border-l border-white/5">
                <span className="text-[9px] uppercase font-semibold text-white/40">Subcategories</span>
                {cat.subCategories && cat.subCategories.length > 0 ? (
                  cat.subCategories.map((sub) => (
                    <div key={sub._id} className="flex justify-between items-center py-1">
                      <span className="text-[#9d8bbb] font-sans text-xs">· {sub.name}</span>
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="text-rose-400 hover:text-rose-300 text-[10px] uppercase font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="font-serif italic text-[10px] text-[#9d8bbb]">No sub-categories linked.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
