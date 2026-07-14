export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-white font-sans">
      <div className="text-center mb-12">
        <span className="badge text-[10px] tracking-widest uppercase mb-4 inline-block">
          ✦ Fulfillment
        </span>
        <h1 className="font-display font-bold text-4xl md:text-6xl gradient-text tracking-wide leading-tight mb-4">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="font-serif italic text-[#9d8bbb] text-base">
          Last Updated: July 14, 2026
        </p>
      </div>

      <div className="glass-card p-8 md:p-12 flex flex-col gap-6 leading-relaxed text-sm text-white/80">
        <p>
          AuraBella provides reliable, high-speed, and secure shipping services across India. We partner with leading logistics companies (such as BlueDart, Delhivery, and Xpressbees) to ensure your luxury items reach your doorstep safely.
        </p>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">1. Shipping Charges</h2>
          <p>
            We offer **FREE shipping** on all orders above ₹2,000. For orders below ₹2,000, a flat shipping charge of ₹99 is applicable nationwide. There are no additional processing or handling fees.
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">2. Delivery Timelines</h2>
          <p>
            Our warehouse processes orders within 24–48 hours of confirmation. Expected transit times are as follows:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-[#9d8bbb]">
            <li><strong>Metro Cities (Mumbai, Delhi, Bangalore, etc.):</strong> 2 to 4 business days.</li>
            <li><strong>Rest of India (State capitals &amp; Tier-2/Tier-3 towns):</strong> 4 to 6 business days.</li>
            <li><strong>Special/Remote Regions (North-East, J&amp;K, etc.):</strong> 5 to 7 business days.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">3. Order Tracking</h2>
          <p>
            Once your package is dispatched, we send an email and SMS containing your **Courier Partner** name and a unique **Tracking Number**. You can track your shipment status in real time via our portal at `/account/orders` or using the tracking links provided.
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">4. Packaging Security</h2>
          <p>
            To protect your premium clothing, makeup, and fine jewellery, all items are dispatched in double-walled, tamper-evident AuraBella luxury boxes. Do not accept packages that appear damaged or opened, and report any shipping discrepancies immediately.
          </p>
        </section>
      </div>
    </div>
  );
}
