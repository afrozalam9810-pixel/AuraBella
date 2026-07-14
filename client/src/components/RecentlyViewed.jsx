"use client";
/**
 * RecentlyViewed.jsx
 * Tracks and displays recently viewed products using localStorage.
 *
 * - Records up to 10 items in a "aurabella-recently-viewed" localStorage key
 * - Renders a horizontally scrollable product card carousel
 * - useRecentlyViewed hook is exported for use on product detail pages
 */

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const STORAGE_KEY = "aurabella-recently-viewed";
const MAX_ITEMS   = 10;

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Call this on any product detail page to record the view.
 * @param {{ _id: string, name: string, price: number, discountPrice?: number, images: string[], brand: string, slug?: string }} product
 */
export function useTrackRecentlyViewed(product) {
  useEffect(() => {
    if (!product?._id) return;

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      // Remove existing entry for this product (moves it to front)
      const filtered = stored.filter((p) => p._id !== product._id);
      const updated = [
        {
          _id:           product._id,
          name:          product.name,
          price:         product.price,
          discountPrice: product.discountPrice ?? null,
          image:         product.images?.[0] ?? "",
          brand:         product.brand ?? "",
          slug:          product.slug ?? product._id,
        },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage may be unavailable in private browsing — silent fail
    }
  }, [product?._id]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RecentlyViewed({ excludeId }) {
  const [items, setItems] = useState([]);
  const [scrollRef, setScrollRef] = useState(null);

  // Read from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      // Exclude the currently viewed product to avoid showing it in its own list
      setItems(stored.filter((p) => p._id !== excludeId));
    } catch {
      setItems([]);
    }
  }, [excludeId]);

  const scroll = useCallback(
    (direction) => {
      if (!scrollRef) return;
      scrollRef.scrollBy({ left: direction * 220, behavior: "smooth" });
    },
    [scrollRef]
  );

  if (items.length === 0) return null;

  return (
    <section className="py-10" aria-label="Recently Viewed Products">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <FiClock className="text-primary-400 text-lg" />
          <h2 className="font-display font-bold text-lg md:text-xl uppercase tracking-wider text-white">
            Recently Viewed
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-primary-400 transition-all"
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-primary-400 transition-all"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {/* Scrollable Rail */}
      <div
        ref={setScrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => {
          const effectivePrice = item.discountPrice ?? item.price;
          const hasDiscount    = item.discountPrice && item.discountPrice < item.price;

          return (
            <Link
              key={item._id}
              to={`/products/${item.slug || item._id}`}
              className="flex-shrink-0 w-44 snap-start group"
              aria-label={`View ${item.name}`}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/5 bg-dark-800 mb-3">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                    No image
                  </div>
                )}
                {hasDiscount && (
                  <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                    Sale
                  </span>
                )}
              </div>

              {/* Info */}
              <p className="text-[11px] text-[#9d8bbb] font-sans uppercase tracking-wider truncate">
                {item.brand}
              </p>
              <p className="text-sm text-white font-semibold leading-tight line-clamp-2 mt-0.5 group-hover:text-primary-300 transition-colors">
                {item.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-white">
                  ₹{effectivePrice.toLocaleString("en-IN")}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-white/30 line-through">
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
