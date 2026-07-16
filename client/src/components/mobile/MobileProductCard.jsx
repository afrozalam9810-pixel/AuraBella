import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { addToCart } from "../../store/slices/cartSlice";
import { getProductUrl } from "../../utils/seo";

export default function MobileProductCard({ product, isWishlisted = false, onWishlistToggle }) {
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
      className="group block relative bg-dark-900 border border-white/5 rounded-2xl overflow-hidden shadow-sm"
      aria-label={`View details of ${brand} ${name}`}
    >
      {/* 1. Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-dark-800">
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-sm transition-all duration-300 ${
            wishlisted
              ? "bg-rose-500/95 border-rose-400/50 text-white shadow-glow-rose"
              : "bg-dark-950/60 border-white/10 text-white/70 hover:text-rose-400"
          }`}
        >
          <FiHeart className={`text-xs ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Discount Badge Overlay */}
        {discountPct && (
          <span className="absolute top-2 left-2 text-[8px] font-sans font-bold bg-rose-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wide">
            {discountPct}% OFF
          </span>
        )}

        {/* Rating Badge Overlay */}
        {numReviews > 0 && (
          <div className="absolute bottom-2 left-2 bg-dark-950/70 border border-white/5 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[8px] font-sans text-white/90">
            <span className="font-semibold text-champagne-400">{avgRating}</span>
            <FiStar className="text-champagne-400 fill-current text-[7px]" />
            <span className="text-white/40">|</span>
            <span className="text-white/60">{numReviews}</span>
          </div>
        )}
      </div>

      {/* 2. Product Info */}
      <div className="p-2.5 flex flex-col gap-0.5">
        <p className="font-sans text-[9px] text-[#9d8bbb] uppercase tracking-wider font-semibold truncate">
          {brand}
        </p>
        <h3 className="font-sans text-[11px] text-white/80 leading-tight truncate">
          {name}
        </h3>

        {/* Price layout */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-xs font-bold text-white">
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>
          {discountPrice && (
            <>
              <span className="text-[10px] text-white/30 line-through">
                ₹{price.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] text-rose-500 font-semibold uppercase">
                ({discountPct}% Off)
              </span>
            </>
          )}
        </div>

        {/* Quick Add CTA */}
        <button
          onClick={handleAddToCart}
          className={`w-full mt-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 text-[9px] font-sans font-bold uppercase tracking-wider transition-all duration-200 ${
            addedToCart
              ? "bg-green-600 text-white"
              : "bg-white/5 border border-white/10 text-white/80 active:bg-white/10 active:scale-[0.98]"
          }`}
        >
          <FiShoppingBag className="text-[10px]" />
          <span>{addedToCart ? "Added" : "Add to Bag"}</span>
        </button>
      </div>
    </Link>
  );
}
