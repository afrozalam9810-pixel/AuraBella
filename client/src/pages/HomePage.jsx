/**
 * HomePage.jsx
 * AuraBella — Full production home page.
 *
 * Sections:
 *  1. HeroCarousel — 4 auto-advancing slides with CTA
 *  2. Shop by Category — 4 cards linking to listing pages
 *  3. Trending Now — horizontal scroll of top-rated products
 *  4. New Arrivals — horizontal scroll of newest products
 *  5. Brand Promise strip
 *  6. Newsletter CTA banner
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronLeft, FiChevronRight, FiShield,
  FiTruck, FiRefreshCw, FiHeadphones,
} from "react-icons/fi";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

// ─── Hero Slides data ────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 1,
    image: "/assets/hero1.jpg",
    badge: "New Season Drop",
    title: "",
    subtitle: "",
    cta: "Shop Clothing",
    ctaLink: "/category/clothing",
    align: "left",
  },
  {
    id: 2,
    image: "/assets/hero2.jpg",
    badge: "Beauty Essentials",
    title: "",
    subtitle: "",
    cta: "Explore Makeup",
    ctaLink: "/category/makeup",
    align: "left",
  },
  {
    id: 3,
    image: "/assets/hero3.jpg",
    badge: "Fine Jewellery",
    title: "Shine With\nPurpose",
    subtitle: "Handcrafted masterpieces in gold, diamond, and platinum — worn by those who dare.",
    cta: "View Jewellery",
    ctaLink: "/category/jewellery",
    align: "right",
  },
  {
    id: 4,
    image: "/assets/hero4.jpg",
    badge: "Footwear",
    title: "Step Into\nLuxury",
    subtitle: "Every step is a statement. Premium heels, flats, and sneakers for the discerning soul.",
    cta: "Shop Footwear",
    ctaLink: "/category/footwear",
    align: "left",
  },
];

// ─── Category Cards ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Clothing",
    slug: "clothing",
    image: "/assets/cat-clothing.jpg",
    count: "120+ styles",
    accent: "from-violet-900/80",
  },
  {
    name: "Footwear",
    slug: "footwear",
    image: "/assets/cat-footwear.jpg",
    count: "80+ pairs",
    accent: "from-rose-900/80",
  },
  {
    name: "Makeup",
    slug: "makeup",
    image: "/assets/cat-makeup.jpg",
    count: "200+ products",
    accent: "from-pink-900/80",
  },
  {
    name: "Jewellery",
    slug: "jewellery",
    image: "/assets/cat-jewellery.jpg",
    count: "60+ pieces",
    accent: "from-amber-900/80",
  },
];

// ─── Brand Promises ───────────────────────────────────────────────────────────
const PROMISES = [
  { icon: <FiTruck />, label: "Free Shipping", desc: "On orders above ₹2,000" },
  { icon: <FiRefreshCw />, label: "Easy Returns", desc: "30-day hassle-free returns" },
  { icon: <FiShield />, label: "Secure Payments", desc: "100% encrypted & safe" },
  { icon: <FiHeadphones />, label: "24/7 Support", desc: "Always here to help" },
];

// ─── Fallback mock products (used when API not connected) ─────────────────────
const MOCK_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  _id: `mock-${i}`,
  name: ["Velvet Glow Serum", "Satin Lipstick", "Pearl Drop Earrings", "Silk Midi Dress",
    "Suede Block Heels", "Matte Foundation", "Crystal Bracelet", "Linen Co-ord Set"][i],
  brand: ["AuraBella", "MAC", "Pandora", "Zara", "Steve Madden", "L'Oreal", "Swarovski", "Mango"][i],
  price: [1899, 1299, 3499, 4999, 2999, 899, 5499, 2499][i],
  discountPrice: [1599, null, 2999, 3999, null, 699, 4499, 1999][i],
  images: [`https://placehold.co/400x500/1e1830/f0e8ff?text=${encodeURIComponent(["Serum", "Lipstick", "Earrings", "Dress", "Heels", "Foundation", "Bracelet", "Co-ord"][i])}`],
  avgRating: [4.8, 4.6, 4.9, 4.7, 4.5, 4.3, 4.8, 4.6][i],
  numReviews: [124, 88, 56, 203, 72, 44, 91, 67][i],
  variants: [{ size: "Standard", color: "Default", stock: 20 }],
}));

// ─── HeroCarousel Component ───────────────────────────────────────────────────
function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setActive(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const next = useCallback(() =>
    goTo((active + 1) % HERO_SLIDES.length), [active, goTo]);
  const prev = useCallback(() =>
    goTo((active - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), [active, goTo]);

  // Auto-advance every 5 s
  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const slide = HERO_SLIDES[active];
  const isRight = slide.align === "right";

  return (
    <section className="relative w-full min-h-[520px] h-[68vh] md:h-[85vh] overflow-hidden rounded-none">
      {/* Background images */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover object-top"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 via-dark-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className={`absolute inset-0 flex items-center px-4 sm:px-6 md:px-20 ${isRight ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-xl text-left transition-all duration-700 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
        >
          <span className="badge text-[10px] tracking-widest uppercase mb-4 inline-block">
            ✦ {slide.badge}
          </span>
          <h1
            className="font-display font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", whiteSpace: "pre-line" }}
          >
            {slide.title}
          </h1>
          <p className="font-sans text-sm md:text-base text-white/70 max-w-md mb-8 leading-relaxed">
            {slide.subtitle}
          </p>
          <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-3 min-[420px]:gap-4">
            <Link to={slide.ctaLink} className="btn-primary text-sm py-3 px-6 sm:px-8">
              {slide.cta}
            </Link>
            <Link to="/" className="btn-outline text-sm py-3 px-6 border-white/20 text-white hover:border-white/50">
              Explore All
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-card flex items-center justify-center text-white hover:text-primary-300 hover:-translate-y-1/2 hover:scale-110 transition-transform border-white/10 z-10"
      >
        <FiChevronLeft className="text-lg" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-card flex items-center justify-center text-white hover:text-primary-300 hover:-translate-y-1/2 hover:scale-110 transition-transform border-white/10 z-10"
      >
        <FiChevronRight className="text-lg" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? "w-8 h-2 bg-brand-gradient"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-6 font-sans text-xs text-white/40 z-10 hidden md:block">
        {String(active + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
      </div>
    </section>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ badge, title, subtitle, cta, ctaLink }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        {badge && (
          <span className="badge text-[10px] tracking-widest uppercase mb-2 inline-block">
            {badge}
          </span>
        )}
        <h2 className="font-display font-bold text-2xl md:text-4xl text-white tracking-wide leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="font-serif italic text-[#9d8bbb] text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {cta && (
        <Link
          to={ctaLink}
          className="flex-shrink-0 text-xs font-sans font-semibold text-primary-300 hover:text-white uppercase tracking-wider transition-colors hidden md:block"
        >
          {cta} →
        </Link>
      )}
    </div>
  );
}

