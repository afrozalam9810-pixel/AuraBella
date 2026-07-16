"use client";

import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { FiSliders, FiX, FiChevronLeft, FiChevronRight, FiGrid, FiArrowUpRight } from "react-icons/fi";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useIsMobile } from "../hooks/useIsMobile";
import MobileSkeletonLoader from "../components/mobile/MobileSkeletonLoader";

const MobileProductListingPage = lazy(() => import("../components/mobile/MobileProductListingPage"));

export default function ProductListingPage({
  initialCategories,
  initialProducts,
  initialTotal,
  initialTotalPages,
}) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // API Data States
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [total, setTotal] = useState(initialTotal || 0);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
  const isFirstRender = useRef(true);

  // UI States
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync search parameters from URL
  const activePage = Number(searchParams.get("page")) || 1;
  const activeSort = searchParams.get("sort") || "newest";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";
  // subCategory filter can be a comma-separated list of IDs or a single ID
  const activeSubCategories = useMemo(() => {
    const val = searchParams.get("subCategory");
    return val ? val.split(",") : [];
  }, [searchParams]);

  // Determine the active category before any effect reads it. Referencing a
  // later `const` from an effect dependency array throws at render time and
  // leaves the category route as a blank page.
  const currentCategoryContext = useMemo(() => {
    if (!categories.length) return null;

    const parent = categories.find((category) => category.slug === slug);
    if (parent) {
      return { type: "parent", category: parent, id: parent._id };
    }

    for (const parentCategory of categories) {
      const subCategory = (parentCategory.subCategories || []).find(
        (category) => category.slug === slug
      );
      if (subCategory) {
        return {
          type: "sub",
          category: subCategory,
          parent: parentCategory,
          id: subCategory._id,
        };
      }
    }

    return null;
  }, [categories, slug]);

  // Fetch all nested categories on mount
  useEffect(() => {
    if (initialCategories) return;
    api.get("/categories")
      .then((res) => {
        if (res.data && res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error("Error loading categories", err));
  }, [initialCategories]);

  // SEO: Dynamic robots tag (noindex on searches) and CollectionPage JSON-LD
  useEffect(() => {
    const isSearch = searchParams.get("q") || slug === "search";
    let meta = document.querySelector('meta[name="robots"]');
    if (isSearch) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "robots");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", "noindex, follow");
    } else {
      if (meta) {
        meta.setAttribute("content", "index, follow");
      }
    }

    const scriptId = "collection-jsonld-schema";
    let script = document.getElementById(scriptId);
    if (products && products.length > 0 && currentCategoryContext) {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      const categoryName = currentCategoryContext.category.name;
      const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": categoryName,
        "description": `Shop the latest collections in ${categoryName} at AuraBella.`,
        "url": window.location.href,
        "numberOfItems": products.length,
        "itemListElement": products.map((prod, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `${window.location.origin}/products/${prod._id}`,
          "name": prod.name,
        })),
      };
      script.text = JSON.stringify(collectionSchema);
    } else {
      if (script) script.remove();
    }

    return () => {
      if (meta) meta.setAttribute("content", "index, follow");
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [products, currentCategoryContext, searchParams, slug]);

  // Fetch products whenever filters or category changes
  useEffect(() => {
    if (!categories.length) return; // Wait until categories are loaded to match Context IDs

    const isInitialRoute = activePage === 1 &&
                           activeSort === "newest" &&
                           activeMinPrice === "" &&
                           activeMaxPrice === "" &&
                           activeSubCategories.length === 0;

    if (initialProducts && isInitialRoute && products.length > 0 && isFirstRender.current) {
      isFirstRender.current = false;
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();

    // Set parent category ID if on parent route
    if (currentCategoryContext) {
      if (currentCategoryContext.type === "parent") {
        params.append("category", currentCategoryContext.id);
        // If subcategory checkboxes are ticked, append them
        if (activeSubCategories.length > 0) {
          activeSubCategories.forEach(subId => {
            params.append("subCategory", subId);
          });
        }
      } else if (currentCategoryContext.type === "sub") {
        params.append("subCategory", currentCategoryContext.id);
      }
    }

    // Append standard listing queries
    if (activeMinPrice) params.append("minPrice", activeMinPrice);
    if (activeMaxPrice) params.append("maxPrice", activeMaxPrice);
    if (activeSort) params.append("sort", activeSort);
    params.append("page", String(activePage));
    params.append("limit", "8"); // Show 8 products per page

    api.get(`/products?${params.toString()}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setProducts(res.data.data);
          setTotal(res.data.total);
          setTotalPages(res.data.pages || 1);
        }
      })
      .catch((err) => {
        console.error("Error fetching products", err);
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categories, currentCategoryContext, activePage, activeSort, activeMinPrice, activeMaxPrice, activeSubCategories, initialProducts]);

  // Helper to update individual URL query params
  const updateQueryParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === "" || value === null || (Array.isArray(value) && value.length === 0)) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }
    // Reset page back to 1 on filter change
    if (key !== "page") {
      nextParams.set("page", "1");
    }
    setSearchParams(nextParams);
  };

  // Sub-category checkboxes toggle logic
  const handleSubCategoryToggle = (subId) => {
    let nextSubs = [...activeSubCategories];
    if (nextSubs.includes(subId)) {
      nextSubs = nextSubs.filter((id) => id !== subId);
    } else {
      nextSubs.push(subId);
    }
    updateQueryParam("subCategory", nextSubs.join(","));
  };

  // Clear all current filters
  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  // Skeletons for Loading State
  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-3 animate-pulse">
        <div className="bg-white/5 aspect-[3/4] rounded-2xl border border-white/5" />
        <div className="bg-white/5 h-4 w-2/3 rounded-md" />
        <div className="bg-white/5 h-3 w-1/2 rounded-md" />
        <div className="bg-white/5 h-5 w-1/3 rounded-md mt-2" />
      </div>
    ));
  };

  // Get active subcategories to filter list (only for parent categories)
  const availableSubCategories = useMemo(() => {
    if (currentCategoryContext && currentCategoryContext.type === "parent") {
      return currentCategoryContext.category.subCategories || [];
    }
    return [];
  }, [currentCategoryContext]);

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Suspense fallback={<MobileSkeletonLoader type="list" />}>
        <MobileProductListingPage
          products={products}
          categories={categories}
          loading={loading}
          total={total}
          totalPages={totalPages}
          activePage={activePage}
          activeSort={activeSort}
          activeMinPrice={activeMinPrice}
          activeMaxPrice={activeMaxPrice}
          activeSubCategories={activeSubCategories}
          currentCategoryContext={currentCategoryContext}
          availableSubCategories={availableSubCategories}
          updateQueryParam={updateQueryParam}
          handleSubCategoryToggle={handleSubCategoryToggle}
          handleClearAll={handleClearAll}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner/Header */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-4">
          <div>
            <span className="badge text-[10px] tracking-widest uppercase mb-2 inline-flex w-fit">
              ✦ Collections
            </span>
            <h1 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-wider leading-tight break-words">
              {currentCategoryContext 
                ? currentCategoryContext.type === "sub"
                  ? `${currentCategoryContext.parent.name} — ${currentCategoryContext.category.name}`
                  : currentCategoryContext.category.name
                : "All Products"
              }
            </h1>
            <p className="font-serif italic text-[#9d8bbb] mt-2 text-sm max-w-xl">
              Immerse yourself in premium designs tailored to accentuate your luxury aura.
            </p>
          </div>
          
          {/* Active Product Count */}
          <div className="text-sm font-sans text-[#9d8bbb] flex-shrink-0">
            Showing <span className="text-white font-semibold">{loading ? "..." : products.length}</span> of <span className="text-white font-semibold">{loading ? "..." : total}</span> items
          </div>
        </div>

        {/* Toolbar (Mobile Filter toggle and Sorting) */}
        <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-4 bg-dark-800/40 border border-white/5 p-4 rounded-2xl mb-8">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider hover:text-primary-300 transition-colors md:hidden"
          >
            <FiSliders className="text-base" /> Filters
          </button>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-[#9d8bbb] font-sans">Layout:</span>
            <button className="text-primary-400 p-1.5 rounded-lg bg-white/5 border border-white/5">
              <FiGrid className="text-sm" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full min-[420px]:w-auto">
            <label className="text-xs text-[#9d8bbb] font-sans hidden sm:inline">Sort By:</label>
            <select
              value={activeSort}
              onChange={(e) => updateQueryParam("sort", e.target.value)}
              className="w-full min-[420px]:w-auto bg-dark-900 border border-white/10 hover:border-white/20 focus:border-primary-400 rounded-xl px-4 py-2 text-xs font-semibold tracking-wider font-sans focus:outline-none transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="popular">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 1. Desktop Sidebar Filters */}
          <aside className="hidden md:flex flex-col gap-8">
            {/* Sub-categories (Only show if parent category is active) */}
            {availableSubCategories.length > 0 && (
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider border-b border-white/5 pb-2">
                  Sub-categories
                </h3>
                <div className="flex flex-col gap-3">
                  {availableSubCategories.map((sub) => (
                    <label key={sub._id} className="flex items-center gap-3 cursor-pointer group text-sm">
                      <input
                        type="checkbox"
                        checked={activeSubCategories.includes(sub._id)}
                        onChange={() => handleSubCategoryToggle(sub._id)}
                        className="rounded border-white/10 text-primary-500 bg-white/5 focus:ring-primary-500 focus:ring-offset-dark-900 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[#9d8bbb] group-hover:text-white transition-colors">
                        {sub.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider border-b border-white/5 pb-2">
                Price Range
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={activeMinPrice}
                    onChange={(e) => updateQueryParam("minPrice", e.target.value)}
                    className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-2.5 pl-7 pr-3 text-white transition-colors"
                  />
                </div>
                <span className="text-[#9d8bbb] text-xs">—</span>
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={activeMaxPrice}
                    onChange={(e) => updateQueryParam("maxPrice", e.target.value)}
                    className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-2.5 pl-7 pr-3 text-white transition-colors"
                  />
                </div>
              </div>
              
              {/* Quick Reset */}
              {(activeMinPrice || activeMaxPrice || activeSubCategories.length > 0) && (
                <button
                  onClick={handleClearAll}
                  className="text-left text-rose-400 hover:text-rose-300 font-sans text-xs font-semibold tracking-wider uppercase mt-2 w-fit transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* 2. Products Grid Panel */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {renderSkeletons()}
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card p-8 sm:p-16 text-center flex flex-col gap-6 items-center">
                <span className="text-5xl">🌸</span>
                <div>
                  <h3 className="font-display font-bold text-xl md:text-2xl text-white">No products found</h3>
                  <p className="font-serif italic text-[#9d8bbb] text-sm mt-1 max-w-sm">
                    We couldn't find any products matching your active filters. Try adjusting your settings.
                  </p>
                </div>
                <button
                  onClick={handleClearAll}
                  className="btn-outline text-xs px-6 py-2.5"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 border-t border-white/5 pt-8 overflow-x-auto custom-scrollbar px-1">
                    <button
                      onClick={() => updateQueryParam("page", activePage - 1)}
                      disabled={activePage === 1}
                      className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center text-white disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed transition-all"
                    >
                      <FiChevronLeft />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateQueryParam("page", pageNum)}
                          className={`w-10 h-10 rounded-full text-xs font-semibold font-sans transition-all ${
                            pageNum === activePage
                              ? "bg-brand-gradient text-white shadow-glow-violet border-transparent"
                              : "border border-white/10 text-[#9d8bbb] hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => updateQueryParam("page", activePage + 1)}
                      disabled={activePage === totalPages}
                      className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center text-white disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed transition-all"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Mobile Slide-Up Filter Drawer Overlay */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-h-[85vh] bg-dark-800 border-t border-white/10 rounded-t-3xl overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 z-10 custom-scrollbar animate-slide-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-display font-bold text-lg uppercase tracking-wide">Filters</h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
              >
                <FiX />
              </button>
            </div>

            {/* Sub-categories Filter */}
            {availableSubCategories.length > 0 && (
              <div className="flex flex-col gap-3">
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-white/60">
                  Sub-categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableSubCategories.map((sub) => {
                    const checked = activeSubCategories.includes(sub._id);
                    return (
                      <button
                        key={sub._id}
                        onClick={() => handleSubCategoryToggle(sub._id)}
                        className={`text-xs px-3.5 py-2 rounded-xl border transition-all ${
                          checked
                            ? "bg-brand-gradient text-white border-transparent"
                            : "bg-white/5 border-white/10 text-[#9d8bbb] hover:border-white/20"
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="flex flex-col gap-3">
              <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-white/60">
                Price Range
              </h4>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={activeMinPrice}
                    onChange={(e) => updateQueryParam("minPrice", e.target.value)}
                    className="w-full text-xs bg-white/5 border border-white/10 focus:border-primary-400 focus:outline-none rounded-xl py-3 pl-7 pr-3 text-white transition-colors"
                  />
                </div>
                <span className="text-[#9d8bbb] text-xs">—</span>
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={activeMaxPrice}
                    onChange={(e) => updateQueryParam("maxPrice", e.target.value)}
                    className="w-full text-xs bg-white/5 border border-white/10 focus:border-primary-400 focus:outline-none rounded-xl py-3 pl-7 pr-3 text-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 mt-4 border-t border-white/5 pt-4">
              <button
                onClick={() => {
                  handleClearAll();
                  setIsFilterDrawerOpen(false);
                }}
                className="w-1/2 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-[#9d8bbb] hover:text-white border border-white/10 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-1/2 py-3 rounded-full text-xs font-semibold uppercase tracking-wider btn-primary justify-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
