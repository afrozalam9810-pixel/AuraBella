export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-white font-sans">
      <div className="text-center mb-12">
        <span className="badge text-[10px] tracking-widest uppercase mb-4 inline-block">
          ✦ Returns
        </span>
        <h1 className="font-display font-bold text-4xl md:text-6xl gradient-text tracking-wide leading-tight mb-4">
          Return &amp; Refund Policy
        </h1>
        <p className="font-serif italic text-[#9d8bbb] text-base">
          Last Updated: July 14, 2026
        </p>
      </div>

      <div className="glass-card p-8 md:p-12 flex flex-col gap-6 leading-relaxed text-sm text-white/80">
        <p>
          At AuraBella, customer satisfaction is our top priority. We strive to provide premium clothing, makeup, and accessories that align with your lifestyle. If you are not entirely satisfied with your purchase, we are here to assist with hassle-free returns and refunds.
        </p>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">1. Return Eligibility Window</h2>
          <p>
            We offer a **30-day return policy**. You have 30 calendar days from the date of package delivery to request a return for your items. To be eligible for a return:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-[#9d8bbb]">
            <li>The item must be unused, unwashed, and in the same pristine condition that you received it.</li>
            <li>The product must be housed in its original luxury packaging, with all brand tags and seals intact.</li>
            <li>Products like cosmetics, makeup, and skincare items are non-returnable due to hygiene and health protection guidelines once opened.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">2. How to Request a Return</h2>
          <p>
            To initiate a return, navigate to your Profile Dashboard (`/account/orders`), choose the relevant order, and click the **Request Return** button. Alternatively, you can email our fulfillment center at <a href="mailto:support@aurabellaafroz.com" className="text-primary-300 hover:underline">support@aurabellaafroz.com</a> with your Order ID.
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">3. Refund Processing</h2>
          <p>
            Once we receive and inspect your returned items at our fulfillment facility, we will notify you regarding the approval status. If approved:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-[#9d8bbb]">
            <li><strong>Prepaid Orders:</strong> Refund will be processed back to your original payment method (Stripe/Card/NetBanking) within 5–7 business days.</li>
            <li><strong>Cash on Delivery (COD) Orders:</strong> Refund will be credited as AuraBella Store Credits, or transferred directly to your bank account via UPI/NEFT details supplied.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
