import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-white font-sans">
      <div className="text-center mb-12">
        <span className="badge text-[10px] tracking-widest uppercase mb-4 inline-block">
          ✦ Our Story
        </span>
        <h1 className="font-display font-bold text-4xl md:text-6xl gradient-text tracking-wide leading-tight mb-4">
          About AuraBella
        </h1>
        <p className="font-serif italic text-[#9d8bbb] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Aligning inner beauty with external luxury. We curate premium clothing, footwear, skincare, and fine jewellery designed to reflect and amplify your unique aura.
        </p>
      </div>

      <div className="glass-card p-8 md:p-12 flex flex-col gap-8 leading-relaxed text-sm text-white/80">
        <section className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-white tracking-wide border-b border-white/5 pb-2">
            The Genesis of AuraBella
          </h2>
          <p>
            Founded in 2026, AuraBella was born out of a desire to create a luxury lifestyle destination that combines premium Indian craftsmanship with international high-fashion sensibilities. We believe that clothing, makeup, and accessories are not merely external embellishments, but an extension of one's personal identity and energetic presence—your aura.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-white tracking-wide border-b border-white/5 pb-2">
            Our Philosophy: Conscious Luxury
          </h2>
          <p>
            At AuraBella, luxury is defined by quality, comfort, and authenticity. We source only the finest fabrics for our apparel, certified gold and diamonds for our jewellery, and dermatologist-approved formulations for our skincare collections. Every piece is meticulously selected and quality-tested to offer an unparalleled shopping experience.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center">
            <h3 className="font-display font-bold text-lg text-primary-300 mb-2">Premium Quality</h3>
            <p className="text-xs text-[#9d8bbb]">We enforce strict quality control standards to deliver the absolute finest products in India.</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center">
            <h3 className="font-display font-bold text-lg text-primary-300 mb-2">Artisanal Design</h3>
            <p className="text-xs text-[#9d8bbb]">Each piece in our clothing and jewellery collections reflects a timeless design legacy.</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-center">
            <h3 className="font-display font-bold text-lg text-primary-300 mb-2">Secure Shopping</h3>
            <p className="text-xs text-[#9d8bbb]">100% secure payments, fast express delivery, and hassle-free returns within 30 days.</p>
          </div>
        </section>

        <div className="flex justify-center mt-6">
          <Link to="/" className="btn-primary">
            Explore Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
