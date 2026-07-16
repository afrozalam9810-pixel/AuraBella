import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiShoppingBag, FiHeart, FiLogOut, FiMapPin, FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";

export default function MobileAccountPage({
  user,
  profileForm,
  setProfileForm,
  isEditingProfile,
  setIsEditingProfile,
  profileError,
  profileSuccess,
  handleProfileSubmit,
  addresses = [],
  showAddressForm,
  setShowAddressForm,
  editingAddressId,
  addressForm,
  setAddressForm,
  addressError,
  addressSuccess,
  handleAddressSubmit,
  handleEditAddressClick,
  handleDeleteAddress,
  handleLogout,
}) {
  return (
    <div className="bg-dark-950 min-h-screen text-white pb-24 md:hidden select-none">
      {/* 1. Profile Header Banner */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white text-lg font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{user?.name}</h1>
            <p className="text-[10px] text-white/50 font-sans">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Sign out of account"
          className="text-white/40 hover:text-rose-400 p-2"
        >
          <FiLogOut className="text-lg" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-5">
        
        {/* 2. Personal Profile Section */}
        <div className="bg-dark-900 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9d8bbb]">
              Personal Details
            </h3>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-[10px] font-bold text-primary-400 flex items-center gap-1"
              >
                <FiEdit /> Edit
              </button>
            )}
          </div>

          {profileSuccess && (
            <p className="text-[10px] text-green-500 font-sans">{profileSuccess}</p>
          )}

          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3 text-xs">
              {profileError && <p className="text-[10px] text-rose-500 font-sans">{profileError}</p>}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="bg-dark-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary-400"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="bg-dark-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary-400"
                  required
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2 border border-white/10 rounded-lg text-[10px] font-bold text-white/60 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-1 font-sans text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Registered Name</span>
                <span className="font-semibold text-white/90">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/44">Member Since</span>
                <span className="text-white/90">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "July 2026"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Shipping Address Book CRUD */}
        <div className="bg-dark-900 border border-white/5 p-4 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9d8bbb]">
              Address Book
            </h3>
            {!showAddressForm && (
              <button
                onClick={() => {
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
                className="text-[10px] font-bold text-primary-400 flex items-center gap-1"
              >
                <FiPlus /> Add
              </button>
            )}
          </div>

          {addressSuccess && (
            <p className="text-[10px] text-green-500 font-sans">{addressSuccess}</p>
          )}

          {/* Address form drawer */}
          {showAddressForm ? (
            <form onSubmit={handleAddressSubmit} className="flex flex-col gap-3 text-xs border border-white/10 rounded-xl p-3 bg-dark-950/40">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary-400 border-b border-white/5 pb-1">
                {editingAddressId ? "Edit Address" : "New Address Details"}
              </h4>
              {addressError && <p className="text-[10px] text-rose-500 font-sans">{addressError}</p>}
              <input
                type="text"
                placeholder="Label (e.g. Home, Work)"
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                className="bg-dark-950 border border-white/10 rounded-lg p-2 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Street Address Line 1"
                value={addressForm.line1}
                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                className="bg-dark-950 border border-white/10 rounded-lg p-2 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Street Address Line 2"
                value={addressForm.line2}
                onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                className="bg-dark-950 border border-white/10 rounded-lg p-2 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="bg-dark-950 border border-white/10 rounded-lg p-2 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="bg-dark-950 border border-white/10 rounded-lg p-2 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  className="bg-dark-950 border border-white/10 rounded-lg p-2 focus:outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="bg-dark-950 border border-white/10 rounded-lg p-2 focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="flex-1 py-2 border border-white/10 rounded-lg text-[10px] font-bold text-white/60 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                >
                  Save
                </button>
              </div>
            </form>
          ) : addresses.length > 0 ? (
            <div className="flex flex-col gap-2">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="bg-dark-950/40 border border-white/5 p-3 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold text-primary-400 bg-white/5 px-2 py-0.5 rounded">
                        {addr.label}
                      </span>
                      {addr.isDefault && <span className="text-[8px] bg-green-600 text-white px-1.5 py-0.5 rounded font-sans uppercase font-bold">Default</span>}
                    </div>
                    <p className="font-sans leading-tight">
                      {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <span className="text-[10px] text-white/50">Phone: {addr.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditAddressClick(addr)}
                      aria-label="Edit address entry"
                      className="text-white/40 hover:text-white p-1"
                    >
                      <FiEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      aria-label="Delete address entry"
                      className="text-white/40 hover:text-rose-400 p-1"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-white/30 font-sans text-center py-4">No shipping addresses saved yet.</p>
          )}
        </div>

        {/* 4. Quick Links Shortcuts */}
        <div className="bg-dark-900 border border-white/5 p-4 rounded-xl flex flex-col gap-2.5 font-sans text-xs">
          <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9d8bbb] mb-1">
            Shortcuts
          </h3>
          <Link
            to="/account/orders"
            className="flex items-center justify-between py-1.5 border-b border-white/5 text-white/80 hover:text-white"
          >
            <span className="flex items-center gap-2"><FiShoppingBag className="text-primary-400" /> My Orders</span>
            <span>→</span>
          </Link>
          <Link
            to="/wishlist"
            className="flex items-center justify-between py-1.5 text-white/80 hover:text-white"
          >
            <span className="flex items-center gap-2"><FiHeart className="text-primary-400" /> My Wishlist</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
