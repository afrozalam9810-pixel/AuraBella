"use client";

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart, FiShoppingBag, FiStar, FiChevronLeft, FiChevronRight, FiMinus, FiPlus, FiAlertCircle, FiCheck } from "react-icons/fi";
import { addToCart } from "../store/slices/cartSlice";
import { showToast } from "../store/slices/uiSlice";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import RecentlyViewed, { useTrackRecentlyViewed } from "../components/RecentlyViewed";
import { useIsMobile } from "../hooks/useIsMobile";
import MobileSkeletonLoader from "../components/mobile/MobileSkeletonLoader";

const MobileProductDetailPage = lazy(() => import("../components/mobile/MobileProductDetailPage"));

export default function ProductDetailPage({ initialProduct, initialRelatedProducts, id: propId }) {
  const { id: routeId } = useParams();
  const rawId = propId || routeId;
  const id = rawId && rawId.length >= 24 ? rawId.substring(0, 24) : rawId;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Authentication State
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // API Data States
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState(initialRelatedProducts || []);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Interactive Form / Selection States
  const [selectedSize, setSelectedSize] = useState(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      const firstInStock = initialProduct.variants.find((v) => v.stock > 0) || initialProduct.variants[0];
      return firstInStock.size || "";
    }
    return "";
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      const firstInStock = initialProduct.variants.find((v) => v.stock > 0) || initialProduct.variants[0];
      return firstInStock.color || "";
    }
    return "";
  });
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // description | reviews
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  // Review Form States
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Track product view for recently viewed carousel
  useTrackRecentlyViewed(product);

  const fetchRelatedProducts = async (prod) => {
    if (!prod.category) return;

    try {
      const categoryId = prod.category._id || prod.category;
      const { data } = await api.get(`/products?category=${categoryId}&limit=5`);
      if (data?.success) {
        setRelatedProducts(data.data.filter((item) => item._id !== prod._id));
      }
    } catch (_) {
      // Related products are optional and must not delay the main page.
    }
  };

  const fetchWishlistStatus = async (productId) => {
    if (!isAuthenticated) return;

    try {
      const { data } = await api.get("/wishlist");
      if (data?.success) {
        setIsWishlisted(data.data.some((item) => item._id === productId));
      }
    } catch (_) {
      // Wishlist status is optional for the initial product render.
    }
  };

  // Fetch the product first. Related products and wishlist state load after
  // the main product is visible instead of holding the page loader open.
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/products/${id}`);
      if (data && data.success) {
        const prod = data.data;
        setProduct(prod);

        // Pre-select first size/color variant if available
        if (prod.variants && prod.variants.length > 0) {
          const firstInStock = prod.variants.find((v) => v.stock > 0) || prod.variants[0];
          setSelectedSize(firstInStock.size || "");
          setSelectedColor(firstInStock.color || "");
        }

        setLoading(false);
        void fetchRelatedProducts(prod);
        void fetchWishlistStatus(prod._id);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Product not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialProduct && initialProduct._id === id) {
      setProduct(initialProduct);
      setRelatedProducts(initialRelatedProducts || []);
      setLoading(false);

      void fetchWishlistStatus(id);
      return;
    }

    fetchProductData();
    // Reset view specific states
    setQty(1);
    setActiveImageIdx(0);
    setReviewForm({ rating: 5, comment: "" });
    setReviewError("");
    setReviewSuccess("");
  }, [id, isAuthenticated, initialProduct, initialRelatedProducts]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | AuraBella`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", product.description.substring(0, 150));
      }
    }
  }, [product]);

  // Derived variants details
  const uniqueSizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.size))].filter(Boolean);
  }, [product]);

  const uniqueColors = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.color))].filter(Boolean);
  }, [product]);

  // Helper to check if a specific size/color combination is in stock
  const getCombinationStock = (size, color) => {
    if (!product?.variants) return 0;
    const match = product.variants.find(
      (v) => (!size || v.size === size) && (!color || v.color === color)
    );
    return match ? match.stock : 0;
  };

  const currentCombinationStock = useMemo(() => {
    return getCombinationStock(selectedSize, selectedColor);
  }, [selectedSize, selectedColor, product]);

  // Handle image hover-zoom
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${product?.images?.[activeImageIdx]})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  // Cart operations
  const handleAddToCart = (redirect = false) => {
    if (!product) return;
    dispatch(
      addToCart({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          images: product.images,
        },
        variant: {
          size: selectedSize,
          color: selectedColor,
        },
        qty,
      })
    );
    dispatch(showToast({ message: `Added ${product.name} to bag!`, type: "success" }));
    if (redirect) {
      navigate("/checkout");
    }
  };

  // Wishlist toggle operation
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${id}`);
        setIsWishlisted(false);
        dispatch(showToast({ message: "Item removed from wishlist.", type: "success" }));
      } else {
        await api.post(`/wishlist/${id}`);
        setIsWishlisted(true);
        dispatch(showToast({ message: "Item added to wishlist!", type: "success" }));
      }
    } catch (err) {
      console.error("Wishlist operation failed", err);
      dispatch(showToast({ message: "Failed to update wishlist state.", type: "error" }));
    }
  };

  // Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    setSubmittingReview(true);

    try {
      const { data } = await api.post(`/products/${id}/reviews`, reviewForm);
      if (data && data.success) {
        setReviewSuccess("Review submitted successfully!");
        setReviewForm({ rating: 5, comment: "" });
        // Refetch product data to refresh rating stats and reviews
        fetchProductData();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Compute rating breakdown percentages
  const ratingBreakdown = useMemo(() => {
    if (!product?.reviews) return {};
    const totalReviews = product.reviews.length;
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    product.reviews.forEach((r) => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });
    const percentages = {};
    for (let r = 1; r <= 5; r++) {
      percentages[r] = totalReviews > 0 ? Math.round((counts[r] / totalReviews) * 100) : 0;
    }
    return percentages;
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <FiAlertCircle className="text-rose-500 text-6xl" />
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">Product Not Found</h2>
          <p className="font-serif italic text-[#9d8bbb] mt-2 max-w-sm">
            {error || "The product you are trying to view does not exist or has been removed."}
          </p>
        </div>
        <Link to="/" className="btn-primary">Return to Home</Link>
      </div>
    );
  }

  // Price Calculation details
  const displayPrice = product.discountPrice ?? product.price;
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Suspense fallback={<MobileSkeletonLoader type="detail" />}>
        <MobileProductDetailPage
          product={product}
          relatedProducts={relatedProducts}
          isWishlisted={isWishlisted}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          setSelectedSize={setSelectedSize}
          setSelectedColor={setSelectedColor}
          qty={qty}
          setQty={setQty}
          activeImageIdx={activeImageIdx}
          setActiveImageIdx={setActiveImageIdx}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          submittingReview={submittingReview}
          reviewError={reviewError}
          reviewSuccess={reviewSuccess}
          handleAddToCart={handleAddToCart}
          handleWishlistToggle={handleWishlistToggle}
          handleReviewSubmit={handleReviewSubmit}
          ratingBreakdown={ratingBreakdown}
          uniqueSizes={uniqueSizes}
          uniqueColors={uniqueColors}
          getCombinationStock={getCombinationStock}
          currentCombinationStock={currentCombinationStock}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Upper product summary section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start mb-12 md:mb-16">
          
          {/* 1. Image Gallery with hover-zoom and thumbnails */}
          <div className="flex flex-col gap-4">
            {/* Main Image View */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="glass-card relative overflow-hidden aspect-square rounded-2xl border border-white/5 cursor-crosshair group flex items-center justify-center bg-dark-800"
            >
              <img
                src={product.images?.[activeImageIdx] || "https://placehold.co/600x600/1e1830/f0e8ff?text=AuraBella"}
                alt={product.name}
                title={product.name}
                loading="eager"
                fetchpriority="high"
                className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-200"
              />
              
              {/* Zoom overlay */}
              <div
                style={zoomStyle}
                className="absolute inset-0 bg-no-repeat pointer-events-none bg-dark-900"
              />

              {discountPct && (
                <span className="absolute top-4 left-4 text-[10px] font-sans font-bold bg-rose-600 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                  Save {discountPct}%
                </span>
              )}
            </div>

            {/* Thumbnail Selection */}
            {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`glass-card overflow-hidden aspect-square rounded-xl border transition-all ${
                      idx === activeImageIdx
                        ? "border-primary-400 ring-2 ring-primary-500/20"
                        : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <img src={img} alt="detail thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Product Details info */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="badge text-[10px] tracking-widest uppercase mb-2">
                ✦ {product.brand}
              </span>
              <h1 className="font-display font-bold text-3xl md:text-5xl text-white tracking-wide leading-tight mt-2 break-words">
                {product.name}
              </h1>

              {/* Rating Summary */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-[#9d8bbb]">
                <div className="flex items-center text-champagne-400">
                  <FiStar className="fill-current text-xs" />
                  <span className="font-sans font-bold text-white ml-1.5">{product.avgRating || "0.0"}</span>
                </div>
                <span>•</span>
                <span>{product.numReviews || 0} Verified Reviews</span>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Pricing Section */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-sans font-bold text-3xl text-white">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {product.discountPrice && (
                <span className="font-sans text-lg text-[#9d8bbb] line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Brief Description */}
            <p className="font-sans text-sm text-[#9d8bbb] leading-relaxed">
              {product.description}
            </p>

            <hr className="border-white/5" />

            {/* Variant Selectors with out-of-stock combination control */}
            <div className="flex flex-col gap-5">
              {/* Color Select */}
              {uniqueColors.length > 0 && (
                <div>
                  <span className="font-sans text-xs text-white/60 font-semibold uppercase tracking-wider block mb-2">
                    Color: {selectedColor}
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {uniqueColors.map((color) => {
                      const sizeInStock = getCombinationStock(selectedSize, color);
                      const isOptionOut = sizeInStock <= 0;
                      return (
                        <button
                          key={color}
                          disabled={isOptionOut}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                            selectedColor === color
                              ? "border-primary-400 bg-primary-500/10 text-white shadow-glow-violet"
                              : isOptionOut
                                ? "border-white/5 bg-white/0 text-white/20 cursor-not-allowed line-through"
                                : "border-white/10 hover:border-white/30 text-[#9d8bbb]"
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Select */}
              {uniqueSizes.length > 0 && (
                <div>
                  <span className="font-sans text-xs text-white/60 font-semibold uppercase tracking-wider block mb-2">
                    Size: {selectedSize}
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {uniqueSizes.map((size) => {
                      const colorInStock = getCombinationStock(size, selectedColor);
                      const isOptionOut = colorInStock <= 0;
                      return (
                        <button
                          key={size}
                          disabled={isOptionOut}
                          onClick={() => setSelectedSize(size)}
                          className={`w-10 h-10 flex items-center justify-center text-xs font-semibold rounded-full border transition-all ${
                            selectedSize === size
                              ? "border-primary-400 bg-primary-500/10 text-white shadow-glow-violet"
                              : isOptionOut
                                ? "border-white/5 bg-white/0 text-white/20 cursor-not-allowed line-through"
                                : "border-white/10 hover:border-white/30 text-[#9d8bbb]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Qty Selector & Stock status */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="font-sans text-xs text-white/60 font-semibold uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                <button
                  disabled={qty <= 1}
                  onClick={() => setQty(qty - 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30"
                >
                  <FiMinus className="text-xs" />
                </button>
                <span className="w-8 text-center font-sans font-bold text-sm">{qty}</span>
                <button
                  disabled={qty >= Math.min(currentCombinationStock || 10, 10)}
                  onClick={() => setQty(qty + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30"
                >
                  <FiPlus className="text-xs" />
                </button>
              </div>
              <span className="text-xs font-sans text-[#9d8bbb]">
                {currentCombinationStock > 0 ? (
                  <span className="text-green-400 font-semibold">{currentCombinationStock} in stock</span>
                ) : (
                  <span className="text-rose-400 font-semibold">Out of Stock</span>
                )}
              </span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-[1fr_1fr_auto] gap-3 sm:gap-4 mt-2">
              <button
                disabled={currentCombinationStock <= 0}
                onClick={() => handleAddToCart(false)}
                className="btn-outline w-full justify-center py-3.5 border-white/20 text-white hover:border-primary-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiShoppingBag className="text-sm" /> Add to Bag
              </button>
              <button
                disabled={currentCombinationStock <= 0}
                onClick={() => handleAddToCart(true)}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`w-full min-[420px]:w-12 h-12 flex items-center justify-center rounded-full border transition-all ${
                  isWishlisted
                    ? "bg-rose-500 border-rose-400 text-white shadow-glow-rose"
                    : "border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                }`}
              >
                <FiHeart className={`text-sm ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Lower tabs section */}
        <div className="mb-20">
          {/* Tab selectors */}
          <div className="flex border-b border-white/5 mb-8 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 px-4 sm:px-6 font-display font-semibold text-sm uppercase tracking-wider relative transition-all whitespace-nowrap ${
                activeTab === "description" ? "text-primary-300" : "text-[#9d8bbb] hover:text-white"
              }`}
            >
              Description
              {activeTab === "description" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gradient" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 px-4 sm:px-6 font-display font-semibold text-sm uppercase tracking-wider relative transition-all whitespace-nowrap ${
                activeTab === "reviews" ? "text-primary-300" : "text-[#9d8bbb] hover:text-white"
              }`}
            >
              Reviews ({product.reviews?.length || 0})
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gradient" />
              )}
            </button>
          </div>

          {/* Tab contents */}
          {activeTab === "description" ? (
            <div className="glass-card p-6 md:p-8 leading-relaxed font-sans text-sm text-[#9d8bbb] flex flex-col gap-4">
              <p>{product.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Details</h4>
                  <ul className="list-disc list-inside flex flex-col gap-1.5 text-xs">
                    <li>Premium editorial luxury styling</li>
                    <li>Designed exclusively for AuraBella</li>
                    <li>Premium raw textures and materials</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Specifications</h4>
                  <ul className="list-disc list-inside flex flex-col gap-1.5 text-xs">
                    <li>100% verified materials</li>
                    <li>Brand: {product.brand}</li>
                    <li>Authenticity code: {product._id}</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ratings Breakdown Panel */}
              <div className="glass-card p-6 flex flex-col gap-5 h-fit">
                <div>
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wider">Customer Ratings</h4>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-5xl font-sans font-bold text-white">{product.avgRating || "0.0"}</span>
                    <span className="text-sm text-[#9d8bbb]">out of 5</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        className={`text-sm ${
                          i < Math.round(product.avgRating || 0)
                            ? "text-champagne-400 fill-current"
                            : "text-white/10"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-[#9d8bbb] ml-1">({product.numReviews || 0} reviews)</span>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Stars Breakdown progress bars */}
                <div className="flex flex-col gap-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = ratingBreakdown[stars] || 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 sm:gap-3 text-xs font-sans text-[#9d8bbb]">
                        <span className="w-3 text-right">{stars}</span>
                        <FiStar className="text-[10px] text-champagne-400 fill-current" />
                        <div className="flex-grow h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gradient" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right font-semibold text-white/80">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List and Write Form */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                
                {/* Write a review (If logged in) */}
                {isAuthenticated ? (
                  <div className="glass-card p-6">
                    <h4 className="font-sans font-bold text-sm uppercase tracking-wider mb-4">Write a Review</h4>
                    
                    {reviewSuccess && (
                      <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                        <FiCheck /> {reviewSuccess}
                      </div>
                    )}
                    
                    {reviewError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl px-4 py-3 mb-4">
                        {reviewError}
                      </div>
                    )}

                    <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                      {/* Rating selection */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-sans font-semibold text-[#9d8bbb]">Your Rating:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              type="button"
                              key={val}
                              onClick={() => setReviewForm({ ...reviewForm, rating: val })}
                              className="text-lg transition-transform hover:scale-110"
                            >
                              <FiStar
                                className={`${
                                  val <= reviewForm.rating
                                    ? "text-champagne-400 fill-current"
                                    : "text-white/20"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment textarea */}
                      <div className="flex flex-col gap-1.5">
                        <textarea
                          rows={3}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          required
                          placeholder="Tell us what you liked or disliked about this product..."
                          className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl p-4 text-white font-sans transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="btn-primary w-fit text-xs px-6 py-2.5 self-end disabled:opacity-60"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="glass-card p-5 text-center">
                    <p className="font-serif italic text-[#9d8bbb] text-xs">
                      Please <Link to="/login" className="text-primary-300 font-semibold hover:text-white">login</Link> to write a review.
                    </p>
                  </div>
                )}

                {/* Reviews List */}
                <div className="flex flex-col gap-4">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wider">Reviews ({product.reviews?.length || 0})</h4>
                  {(!product.reviews || product.reviews.length === 0) ? (
                    <p className="font-serif italic text-xs text-[#9d8bbb]">No reviews for this product yet. Be the first to share your thoughts!</p>
                  ) : (
                    product.reviews.map((r) => (
                      <div key={r._id} className="glass-card p-5 flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs uppercase text-primary-300">
                              {r.user?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">{r.user?.name || "Customer"}</p>
                              <p className="text-[9px] text-[#9d8bbb]">
                                {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                  year: "numeric", month: "short", day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FiStar
                                key={i}
                                className={`text-[10px] ${
                                  i < r.rating ? "text-champagne-400 fill-current" : "text-white/10"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs font-sans text-[#9d8bbb] leading-relaxed">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related products Carousel / List */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-white/5 pt-16">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <span className="badge text-[10px] tracking-widest uppercase mb-2 inline-block">
                  ✦ Curated Recommendations
                </span>
                <h3 className="font-display font-bold text-2xl md:text-3xl uppercase tracking-wide">
                  You May Also Like
                </h3>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Carousel */}
        {product && <RecentlyViewed excludeId={product._id} />}

      </div>
    </div>
  );
}
