import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axios";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage", // percentage | flat
    discountValue: "",
    expiryDate: "",
    minOrderValue: "0",
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/coupons");
      if (data && data.success) {
        setCoupons(data.data || []);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.delete(`/admin/coupons/${id}`);
      setSuccessMsg("Coupon deleted successfully!");
      fetchCoupons();
    } catch (err) {
      setErrorMsg("Failed to delete coupon.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data } = await api.post("/admin/coupons", {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        expiryDate: form.expiryDate,
        minOrderValue: Number(form.minOrderValue),
      });
      if (data && data.success) {
        setSuccessMsg(`Coupon "${data.data.code}" added successfully!`);
        setShowAddForm(false);
        setForm({ code: "", discountType: "percentage", discountValue: "", expiryDate: "", minOrderValue: "0" });
        fetchCoupons();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create coupon.");
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans text-xs">
      <div className="flex justify-between items-center border-b border-white/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-white tracking-wide">
            Manage Coupons
          </h1>
          <p className="font-serif italic text-[#9d8bbb] text-xs mt-1">
            Build promotional codes, establish values, and check validations.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary py-2.5 px-5 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5"
          >
            <FiPlus /> Add Coupon
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

      {/* Add Coupon Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-4 max-w-lg animate-slide-up">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-sans font-bold text-sm uppercase tracking-wide">New Promo Code</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-white/60 hover:text-white">
              <FiX />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-semibold text-white/50">Coupon Code</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="WELCOME10"
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-semibold text-white/50">Discount Type</label>
              <select
                required
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="bg-dark-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Cash (₹)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-semibold text-white/50">Discount Value</label>
              <input
                type="number"
                required
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                placeholder="10 or 500"
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-semibold text-white/50">Min Order Value (₹)</label>
              <input
                type="number"
                value={form.minOrderValue}
                onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                placeholder="1000"
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[9px] uppercase font-semibold text-white/50">Expiry Date</label>
              <input
                type="date"
                required
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
              />
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
              Create Coupon
            </button>
          </div>
        </form>
      )}

      {/* Coupon List Table */}
      <div className="glass-card p-6 flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-10 font-serif italic text-[#9d8bbb]">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <p className="font-serif italic text-xs text-[#9d8bbb] text-center py-6">No coupons created.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#9d8bbb] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Code</th>
                  <th className="py-3 px-2">Discount</th>
                  <th className="py-3 px-2">Min Order Required</th>
                  <th className="py-3 px-2">Expiry</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const expired = new Date() > new Date(c.expiryDate);
                  return (
                    <tr key={c._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="py-3.5 px-2 text-white font-bold tracking-wide">{c.code}</td>
                      <td className="py-3.5 px-2 text-white">
                        {c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      </td>
                      <td className="py-3.5 px-2 text-[#9d8bbb]">₹{c.minOrderValue.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-2 text-[#9d8bbb]">
                        {new Date(c.expiryDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-2">
                        {expired ? (
                          <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider text-[8px] border border-rose-500/20">Expired</span>
                        ) : (
                          <span className="text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider text-[8px] border border-green-500/20">Active</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-rose-400 hover:text-rose-300 font-semibold p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
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
