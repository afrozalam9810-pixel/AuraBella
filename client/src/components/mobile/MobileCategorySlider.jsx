import React from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

const CATEGORIES = [
  { name: "Clothing", slug: "clothing", image: "/assets/cat-clothing.jpg" },
  { name: "Footwear", slug: "footwear", image: "/assets/cat-footwear.jpg" },
  { name: "Makeup", slug: "makeup", image: "/assets/cat-makeup.jpg" },
  { name: "Jewellery", slug: "jewellery", image: "/assets/cat-jewellery.jpg" },
];

export default function MobileCategorySlider() {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
  });

  return (
    <div className="w-full px-4 py-4" aria-label="Shop by Category Slider">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="flex-[0_0_80px] min-w-0 flex flex-col items-center gap-1.5 snap-start group"
            >
              {/* Rounded Image Container with Shadow */}
              <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Category Name label */}
              <span className="text-[10px] font-sans font-bold text-white/90 text-center uppercase tracking-wide truncate w-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
