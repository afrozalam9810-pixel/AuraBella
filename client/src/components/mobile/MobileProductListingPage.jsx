import React, { useState, useEffect, useRef } from "react";
import { FiSliders, FiArrowDown, FiChevronDown, FiX, FiCheck } from "react-icons/fi";
import MobileProductCard from "./MobileProductCard";
import MobileSkeletonLoader from "./MobileSkeletonLoader";

export default function MobileProductListingPage({
  products = [],
  categories = [],
  loading,
  total,
  totalPages,
  activePage,
  activeSort,
  activeMinPrice,
  activeMaxPrice,
  activeSubCategories,
  currentCategoryContext,
  availableSubCategories = [],
  updateQueryParam,
  handleSubCategoryToggle,
  handleClearAll,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Local state for filter sheet to avoid live search param update while selecting
  const [localMinPrice, setLocalMinPrice] = useState(activeMinPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(activeMaxPrice);
  const [localSubCategories, setLocalSubCategories] = useState(activeSubCategories);

  // Keep local state in sync with URL when sheets open
  useEffect(() => {
    if (filterOpen) {
      setLocalMinPrice(activeMinPrice);
      setLocalMaxPrice(activeMaxPrice);
      setLocalSubCategories(activeSubCategories);
    }
  }, [filterOpen, activeMinPrice, activeMaxPrice, activeSubCategories]);

  // Handle body scroll locking
  useEffect(() => {
    if (sortOpen || filterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sortOpen, filterOpen]);

  // ESC Close handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSortOpen(false);
        setFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sort sheet previously focused tracker
  useEffect(() => {
    if (!sortOpen) return;
    const previouslyFocused = document.activeElement;
    return () => {
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [sortOpen]);

  // Filter sheet previously focused tracker
  useEffect(() => {
    if (!filterOpen) return;
    const previouslyFocused = document.activeElement;
    return () => {
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [filterOpen]);

  // Focus trap for bottom sheets
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const applyFocusTrap = (ref, isOpen) => {
    if (!isOpen || !ref.current) return;
    const focusable = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const listener = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    first.focus();
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  };

  useEffect(() => {
    return applyFocusTrap(sortRef, sortOpen);
  }, [sortOpen]);

  useEffect(() => {
    return applyFocusTrap(filterRef, filterOpen);
  }, [filterOpen]);

  const handleApplyFilters = () => {
    // Commit local filter selections to URL query parameters
    updateQueryParam("minPrice", localMinPrice);
    updateQueryParam("maxPrice", localMaxPrice);
    
    // Subcategories need to be updated. Since they toggle individually in the parent,
    // we compute the difference or set the CSV string.
    updateQueryParam("subCategory", localSubCategories.join(","));
    setFilterOpen(false);
  };

  const handleLocalSubCategoryToggle = (subId) => {
    if (localSubCategories.includes(subId)) {
      setLocalSubCategories(localSubCategories.filter((id) => id !== subId));
    } else {
      setLocalSubCategories([...localSubCategories, subId]);
    }
  };

  const handleLocalClearAll = () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalSubCategories([]);
    handleClearAll();
    setFilterOpen(false);
  };

  const activeSortLabel = {
    newest: "Newest",
    popular: "Popular",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
  }[activeSort] || "Sort";

  return (
    <div className="bg-dark-950 min-h-screen text-white pb-10 flex flex-col md:hidden">
      {/* 1. Header category title and count banner */}
      <div className="px-4 py-3 bg-dark-900/60 border-b border-white/5 flex flex-col gap-0.5">
        <h1 className="text-sm font-bold uppercase tracking-wider text-white">
          {currentCategoryContext
            ? currentCategoryContext.type === "sub"
              ? `${currentCategoryContext.parent.name} — ${currentCategoryContext.category.name}`
              : currentCategoryContext.category.name
            : "All Products"}
        </h1>
        <p className="text-[10px] text-white/50 font-sans">
          Showing {loading ? "..." : products.length} of {loading ? "..." : total} items
        </p>
      </div>

      {/* 2. Sticky Top Filter & Sort Bar */}
      <div className="sticky top-[100px] z-40 bg-dark-900 border-b border-white/5 py-2.5 px-4 flex gap-3 text-xs font-semibold tracking-wider uppercase select-none">
        <button
          onClick={() => setSortOpen(true)}
          aria-label="Open Sort Options"
          className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-1 text-center"
        >
          <span>Sort: {activeSortLabel}</span>
          <FiChevronDown className="text-sm text-white/60" />
        </button>

        <button
          onClick={() => setFilterOpen(true)}
          aria-label="Open Filter Drawer"
          className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-1.5 text-center"
        >
          <FiSliders className="text-sm text-primary-400" />
          <span>Filters</span>
          {activeSubCategories.length + (activeMinPrice ? 1 : 0) + (activeMaxPrice ? 1 : 0) > 0 && (
            <span className="w-2 h-2 rounded-full bg-primary-500" />
          )}
        </button>
      </div>

      {/* 3. Product Listing Grid */}
      <div className="flex-grow px-3 py-4">
        {loading ? (
          <MobileSkeletonLoader type="list" />
        ) : products.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
            <span className="text-3xl mb-3">🔍</span>
            <h3 className="font-semibold text-sm">No products found</h3>
            <p className="text-xs text-white/40 mt-1 max-w-[200px]">
              Try adjusting your price filters or subcategory checkmarks.
            </p>
            <button
              onClick={handleClearAll}
              className="mt-4 text-xs font-bold text-primary-400 border border-primary-500/20 px-4 py-2 rounded-full active:bg-white/5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((prod) => (
              <MobileProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </div>

      {/* 4. Pagination Footer bar */}
      {totalPages > 1 && !loading && (
        <div className="py-6 border-t border-white/5 flex items-center justify-center gap-4 bg-dark-900/20 select-none">
          <button
            onClick={() => updateQueryParam("page", activePage - 1)}
            disabled={activePage === 1}
            aria-label="Previous Page"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98]"
          >
            Prev
          </button>
          <span className="text-xs font-sans text-white/60">
            Page <span className="text-white font-bold">{activePage}</span> of {totalPages}
          </span>
          <button
            onClick={() => updateQueryParam("page", activePage + 1)}
            disabled={activePage === totalPages}
            aria-label="Next Page"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98]"
          >
            Next
          </button>
        </div>
      )}

      {/* ── Sort Bottom Sheet ── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          sortOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setSortOpen(false)} aria-hidden="true" />
        <div
          ref={sortRef}
          role="dialog"
          aria-modal="true"
          aria-label="Sorting Options Sheet"
          className={`absolute bottom-0 inset-x-0 bg-dark-950 border-t border-white/5 rounded-t-3xl p-5 flex flex-col gap-4 transition-transform duration-300 ease-out transform ${
            sortOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#9d8bbb]">Sort By</h3>
            <button
              onClick={() => setSortOpen(false)}
              aria-label="Close sort sheet"
              className="text-white/60 hover:text-white p-1"
            >
              <FiX className="text-base" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { val: "newest", label: "Newest" },
              { val: "popular", label: "Popularity" },
              { val: "price_asc", label: "Price: Low to High" },
              { val: "price_desc", label: "Price: High to Low" },
            ].map((option) => (
              <button
                key={option.val}
                onClick={() => {
                  updateQueryParam("sort", option.val);
                  setSortOpen(false);
                }}
                className={`py-3 px-4 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                  activeSort === option.val
                    ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                    : "hover:bg-white/5 text-white/80"
                }`}
              >
                <span>{option.label}</span>
                {activeSort === option.val && <FiCheck className="text-sm" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter Bottom Sheet ── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          filterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setFilterOpen(false)} aria-hidden="true" />
        <div
          ref={filterRef}
          role="dialog"
          aria-modal="true"
          aria-label="Filtering Options Sheet"
          className={`absolute bottom-0 inset-x-0 h-[80vh] bg-dark-950 border-t border-white/5 rounded-t-3xl p-5 flex flex-col transition-transform duration-300 ease-out transform ${
            filterOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#9d8bbb]">Filters</h3>
            <button
              onClick={() => setFilterOpen(false)}
              aria-label="Close filter sheet"
              className="text-white/60 hover:text-white p-1"
            >
              <FiX className="text-base" />
            </button>
          </div>

          {/* Form Content (Scrollable) */}
          <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-6 custom-scrollbar mb-4">
            {/* Sub-categories */}
            {availableSubCategories.length > 0 && (
              <div className="flex flex-col gap-3">
                <h4 className="font-sans font-bold text-[10px] text-white/50 uppercase tracking-widest">
                  Sub-categories
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableSubCategories.map((sub) => {
                    const isChecked = localSubCategories.includes(sub._id);
                    return (
                      <button
                        key={sub._id}
                        onClick={() => handleLocalSubCategoryToggle(sub._id)}
                        className={`py-2 px-3 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                          isChecked
                            ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                            : "bg-white/5 border-white/10 text-white/70"
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        {isChecked && <FiCheck className="text-xs flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="flex flex-col gap-3">
              <h4 className="font-sans font-bold text-[10px] text-white/50 uppercase tracking-widest">
                Price Range (INR)
              </h4>
              <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-2.5 pl-7 pr-3 text-white transition-colors"
                  />
                </div>
                <span className="text-[#9d8bbb] text-xs">—</span>
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full text-xs bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-xl py-2.5 pl-7 pr-3 text-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-white/5 flex gap-3">
            <button
              onClick={handleLocalClearAll}
              className="flex-1 py-3 border border-white/10 text-white/80 font-bold rounded-xl text-xs uppercase tracking-wider active:bg-white/5"
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-3 bg-brand-gradient text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-glow-violet active:scale-[0.98]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
