import { useState, useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingBag, FiHeart, FiLogOut, FiMapPin, FiEdit, FiTrash2, FiPlus, FiX, FiCheck } from "react-icons/fi";
import { logout, setCredentials } from "../store/slices/authSlice";
import { clearCartLocal } from "../store/slices/cartSlice";
import { clearWishlist } from "../store/slices/wishlistSlice";
import api from "../api/axios";
import { useIsMobile } from "../hooks/useIsMobile";
import MobileSkeletonLoader from "../components/mobile/MobileSkeletonLoader";

const MobileAccountPage = lazy(() => import("../components/mobile/MobileAccountPage"));

export default function AccountPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Address CRUD States
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null for Add, ID for Edit
  const [addressForm, setAddressForm] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    isDefault: false,
  });
  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");

  // Sync profile details and addresses on mount
  const fetchUserData = async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data && data.success) {
        setProfileForm({ name: data.user.name, email: data.user.email });
        setAddresses(data.user.addresses || []);
        // Also update local Redux store user to keep in sync
        dispatch(setCredentials({ user: data.user, token: localStorage.getItem("token") }));
      }
    } catch (err) {
      console.error("Error fetching latest profile details", err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {
      // Ignore
    } finally {
      dispatch(clearCartLocal());    // clear cart from Redux immediately
      dispatch(clearWishlist());     // clear wishlist from Redux immediately
      dispatch(logout());            // clear auth state + resetHydration
      navigate("/login");
    }
  };

  // Submit Profile Edit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    try {
      const { data } = await api.put("/auth/profile", profileForm);
      if (data && data.success) {
        setProfileSuccess("Profile updated successfully!");
        setIsEditingProfile(false);
        fetchUserData();
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  // Submit Add / Edit Address
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError("");
    setAddressSuccess("");

    try {
      if (editingAddressId) {
        // Edit Address
        const { data } = await api.put(`/auth/addresses/${editingAddressId}`, addressForm);
        if (data && data.success) {
          setAddressSuccess("Address updated successfully!");
          setShowAddressForm(false);
          setEditingAddressId(null);
          fetchUserData();
        }
      } else {
        // Add Address
        const { data } = await api.post("/auth/addresses", addressForm);
        if (data && data.success) {
          setAddressSuccess("Address added successfully!");
          setShowAddressForm(false);
          fetchUserData();
        }
      }
    } catch (err) {
      setAddressError(err.response?.data?.message || "Failed to save address details.");
    }
  };

  // Populate form for Editing Address
  const handleEditAddressClick = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      label: addr.label || "Home",
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
      isDefault: addr.isDefault || false,
    });
    setShowAddressForm(true);
  };

  // Delete Address
  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const { data } = await api.delete(`/auth/addresses/${addrId}`);
      if (data && data.success) {
        setAddressSuccess("Address deleted successfully!");
        fetchUserData();
      }
    } catch (err) {
      setAddressError("Failed to delete address.");
    }
  };

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Suspense fallback={<MobileSkeletonLoader type="home" />}>
        <MobileAccountPage
          user={user}
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          isEditingProfile={isEditingProfile}
          setIsEditingProfile={setIsEditingProfile}
          profileError={profileError}
          profileSuccess={profileSuccess}
          handleProfileSubmit={handleProfileSubmit}
          addresses={addresses}
          showAddressForm={showAddressForm}
          setShowAddressForm={setShowAddressForm}
          editingAddressId={editingAddressId}
          addressForm={addressForm}
          setAddressForm={setAddressForm}
          addressError={addressError}
          addressSuccess={addressSuccess}
          handleAddressSubmit={handleAddressSubmit}
          handleEditAddressClick={handleEditAddressClick}
          handleDeleteAddress={handleDeleteAddress}
          handleLogout={handleLogout}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[80vh] max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 mb-10 gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-white uppercase tracking-wider">
            My Account
          </h1>
          <p className="font-serif italic text-[#9d8bbb] text-sm mt-2">
            Welcome back, {user?.name}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-sans font-semibold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider border border-rose-500/20 bg-rose-500/5 px-4 py-2 rounded-full self-start md:self-auto"
        >
          <FiLogOut /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT PROFILE PANEL */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider">Personal Profile</h3>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs font-semibold text-primary-300 hover:text-white flex items-center gap-1"
                >
                  <FiEdit /> Edit
                </button>
              )}
            </div>

            {profileSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl px-4 py-2.5 flex items-center gap-2">
                <FiCheck /> {profileSuccess}
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                {profileError && <span className="text-[10px] text-rose-400">{profileError}</span>}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/50 uppercase font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileError("");
                    }}
                    className="w-1/2 text-xs py-2.5 border border-white/10 text-white/60 hover:text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="w-1/2 text-xs py-2.5 btn-primary justify-center">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3 font-sans text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white text-base font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user?.name}</p>
                    <p className="text-[#9d8bbb] mt-0.5">{user?.email}</p>
                  </div>
                </div>
                <hr className="border-white/5 my-1" />
                <div className="flex justify-between text-[#9d8bbb]">
                  <span>Member Since</span>
                  <span className="text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "July 2026"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-card p-5 flex flex-col gap-3 font-sans text-xs">
            <h4 className="font-semibold text-[10px] uppercase tracking-wider text-white/40">Quick Links</h4>
            <Link to="/account/orders" className="flex items-center justify-between text-[#9d8bbb] hover:text-white py-1.5 transition-colors">
              <span className="flex items-center gap-2"><FiShoppingBag /> My Orders</span>
              <span>→</span>
            </Link>
            <Link to="/wishlist" className="flex items-center justify-between text-[#9d8bbb] hover:text-white py-1.5 transition-colors">
              <span className="flex items-center gap-2"><FiHeart /> My Wishlist</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* RIGHT ADDRESS BOOK PANEL */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider">Saved Shipping Addresses</h3>
              {!showAddressForm && (
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      label: "Home",
                      line1: "",
                      line2: "",
                      city: "",
                      state: "",
                      pincode: "",
                      phone: "",
                      isDefault: false,
                    });
                    setShowAddressForm(true);
                  }}
                  className="text-xs font-semibold text-primary-300 hover:text-white flex items-center gap-1"
                >
                  <FiPlus /> Add Address
                </button>
              )}
            </div>

            {addressSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl px-4 py-2.5 flex items-center gap-2">
                <FiCheck /> {addressSuccess}
              </div>
            )}

            {/* ADDRESS INPUT/EDIT FORM VIEW */}
            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className="flex flex-col gap-4 border border-white/10 rounded-2xl p-5 bg-white/5 animate-slide-up">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-2">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
                    {editingAddressId ? "Modify Address" : "New Address Details"}
                  </h4>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="text-white/60 hover:text-white">
                    <FiX />
                  </button>
                </div>

                {addressError && <span className="text-xs text-rose-400">{addressError}</span>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/50 uppercase font-semibold">Address Name Label</label>
                    <input
                      type="text"
                      required
                      placeholder="Home, Office etc."
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      className="text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/50 uppercase font-semibold">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[9px] text-white/50 uppercase font-semibold">Street Address Line 1</label>
                    <input
                      type="text"
                      required
                      placeholder="Street name, building address"
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                      className="text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[9px] text-white/50 uppercase font-semibold">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="Apartment, unit, floor, etc."
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                      className="text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/50 uppercase font-semibold">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Bangalore"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/50 uppercase font-semibold">State</label>
                    <input
                      type="text"
                      required
                      placeholder="Karnataka"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/50 uppercase font-semibold">Pincode</label>
                    <input
                      type="text"
                      required
                      placeholder="6 digits"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="text-xs bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold select-none sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="rounded border-white/10 text-primary-500 bg-white/5 w-4 h-4 cursor-pointer"
                    />
                    Set as default address
                  </label>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }}
                    className="text-xs px-5 py-2.5 border border-white/10 text-white/60 hover:text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="text-xs px-5 py-2.5 btn-primary rounded-xl justify-center">
                    {editingAddressId ? "Save Changes" : "Save Address"}
                  </button>
                </div>
              </form>
            )}

            {/* ADDRESS CARDS LIST VIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr._id} className="glass-card p-5 border border-white/5 bg-white/5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FiMapPin className="text-[#9d8bbb]" />
                      <span className="font-sans font-bold text-xs uppercase tracking-wider">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="badge text-[9px] px-2 py-0.5 ml-auto">Default</span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-[#9d8bbb] leading-relaxed truncate">{addr.line1}</p>
                    {addr.line2 && <p className="font-sans text-xs text-[#9d8bbb] leading-relaxed truncate">{addr.line2}</p>}
                    <p className="font-sans text-xs text-[#9d8bbb] leading-relaxed truncate">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="font-sans text-[10px] text-[#9d8bbb] mt-2 font-semibold">📞 {addr.phone}</p>
                  </div>

                  <div className="flex items-center gap-3 border-t border-white/5 pt-3 mt-1">
                    <button
                      onClick={() => handleEditAddressClick(addr)}
                      className="text-[10px] font-sans font-semibold uppercase tracking-wider text-primary-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <FiEdit /> Modify
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-[10px] font-sans font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 ml-auto"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              ))}

              {addresses.length === 0 && !showAddressForm && (
                <div className="sm:col-span-2 text-center p-12 border border-dashed border-white/10 rounded-2xl">
                  <p className="font-serif italic text-xs text-[#9d8bbb]">No saved shipping addresses yet. Click "Add Address" to start.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
