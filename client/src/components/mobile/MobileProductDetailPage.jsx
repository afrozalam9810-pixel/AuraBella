import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { FiHeart, FiShoppingBag, FiStar, FiChevronDown, FiMinus, FiPlus, FiAlertCircle } from "react-icons/fi";
import MobileSkeletonLoader from "./MobileSkeletonLoader";
import MobileProductCard from "./MobileProductCard";

export default function MobileProductDetailPage({
  product,
  relatedProducts = [],
  isWishlisted,
  selectedSize,
  selectedColor,
  setSelectedSize,
  setSelectedColor,
  qty,
  setQty,
  activeImageIdx,
  setActiveImageIdx,
  reviewForm,
  setReviewForm,
  submittingReview,
  reviewError,
  reviewSuccess,
  handleAddToCart,
  handleWishlistToggle,
  handleReviewSubmit,
  ratingBreakdown = {},
  uniqueSizes = [],
  uniqueColors = [],
  getCombinationStock,
  currentCombinationStock,
}) {
  const [activeAccordion, setActiveAccordion] = useState("description"); // description | specs | delivery | reviews

  // Embla Gallery configuration
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      const currentIdx = emblaApi.selectedScrollSnap();
      setSelectedIndex(currentIdx);
      setActiveImageIdx(currentIdx);
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, setActiveImageIdx]);

  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== activeImageIdx) {
      emblaApi.scrollTo(activeImageIdx);
    }
  }, [emblaApi, activeImageIdx]);

  const toggleAccordion = (name) => {
    if (activeAccordion === name) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(name);
    }
  };

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = product.discountPrice ?? product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="bg-dark-950 min-h-screen text-white pb-36 md:hidden">
      {/* 1. Swipeable Product Gallery */}
      <section className="relative w-full aspect-square bg-dark-900 border-b border-white/5" aria-label="Product Images Gallery">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {product.images?.map((img, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 h-full relative">
                <img
                  src={img}
                  alt={`${product.name} - View ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "low"}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Dots pagination */}
        {product.images?.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to image slide ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "bg-primary-400 w-3" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Wishlist toggle Overlay */}
        <button
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md z-10 transition-all ${
            isWishlisted
              ? "bg-rose-500/90 border-rose-400/50 text-white shadow-glow-rose"
              : "bg-dark-950/60 border-white/10 text-white/70"
          }`}
        >
          <FiHeart className={`text-sm ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </section>

      {/* 2. Core Product Information */}
      <section className="p-4 flex flex-col gap-2 border-b border-white/5 bg-dark-900/20">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wider text-[#9d8bbb] font-bold">
            {product.brand}
          </p>
          {product.numReviews > 0 && (
            <div className="bg-dark-950 border border-white/5 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-sans text-white/95">
              <span className="font-bold text-champagne-400">{product.avgRating}</span>
              <FiStar className="text-champagne-400 fill-current text-[8px]" />
              <span className="text-white/30">|</span>
              <span className="text-white/60">{product.numReviews} Reviews</span>
            </div>
          )}
        </div>

        <h1 className="font-display font-semibold text-lg text-white leading-tight">
          {product.name}
        </h1>

        {/* Price Tag Details */}
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <span className="text-xl font-bold text-white">
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-white/35 line-through">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-rose-500 font-semibold">
                ({discountPct}% OFF)
              </span>
            </>
          )}
        </div>
        <p className="text-[10px] text-green-500 font-sans mt-0.5">Inclusive of all taxes</p>
      </section>

      {/* 3. Variants Selection Panel */}
      <section className="p-4 flex flex-col gap-4 border-b border-white/5">
        {/* Colors Selection */}
        {uniqueColors.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9d8bbb]">
              Select Color
            </h3>
            <div className="flex gap-2">
              {uniqueColors.map((color) => {
                const isSelected = selectedColor === color;
                const isAvailable = getCombinationStock(selectedSize, color) > 0;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    disabled={!isAvailable && selectedSize !== ""}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isSelected
                        ? "bg-primary-500/10 border-primary-500/40 text-primary-400"
                        : isAvailable
                        ? "bg-white/5 border-white/10 text-white/80"
                        : "bg-white/5 border-dashed border-white/5 text-white/30"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sizes Selection */}
        {uniqueSizes.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9d8bbb]">
              Select Size
            </h3>
            <div className="flex gap-2">
              {uniqueSizes.map((size) => {
                const isSelected = selectedSize === size;
                const isAvailable = getCombinationStock(size, selectedColor) > 0;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!isAvailable && selectedColor !== ""}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isSelected
                        ? "bg-primary-500/10 border-primary-500/40 text-primary-400"
                        : isAvailable
                        ? "bg-white/5 border-white/10 text-white/80"
                        : "bg-white/5 border-dashed border-white/5 text-white/30"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Select Counter */}
        <div className="flex items-center gap-4 mt-1">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#9d8bbb]">Quantity</span>
          <div className="flex items-center border border-white/10 rounded-lg bg-dark-900">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              aria-label="Decrease quantity"
              className="px-2.5 py-1.5 text-white/50 hover:text-white"
            >
              <FiMinus className="text-xs" />
            </button>
            <span className="px-3 text-xs font-semibold font-sans">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              aria-label="Increase quantity"
              className="px-2.5 py-1.5 text-white/50 hover:text-white"
            >
              <FiPlus className="text-xs" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Specifications & Accordions */}
      <section className="flex flex-col border-b border-white/5">
        {/* Description Accordion */}
        <div className="border-b border-white/5">
          <button
            onClick={() => toggleAccordion("description")}
            aria-expanded={activeAccordion === "description"}
            className="w-full py-4 px-4 flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-left text-[#f0e8ff]/90"
          >
            <span>Product Description</span>
            <FiChevronDown className={`text-base transition-transform ${activeAccordion === "description" ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === "description" ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}>
            <p className="px-4 pb-4 text-xs font-sans text-white/70 leading-relaxed break-words">
              {product.description}
            </p>
          </div>
        </div>

        {/* Specifications Accordion */}
        <div className="border-b border-white/5">
          <button
            onClick={() => toggleAccordion("specs")}
            aria-expanded={activeAccordion === "specs"}
            className="w-full py-4 px-4 flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-left text-[#f0e8ff]/90"
          >
            <span>Specifications</span>
            <FiChevronDown className={`text-base transition-transform ${activeAccordion === "specs" ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === "specs" ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-4 flex flex-col gap-2 text-xs font-sans text-white/70">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Weight</span>
                <span>{product.packageWeight || "Standard"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Dimensions</span>
                <span>{product.packageDimensions || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">GST Rate</span>
                <span>{product.taxBreakdown?.gstRate ? `${product.taxBreakdown.gstRate}%` : "18% (included)"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Estimated Delivery</span>
                <span>Ships in 2-3 business days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Accordion */}
        <div className="border-b border-white/5">
          <button
            onClick={() => toggleAccordion("reviews")}
            aria-expanded={activeAccordion === "reviews"}
            className="w-full py-4 px-4 flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-left text-[#f0e8ff]/90"
          >
            <span>Customer Reviews ({product.reviews?.length || 0})</span>
            <FiChevronDown className={`text-base transition-transform ${activeAccordion === "reviews" ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === "reviews" ? "max-h-[500px] overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-4 flex flex-col gap-4">
              {/* Review submit form */}
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <h4 className="text-[10px] uppercase font-bold text-primary-400">Write a Review</h4>
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-wide block mb-1">Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-primary-400"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/50 uppercase tracking-wide block mb-1">Comment</label>
                  <textarea
                    rows={2}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Write your experience..."
                    className="w-full text-xs bg-dark-900 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary-400 text-white font-sans"
                    required
                  />
                </div>
                {reviewError && <p className="text-[10px] text-rose-500 font-sans">{reviewError}</p>}
                {reviewSuccess && <p className="text-[10px] text-green-500 font-sans">{reviewSuccess}</p>}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2 bg-brand-gradient text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm active:scale-[0.98]"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>

              {/* Review comments list */}
              {product.reviews && product.reviews.length > 0 ? (
                <div className="flex flex-col gap-3 mt-2">
                  {product.reviews.map((r, idx) => (
                    <div key={idx} className="p-3 border border-white/5 rounded-xl bg-dark-900/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-white/90 truncate">{r.name || "Customer"}</span>
                        <div className="flex items-center gap-0.5 text-[#9d8bbb]">
                          <span className="text-[10px] font-sans font-bold">{r.rating}</span>
                          <FiStar className="text-champagne-400 fill-current text-[8px]" />
                        </div>
                      </div>
                      <p className="text-[11px] font-sans text-white/60 leading-relaxed mt-1 break-words">
                        {r.comment}
                      </p>
                      <span className="text-[8px] text-white/30 block mt-1.5">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-white/30 font-sans text-center py-4">No customer reviews yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Related Products Horizontal Rails */}
      {relatedProducts.length > 0 && (
        <section className="px-4 py-6 border-b border-white/5">
          <h2 className="text-xs uppercase tracking-widest text-[#9d8bbb] font-bold mb-3">
            ✦ Similar Products
          </h2>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
            {relatedProducts.map((prod) => (
              <div key={prod._id} className="w-[140px] flex-shrink-0 snap-start">
                <MobileProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Sticky Bottom CTA Bar
           Positioned above MobileBottomNavigation (z-[90], ~52px tall) using
           a safe-area-aware bottom offset so it is always visible above the tab bar. */}
      <div className="fixed inset-x-0 bg-dark-950 border-t border-white/10 p-3.5 flex gap-3 z-[80] shadow-glow-dark md:hidden select-none" style={{ bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))' }}>
        {currentCombinationStock <= 0 && (
          <div className="absolute -top-7 inset-x-0 flex justify-center">
            <span className="bg-dark-900 border border-white/10 text-rose-400 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        <button
          onClick={() => handleAddToCart(false)}
          disabled={currentCombinationStock <= 0}
          aria-label="Add this product to shopping bag"
          className={`flex-1 py-3 border font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-opacity ${
            currentCombinationStock <= 0
              ? "border-white/5 text-white/25 cursor-not-allowed opacity-40"
              : "border-white/15 text-white/95 active:bg-white/5"
          }`}
        >
          <FiShoppingBag className="text-sm" />
          <span>Add to Bag</span>
        </button>
        <button
          onClick={() => handleAddToCart(true)}
          disabled={currentCombinationStock <= 0}
          aria-label="Buy this product now"
          className={`flex-1 py-3 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-opacity ${
            currentCombinationStock <= 0
              ? "bg-white/5 text-white/25 cursor-not-allowed opacity-40"
              : "bg-brand-gradient text-white shadow-glow-violet active:scale-[0.98]"
          }`}
        >
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
