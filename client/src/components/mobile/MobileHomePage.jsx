import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import MobileCategorySlider from "./MobileCategorySlider";
import MobileHeroCarousel from "./MobileHeroCarousel";
import MobileProductCard from "./MobileProductCard";
import RecentlyViewed from "../RecentlyViewed";

// Static Brands Data
const BRANDS = [
  { name: "Zara", desc: "Luxury Apparel", image: "https://placehold.co/150x150/110b24/f0e8ff?text=ZARA" },
  { name: "Swarovski", desc: "Fine Jewellery", image: "https://placehold.co/150x150/110b24/f0e8ff?text=SWAROVSKI" },
  { name: "Steve Madden", desc: "Premium Footwear", image: "https://placehold.co/150x150/110b24/f0e8ff?text=MADDEN" },
  { name: "MAC", desc: "Luxury Cosmetics", image: "https://placehold.co/150x150/110b24/f0e8ff?text=MAC" },
];

const FEATURED_CATS = [
  { name: "Ethnic Wear", slug: "clothing?subCategory=Sarees", image: "/assets/cat-clothing.jpg" },
  { name: "Glam Essentials", slug: "makeup?subCategory=Lipstick", image: "/assets/cat-makeup.jpg" },
  { name: "Luxury Heels", slug: "footwear?subCategory=Heels", image: "/assets/cat-footwear.jpg" },
  { name: "Glimmer & Gems", slug: "jewellery?subCategory=Earrings", image: "/assets/cat-jewellery.jpg" },
];

export default function MobileHomePage({ trending = [], newArrivals = [], loadingTrending, loadingNew }) {
  
  // Slice or map lists for Best Sellers to avoid extra API queries
  const bestSellers = trending.slice(0, 4);

  return (
    <div className="bg-dark-950 min-h-screen text-white pb-6 flex flex-col gap-6 font-sans select-none">
      {/* 1. Category Quick Links Slider */}
      <MobileCategorySlider />

      {/* 2. Hero Carousel Banners */}
      <MobileHeroCarousel />

      {/* 3. Featured Categories 2-Column Luxury Grid */}
      <section className="px-4">
        <h2 className="text-xs uppercase tracking-widest text-[#9d8bbb] font-bold mb-3">
          ✦ Curated Luxury
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURED_CATS.map((cat) => (
            <Link
              key={cat.name}
              to={`/category/${cat.slug}`}
              className="relative aspect-[16/10] rounded-xl overflow-hidden border border-white/5 shadow-sm group"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute bottom-2.5 left-3 text-[11px] font-sans font-bold text-white uppercase tracking-wider">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Trending Now horizontal card slider */}
      <section className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs uppercase tracking-widest text-[#9d8bbb] font-bold">
            ✦ Trending Now
          </h2>
          <Link to="/category/all?sort=popular" className="text-[10px] font-semibold text-primary-400">
            View All
          </Link>
        </div>

        {loadingTrending ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-32 aspect-[3/4] bg-white/5 rounded-2xl flex-shrink-0 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
            {trending.map((prod) => (
              <div key={prod._id} className="w-[140px] flex-shrink-0 snap-start">
                <MobileProductCard product={prod} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. New Arrivals horizontal card slider */}
      <section className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs uppercase tracking-widest text-[#9d8bbb] font-bold">
            ✦ New Arrivals
          </h2>
          <Link to="/category/all?sort=newest" className="text-[10px] font-semibold text-primary-400">
            View All
          </Link>
        </div>

        {loadingNew ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-32 aspect-[3/4] bg-white/5 rounded-2xl flex-shrink-0 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
            {newArrivals.map((prod) => (
              <div key={prod._id} className="w-[140px] flex-shrink-0 snap-start">
                <MobileProductCard product={prod} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Best Sellers horizontal card slider */}
      <section className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs uppercase tracking-widest text-[#9d8bbb] font-bold">
            ✦ Best Sellers
          </h2>
          <Link to="/category/all?sort=popular" className="text-[10px] font-semibold text-primary-400">
            View All
          </Link>
        </div>

        {loadingTrending ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-32 aspect-[3/4] bg-white/5 rounded-2xl flex-shrink-0 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
            {bestSellers.map((prod) => (
              <div key={prod._id} className="w-[140px] flex-shrink-0 snap-start">
                <MobileProductCard product={prod} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. Brand Boutique Grid */}
      <section className="px-4">
        <h2 className="text-xs uppercase tracking-widest text-[#9d8bbb] font-bold mb-3">
          ✦ Premium Boutiques
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {BRANDS.map((b) => (
            <Link
              key={b.name}
              to={`/category/all?search=${encodeURIComponent(b.name)}`}
              className="flex flex-col items-center gap-1.5 p-2 bg-dark-900 border border-white/5 rounded-xl text-center group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-dark-950 font-display font-bold text-[8px] text-primary-400 select-none">
                {b.name.substring(0, 3).toUpperCase()}
              </div>
              <span className="text-[8px] font-sans font-bold text-white/90 truncate w-full uppercase tracking-wider">
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Recently Viewed (using pre-existing responsive grid) */}
      <section className="px-4 border-t border-white/5 pt-4 mt-2">
        <RecentlyViewed excludeId={null} />
      </section>
    </div>
  );
}
