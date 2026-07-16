/**
 * useAppHydration.js
 *
 * Fires exactly once after the app boots to hydrate Redux cart and wishlist
 * from the backend, if the user has a valid token.
 *
 * Rules:
 * - Only runs when `isAuthenticated` is true.
 * - Guarded by a module-level flag so duplicate mounts never re-fetch.
 * - Uses the existing /cart and /wishlist authenticated endpoints.
 * - No new API calls, no new Redux actions beyond the existing thunks.
 */
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../store/slices/cartSlice";
import { fetchWishlist } from "../store/slices/wishlistSlice";

// Module-level flag: survive React StrictMode double-invoke; reset on logout.
let hydrated = false;

export function resetHydration() {
  hydrated = false;
}

export function useAppHydration() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const didRun = useRef(false);

  useEffect(() => {
    // Only hydrate once per authenticated session
    if (!isAuthenticated || hydrated || didRun.current) return;

    didRun.current = true;
    hydrated = true;

    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [isAuthenticated, dispatch]);
}
