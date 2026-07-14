import { useState } from "react";
import { FiArrowLeft, FiPhone, FiUser } from "react-icons/fi";
import api from "../api/axios";

export default function PhoneOtpAuth({ onAuthenticated }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/phone/request-otp", { phone });
      setMessage(data.message);
      setStep("verify");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send an OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/phone/verify-otp", { phone, otp, name });
      onAuthenticated(data);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-lg px-4 py-3">{error}</div>}
      {message && <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs rounded-lg px-4 py-3">{message}</div>}

      {step === "phone" ? (
        <form onSubmit={requestOtp} className="flex flex-col gap-3">
          <label className="text-[10px] text-white/50 uppercase font-semibold font-sans tracking-wider">Mobile number</label>
          <div className="relative">
            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              placeholder="9876543210 or +919876543210"
              className="w-full text-sm bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-white font-sans transition-colors"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="flex flex-col gap-3">
          <button type="button" onClick={() => { setStep("phone"); setError(""); setMessage(""); }} className="w-fit flex items-center gap-1 text-xs text-primary-300 hover:text-white">
            <FiArrowLeft /> Change mobile number
          </button>
          <label className="text-[10px] text-white/50 uppercase font-semibold font-sans tracking-wider">Full name <span className="normal-case tracking-normal">(new customers only)</span></label>
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" className="w-full text-sm bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-white font-sans transition-colors" />
          </div>
          <label className="text-[10px] text-white/50 uppercase font-semibold font-sans tracking-wider">One-time password</label>
          <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength="8" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required placeholder="Enter OTP" className="w-full text-center tracking-[0.4em] text-sm bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-3 px-4 text-white font-sans transition-colors" />
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {loading ? "Verifying…" : "Verify and continue"}
          </button>
        </form>
      )}
    </div>
  );
}
