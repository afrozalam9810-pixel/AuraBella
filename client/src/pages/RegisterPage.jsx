import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { setCredentials } from "../store/slices/authSlice";
import api from "../api/axios";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side Validation
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password
      });
      dispatch(setCredentials({ user: data.user, token: data.token }));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.assign(`${api.defaults.baseURL}/auth/google`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="glass-card w-full max-w-md p-8 md:p-10 flex flex-col gap-7">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white tracking-wide">
            Join AuraBella
          </h1>
          <p className="font-serif italic text-[#9d8bbb] mt-2 text-sm">
            Create your account and discover your aura
          </p>
          <div className="divider mt-4" />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-lg px-4 py-3 font-sans">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/50 uppercase font-semibold font-sans tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="w-full text-sm bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-white font-sans transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/50 uppercase font-semibold font-sans tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full text-sm bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-white font-sans transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/50 uppercase font-semibold font-sans tracking-wider">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="At least 8 characters"
                className="w-full text-sm bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-3 pl-11 pr-11 text-white font-sans transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-sm transition-colors"
              >
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/50 uppercase font-semibold font-sans tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input
                type={showPass ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repeat password"
                className="w-full text-sm bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-3 pl-11 pr-11 text-white font-sans transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-white/30 text-[10px] uppercase tracking-wider">
          <span className="h-px flex-1 bg-white/10" /> Or continue with <span className="h-px flex-1 bg-white/10" />
        </div>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full py-3 border border-white/15 rounded-xl text-sm font-semibold text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-3"
        >
          <FcGoogle className="text-xl" /> Continue with Google
        </button>

        <p className="text-center font-sans text-xs text-[#9d8bbb]">
          Already have an account?{" "}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary-300 hover:text-white transition-colors font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
