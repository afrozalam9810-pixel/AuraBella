export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-white font-sans">
      <div className="text-center mb-12">
        <span className="badge text-[10px] tracking-widest uppercase mb-4 inline-block">
          ✦ Compliance
        </span>
        <h1 className="font-display font-bold text-4xl md:text-6xl gradient-text tracking-wide leading-tight mb-4">
          Privacy Policy
        </h1>
        <p className="font-serif italic text-[#9d8bbb] text-base">
          Last Updated: July 14, 2026
        </p>
      </div>

      <div className="glass-card p-8 md:p-12 flex flex-col gap-6 leading-relaxed text-sm text-white/80">
        <p>
          At AuraBella, accessible from https://www.aurabellaafroz.com, protecting the privacy of our visitors and customers is one of our primary commitments. This Privacy Policy document outlines the types of personal data we collect, store, process, and protect.
        </p>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">1. Information We Collect</h2>
          <p>We collect several types of data for various purposes, including:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-[#9d8bbb]">
            <li><strong>Personal Info:</strong> Name, email address, phone number, shipping and billing addresses during register/checkout.</li>
            <li><strong>Authentication Info:</strong> Hashed passwords and secure session tokens to enable secure sign-in.</li>
            <li><strong>Usage & Device Info:</strong> IP address, browser type, device details, and site interaction statistics generated during visits.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">2. How We Use Your Data</h2>
          <p>AuraBella utilizes collected data to deliver premium services, specifically for:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-[#9d8bbb]">
            <li>Fulfilling orders, processing payments (via Stripe, COD, etc.), and delivery details verification.</li>
            <li>Improving client portal features, user interface components, and custom-styled store recommendations.</li>
            <li>Communicating security details, order updates, invoices, and newsletter notifications (subject to user settings).</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">3. Data Sharing & Security</h2>
          <p>
            We do not sell, rent, or trade your personal data to third parties. We share information only with trusted payment gateways, shipping courier partners, and analytical databases required for operating our store. All communications are encrypted over modern SSL protocol (Strict-Transport-Security), and we store data using secure hashing methods.
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-1">4. Your Privacy Rights</h2>
          <p>
            Under India's digital personal data protection principles and global standards, you have the right to access, edit, or request complete deletion of your personal records. Contact us at support@aurabellaafroz.com to claim any adjustments.
          </p>
        </section>
      </div>
    </div>
  );
}
