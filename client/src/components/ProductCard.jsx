/**
 * ProductCard.jsx
 * Reusable card for displaying a product in grids and carousels.
 * Props: product, onWishlistToggle, isWishlisted
 */

import { Link } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { addToCart } from "../store/slices/cartSlice";
import { getProductUrl } from "../utils/seo";

export default function ProductCard({ product, isWishlisted = false, onWishlistToggle }) {
  const dispatch = useDispatch();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [addedToCart, setAddedToCart] = useState(false);

  const {
    _id,
    name,
    brand,
    price,
    discountPrice,
    images,
    avgRating,
    numReviews,
    variants = [],
  } = product;

  const displayPrice = discountPrice ?? price;
  const discountPct = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;

  const image = images?.[0] || "https://placehold.co/400x500/1e1830/f0e8ff?text=AuraBella";

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !wishlisted;
    setWishlisted(next);
    onWishlistToggle?.(_id, next);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVariant = variants[0] || {};
    dispatch(
      addToCart({
        product: { _id, name, price, discountPrice, images },
        variant: { size: firstVariant.size || "", color: firstVariant.color || "" },
        qty: 1,
      })
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <Link
      to={getProductUrl(product)}
      className="group block relative bg-dark-800 rounded-2xl overflow-hidden border border-white/5 hover:border-primary-400/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      {/* Image container */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={image}
          alt={name}
          title={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5">
          {discountPct && (
            <span className="text-[9px] font-sans font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border backdrop-blur-sm ${
            wishlisted
              ? "bg-rose-500/90 border-rose-400/50 text-white shadow-glow-rose"
              : "bg-dark-900/60 border-white/10 text-white/60 hover:border-rose-400/50 hover:text-rose-400"
          }`}
        >
          <FiHeart className={`text-xs ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick add to cart — slides up on hover */}
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-2 inset-x-2 sm:bottom-3 sm:inset-x-3 flex items-center justify-center gap-1.5 py-2 rounded-full text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-wider transition-all duration-300 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 ${
            addedToCart
              ? "bg-green-600 text-white"
              : "bg-brand-gradient text-white shadow-glow-violet"
          }`}
        >
          <FiShoppingBag className="text-xs" />
          {addedToCart ? "Added!" : "Add to Bag"}
        </button>
      </div>

      {/* Info section */}
      <div className="p-3 md:p-4">
        <p className="font-sans text-[10px] text-[#9d8bbb] uppercase tracking-wider mb-1 truncate">
          {brand}
        </p>
        <h3 className="font-sans text-xs md:text-sm text-white/90 font-medium leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors min-h-[2.5rem]">
          {name}
        </h3>

        {/* Rating */}
        {numReviews > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <FiStar className="text-champagne-400 fill-current text-[10px]" />
            <span className="font-sans text-[10px] text-champagne-400 font-semibold">{avgRating}</span>
            <span className="font-sans text-[10px] text-white/30">({numReviews})</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-2">
          <span className="font-sans font-bold text-sm md:text-base text-white">
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>
          {discountPrice && (
            <span className="font-sans text-xs text-white/30 line-through">
              ₹{price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