// ─── Horizontal Scroll Product Row ────────────────────────────────────────────
function ProductRow({ products, loading }) {
  const skeletons = Array.from({ length: 5 });

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4">
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-44 md:w-56 rounded-2xl bg-white/5 animate-pulse"
            style={{ aspectRatio: "3/4" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 snap-x snap-mandatory">
      {products.map((p) => (
        <div key={p._id} className="flex-shrink-0 w-44 md:w-56 snap-start">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);

  // SEO metadata setup
  useEffect(() => {
    document.title = "AuraBella | Premium Fashion & Luxury Beauty";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Shop premium clothing, makeup, footwear, and jewellery collections at AuraBella. Experience absolute luxury.");
    }
  }, []);

  // Fetch trending (popular sort)
  useEffect(() => {
    api
      .get("/products?sort=popular&limit=8")
      .then((res) => setTrending(res.data.data || []))
      .catch(() => setTrending(MOCK_PRODUCTS))
      .finally(() => setLoadingTrending(false));
  }, []);

  // Fetch new arrivals (newest sort)
  useEffect(() => {
    api
      .get("/products?sort=newest&limit=8")
      .then((res) => setNewArrivals(res.data.data || []))
      .catch(() => setNewArrivals([...MOCK_PRODUCTS].reverse()))
      .finally(() => setLoadingNew(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">

      {/* ── 1. Hero Carousel ── */}
      <HeroCarousel />

      {/* ── 2. Shop by Category ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <SectionHeader
          badge="✦ Curated For You"
          title="Shop by Category"
          subtitle="Four worlds of luxury, one destination."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] border border-white/5 hover:border-primary-400/30 transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} via-transparent to-transparent`} />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent" />

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <span className="font-sans text-[10px] text-white/50 uppercase tracking-widest block mb-1">
                  {cat.count}
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-white tracking-wide group-hover:gradient-text transition-all">
                  {cat.name}
                </h3>
                <span className="inline-block mt-2 text-[10px] font-sans font-semibold text-primary-300 uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Trending Now ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
        <SectionHeader
          badge="🔥 Most Loved"
          title="Trending Now"
          subtitle="Our community's favourite picks this season."
          cta="View All"
          ctaLink="/category/all"
        />
        <ProductRow products={trending} loading={loadingTrending} />
      </section>

      {/* ── Brand Promise Strip ── */}
      <section className="border-y border-white/5 bg-dark-800/60 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 min-[430px]:grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {PROMISES.map((p) => (
              <div key={p.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-400/15 flex items-center justify-center text-primary-300 flex-shrink-0">
                  {p.icon}
                </div>
                <div>
                  <p className="font-sans text-xs font-semibold text-white">{p.label}</p>
                  <p className="font-sans text-[11px] text-[#9d8bbb] mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. New Arrivals ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <SectionHeader
          badge="✨ Just Landed"
          title="New Arrivals"
          subtitle="Fresh luxury — updated every week."
          cta="See All New"
          ctaLink="/category/all"
        />
        <ProductRow products={newArrivals} loading={loadingNew} />
      </section>

      {/* ── 5. Newsletter CTA Banner ── */}
      <section className="px-4 md:px-8 pb-20">
        <div
          className="max-w-7xl mx-auto rounded-2xl md:rounded-3xl overflow-hidden relative py-12 md:py-20 px-4 sm:px-8 md:px-16 text-center"
          style={{
            background: "linear-gradient(135deg, #2a1040 0%, #1a0830 40%, #1e0a1a 100%)",
            border: "1px solid rgba(196,77,239,0.2)",
          }}
        >
          {/* Decorative orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] blur-3xl opacity-25 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, #c44def, transparent 70%)" }} />

          <span className="badge text-[10px] tracking-widest uppercase mb-4 inline-block">
            ✦ Aura Club Newsletter
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-wide mb-4">
            Join the Inner Circle
          </h2>
          <p className="font-serif italic text-[#9d8bbb] max-w-lg mx-auto mb-8 text-base">
            Be the first to know about new drops, exclusive offers, and members-only events.
            Get 10% off your very first order.
          </p>

          <form
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-sm mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="w-full text-sm bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-400 focus:outline-none rounded-full py-3.5 px-5 text-white font-sans transition-colors"
            />
            <button type="submit" className="btn-primary py-3.5 px-8 text-sm flex-shrink-0">
              Subscribe
            </button>
          </form>
          <p className="font-sans text-[10px] text-white/25 mt-4">
            No spam. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
