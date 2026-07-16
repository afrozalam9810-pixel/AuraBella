import { useState, useEffect } from "react";

/**
 * Returns true when the viewport width is ≤ 767 px (mobile breakpoint).
 *
 * Deliberately initialises to `false` (the server-side value) so that the
 * SSR-rendered HTML always matches the initial client render, avoiding React
 * hydration mismatches. The real value is applied in useEffect, after the
 * component has mounted, so mobile users see a brief desktop flash on very
 * first render — acceptable trade-off vs. a broken hydration tree.
 */
export function useIsMobile() {
  // Always start false — identical to the server-side value.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const listener = () => setIsMobile(media.matches);

    // Immediately check after mount so mobile users get the correct layout
    // on the very first paint after hydration.
    listener();

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
}
