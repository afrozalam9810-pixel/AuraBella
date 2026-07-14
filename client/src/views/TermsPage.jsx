export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-white font-sans">
      <div className="text-center mb-12">
        <span className="badge text-[10px] tracking-widest uppercase mb-4 inline-block">
          ✦ Legal Agreement
        </span>
        <h1 className="font-display font-bold text-4xl md:text-6xl gradient-text tracking-wide leading-tight mb-4">
          Terms &amp; Conditions
        </h1>
        <p className="font-serif italic text-[#9d8bbb] text-base">
          Last Updated: July 14, 2026
        </p>
      </div>

      <div className="glass-card p-8 md:p-12 flex flex-col gap-6 leading-relaxed text-sm text-white/80">
        <p>
          Welcome to AuraBella. These Terms &amp; Conditions govern your use of our website located at https://www.aurabellaafroz.com and the purchase of items from our e-commerce platform. By accessing our site, you agree to comply with these terms in full.
        </p>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">1. User Accounts</h2>
          <p>
            When registering an account on AuraBella, you represent that all information supplied is accurate, current, and complete. You are responsible for safeguarding your credentials, and you agree to accept responsibility for all actions that occur under your user profile.
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">2. Purchase &amp; Pricing Policies</h2>
          <p>
            All product specifications, details, and pricing are subject to modification without notice. We reserve the right to refuse or cancel any order in the event that product availability is limited, or if there is an error in pricing or tax details. Prices include dynamic GST rates relevant to specific product categories in India.
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">3. Intellectual Property</h2>
          <p>
            All original graphics, designs, codebase, catalog collections, brand representations, and layouts are the exclusive intellectual property of AuraBella Inc. No material from this site may be duplicated, shared, or republished without direct written permission.
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">4. Limitation of Liability</h2>
          <p>
            AuraBella, its directors, and associates shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from your access to, or inability to use, our e-commerce portal or purchase items. Disputes are subject to the exclusive jurisdiction of courts in India.
          </p>
        </section>
      </div>
    </div>
  );
}
