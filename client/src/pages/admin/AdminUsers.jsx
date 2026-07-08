import { useState, useEffect } from "react";
import { FiUsers, FiCheck, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      if (data && data.success) {
        setUsers(data.data || []);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (userObj) => {
    const action = userObj.isBlocked ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} user "${userObj.name}"?`)) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      const { data } = await api.put(`/admin/users/${userObj._id}/toggle-active`);
      if (data && data.success) {
        setSuccessMsg(`User status updated: ${userObj.name} is now ${userObj.isBlocked ? "active" : "blocked"}.`);
        fetchUsers();
      }
    } catch (err) {
      setErrorMsg("Failed to update user status.");
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans text-xs">
      <div className="flex justify-between items-center border-b border-white/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-white tracking-wide">
            Manage Users
          </h1>
          <p className="font-serif italic text-[#9d8bbb] text-xs mt-1">
            Browse accounts, audit roles, and toggle user active states.
          </p>
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

      {/* Users table */}
      <div className="glass-card p-6 flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-10 font-serif italic text-[#9d8bbb]">Loading users...</div>
        ) : users.length === 0 ? (
          <p className="font-serif italic text-xs text-[#9d8bbb] text-center py-6">No users found.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#9d8bbb] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Joined Date</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="py-3.5 px-2 text-white font-semibold flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center font-bold text-[10px] text-primary-300">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </td>
                    <td className="py-3.5 px-2 text-[#9d8bbb]">{u.email}</td>
                    <td className="py-3.5 px-2">
                      <span className={`badge text-[9px] capitalize ${u.role === "admin" ? "bg-primary-500/20 text-primary-300 border-primary-500/30" : ""}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-[#9d8bbb]">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-2">
                      {u.isBlocked ? (
                        <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider text-[8px] border border-rose-500/20">Blocked</span>
                      ) : (
                        <span className="text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider text-[8px] border border-green-500/20">Active</span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`text-[9px] uppercase font-semibold border px-2.5 py-1.5 rounded transition-colors ${
                            u.isBlocked
                              ? "text-green-400 bg-green-500/5 hover:bg-green-500/10 border-green-500/25"
                              : "text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/25"
                          }`}
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#9d8bbb] italic font-serif">Restricted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
