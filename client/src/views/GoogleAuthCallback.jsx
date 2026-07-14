import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setCredentials } from "../store/slices/authSlice";
import api from "../api/axios";

export default function GoogleAuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const finishGoogleSignIn = async () => {
      const providerError = searchParams.get("error");
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
      window.history.replaceState(null, "", "/auth/google/callback");

      if (providerError || !token) {
        setError(providerError || "Google sign-in did not return a session.");
        return;
      }

      try {
        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(setCredentials({ user: data.user, token }));
        navigate("/account", { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || "Could not complete Google sign-in.");
      }
    };

    finishGoogleSignIn();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <p className="font-sans text-sm text-white/70">
        {error || "Completing Google sign-in…"}
      </p>
    </div>
  );
}
