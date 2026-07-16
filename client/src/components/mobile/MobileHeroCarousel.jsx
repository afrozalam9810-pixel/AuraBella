import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

const HERO_SLIDES = [
  {
    id: 1,
    image: "/assets/hero1.jpg",
    badge: "New Season Drop",
    title: "Luxury Essentials",
    cta: "Shop Clothing",
    ctaLink: "/category/clothing",
  },
  {
    id: 2,
    image: "/assets/hero2.jpg",
    badge: "Beauty Essentials",
    title: "Glow & Radiance",
    cta: "Explore Makeup",
    ctaLink: "/category/makeup",
  },
  {
    id: 3,
    image: "/assets/hero3.jpg",
    badge: "Fine Jewellery",
    title: "Shine With Purpose",
    cta: "View Jewellery",
    ctaLink: "/category/jewellery",
  },
  {
    id: 4,
    image: "/assets/hero4.jpg",
    badge: "Footwear",
    title: "Step Into Luxury",
    cta: "Shop Footwear",
    ctaLink: "/category/footwear",
  },
];

export default function MobileHeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay functionality (5 seconds interval)
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <section className="relative w-full aspect-[16/10] overflow-hidden" aria-label="Featured Banners">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {HERO_SLIDES.map((slide) => (
            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              {/* Responsive Banner Image */}
              <img
                src={slide.image}
                alt={slide.badge}
                loading={slide.id === 1 ? "eager" : "lazy"}
                fetchPriority={slide.id === 1 ? "high" : "low"}
                decoding="async"
                className="w-full h-full object-cover object-top"
              />
              {/* Rich Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
              
              {/* Content Panel overlay */}
              <div className="absolute bottom-6 left-4 right-4 flex flex-col items-start gap-1">
                <span className="text-[8px] tracking-widest uppercase font-bold text-primary-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  ✦ {slide.badge}
                </span>
                <h2 className="font-display font-bold text-white text-lg mt-1">
                  {slide.title}
                </h2>
                <Link
                  to={slide.ctaLink}
                  className="mt-2 text-[10px] font-sans font-bold bg-white text-dark-950 px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md hover:bg-white/90 transition-colors"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination indicators (Dots) */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-4 h-1.5 bg-brand-gradient"
                : "w-1.5 h-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
