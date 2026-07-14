"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiHelpCircle, FiShoppingBag, FiTruck, FiRefreshCw, FiCreditCard, FiUser, FiInfo } from "react-icons/fi";

const FAQ_CATEGORIES = [
  { id: "shopping", label: "Shopping & Orders", icon: FiShoppingBag },
  { id: "sizing", label: "Fabrics & Sizing", icon: FiInfo },
  { id: "shipping", label: "Shipping & COD", icon: FiTruck },
  { id: "returns", label: "Returns & Refunds", icon: FiRefreshCw },
  { id: "payments", label: "Payments & Security", icon: FiCreditCard },
  { id: "account", label: "Account & Support", icon: FiUser },
];

const FAQ_DATA = {
  shopping: [
    {
      q: "How do I place an order online at Aurabella?",
      a: "Placing an order on Aurabella, India's premium online fashion store, is fast, secure, and simple. Browse our curated collections of ethnic wear, dresses, kurtis, and western wear. Select your preferred color, size (referencing our Size Guide), and click 'Add to Bag'. Once you are ready, click the bag icon at the top right to view your cart, apply any active coupons, and click 'Proceed to Checkout'. Fill in your shipping address, select your preferred payment method (secure online payment via UPI/Cards or Cash on Delivery), and confirm your order. You will receive an immediate confirmation email and SMS with your tracking details."
    },
    {
      q: "Can I modify my delivery address or order items after placing an order?",
      a: "To ensure fast delivery, we process orders within 1-2 hours of placement. If you need to make changes to your shipping address, recipient phone number, or product variants (size/color), please contact our Customer Support team immediately. If your order has not yet been packed or dispatched from our warehouse, we will gladly update the delivery details. However, once the package is handed over to our courier partners, we cannot modify the shipment details. You will need to place a new order or request a return once delivered."
    },
    {
      q: "How do I track my Aurabella order shipment status?",
      a: "Tracking your shipment is simple. Once your premium women's clothing order is dispatched, we will send you a shipment confirmation email and SMS containing a unique Tracking Number and courier partner link. You can also track your shipment status directly from your Aurabella account dashboard. Navigate to 'My Account' > 'Orders', select your specific order ID, and view the live updates on the status timeline (Packed, Shipped, Out for Delivery). If you have any transit delays, please contact our support team for quick resolution."
    },
    {
      q: "Is it possible to place a custom or wholesale order at Aurabella?",
      a: "Yes! Aurabella is a premium women's clothing store that values personalized tailoring and design. If you are interested in bulk ordering, bridesmaid sets, custom sizing for ethnic wear, or wholesale purchase of sarees and kurtis, please reach out to our team at support@aurabellaafroz.com. Let us know the style name, required quantities, and specifications. Our design representatives will contact you within 24 hours to discuss pricing details, manufacturing timelines, and custom delivery options."
    },
    {
      q: "Why did my order get cancelled automatically?",
      a: "Automatic order cancellations are rare and usually occur if the selected premium women's clothing item fails our rigorous pre-shipment quality check, or if a database inventory error occurs. If we cancel your order, you will receive an immediate notification email detailing the cancellation reason. If you paid online via Razorpay, UPI, or card, the refund will be automatically credited back to your original payment source within 2–5 business days. No cancellation charges will ever apply to you."
    }
  ],
  sizing: [
    {
      q: "How do I find the correct clothing size for myself at Aurabella?",
      a: "We want your premium women's fashion to fit you perfectly. Every product page contains a detailed 'Size Guide' link displaying precise measurements in both inches and centimeters for bust, waist, hips, and length. Since fits can vary between Ethnic Wear (like Kurtis and Sarees) and Western Wear (like Tops and Co-ord Sets), we highly recommend measuring yourself and comparing it to our size chart. If you are between sizes, we recommend ordering one size larger for a comfortable fit or contacting our styling team for advice."
    },
    {
      q: "What fabrics do you use in your Kurtis, Sarees, and Dresses?",
      a: "At Aurabella, we prioritize luxury textiles, structural durability, and breathable comfort. Our ethnic kurtis and sarees are crafted using premium natural fibers including organic cotton, hand-woven chanderi, mulberry silk, breathable linen, and georgette. Our western dresses and co-ord sets are produced using premium blends, rayon, and crepe to ensure a beautiful drape and minimal wrinkling. Detailed fabric content is listed under the 'Specifications' tab on every product page to help you buy women's clothing online with absolute confidence."
    },
    {
      q: "Are the colors of sarees and kurtis shown on the website accurate?",
      a: "We photograph all our products in professional studio lighting using high-resolution cameras to capture the true color, texture, and intricate embroidery of our ethnic wear and dresses. However, due to differences in screen contrast, brightness settings, and device calibrations, minor color variations may occur. These differences are minimal, and we guarantee that the material quality and design details match the premium standards displayed on our online fashion store."
    },
    {
      q: "How should I wash and care for my premium Aurabella apparel?",
      a: "To preserve the longevity of your premium clothing, please follow the care label attached to each garment. As a general rule, cotton, rayon, and linen kurtis or tops can be machine-washed on a gentle cycle in cold water with mild detergent and line-dried in the shade. Intricately embroidered ethnic sets, silk sarees, and delicate georgette dresses should be dry-cleaned only. Never wring, bleach, or tumble-dry your premium garments. Use a warm iron or steam iron on the reverse side of embellishments."
    },
    {
      q: "Do you restock products that are currently sold out?",
      a: "To maintain the exclusivity of our latest fashion trends, we produce our designer garments in limited quantities. However, popular items such as signature sarees, cotton kurtis, and designer co-ord sets are occasionally restocked based on high demand. You can click the 'Notify Me' button on any sold-out product page and enter your email address. We will automatically alert you the moment the item becomes available in your size."
    },
    {
      q: "Do you sell matching accessories, handbags, and footwear?",
      a: "Yes! Aurabella is a complete lifestyle brand. We offer a curated collection of women's accessories, premium handbags, and designer women's footwear to complete your styling. From block heels and embellished flats to statement necklaces, sling bags, and clutches, we design our accessories to harmonize beautifully with our ethnic wear and western collections. Browse our accessories catalog to curate a head-to-toe look."
    }
  ],
  shipping: [
    {
      q: "What are the shipping charges for orders within India?",
      a: "We are pleased to offer Free Shipping on all orders across India, with no minimum purchase value required! Whether you buy a single kurti, a premium handbag, or multiple designer sarees, shipping is completely free. We cover all packaging, handling, and delivery fees. The price you see in your bag is the exact price you pay at checkout, making online shopping at Aurabella transparent and affordable."
    },
    {
      q: "Is Cash on Delivery (COD) available for my pincode?",
      a: "Yes! To make online shopping in India highly convenient and trustworthy, we offer Cash on Delivery (COD) across 19,000+ pincodes. There are no hidden fees or extra COD service charges. You simply pay the exact order total to the delivery agent when your package arrives. Please note that COD is only available for orders below ₹10,000. For higher-value transactions, we invite you to use our secure online payment methods."
    },
    {
      q: "How long does it take for my order to be delivered?",
      a: "We partner with high-tier national logistics networks (such as BlueDart, Delhivery, and Xpressbees) to ensure fast delivery. Metro Cities (Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Pune) deliveries usually take 2-4 business days. Tier-2 & Tier-3 Cities take 3-6 business days, and remote regions take 5-8 business days. All shipments are dispatched from our warehouse within 24-48 hours of order confirmation."
    },
    {
      q: "Do you ship internationally?",
      a: "Currently, Aurabella focuses on delivering affordable women's fashion and luxury garments within India. We do not support automated checkout for international addresses on our website. However, if you reside outside India and wish to purchase our collections, please contact us at support@aurabellaafroz.com. We can manually process custom international shipping requests, calculating specific shipping charges and customs duties for your country."
    },
    {
      q: "What happens if my package is lost or damaged during transit?",
      a: "All Aurabella shipments are fully insured. In the unlikely event that your package is lost in transit, damaged, or has broken seals upon arrival, please do not accept the package from the delivery agent. Contact our support team immediately. We will initiate a tracking investigation with the courier partner and arrange a free replacement order or issue a full refund to your account."
    }
  ],
  returns: [
    {
      q: "What is the return policy at Aurabella?",
      a: "We want you to love your purchase. If you are not fully satisfied with your clothing, accessories, or footwear, you can request an easy return or exchange within 30 days of delivery. The item must be unused, unwashed, with all original brand tags attached, and in its original packaging. Please note that for hygiene reasons, fine jewellery and innerwear cannot be returned. Initiate your return request directly through the 'Orders' page on your account."
    },
    {
      q: "How do I schedule a return pickup for my order?",
      a: "Once you submit a return request on our website, we will arrange a free return reverse-pickup from your delivery address. Our courier partner will pick up the package within 24-48 hours. Please ensure the items are packed securely with the original tags and invoice. If reverse-pickup is unavailable for your specific remote pincode, we will request you to self-ship the package, and we will credit ₹100 to your wallet to cover postage fees."
    },
    {
      q: "How and when will I receive my refund?",
      a: "Once your returned package reaches our warehouse and passes our quality inspection, we will issue your refund. Prepaid Orders (Cards/UPI/NetBanking) refunds are automatically credited to the original payment source via Razorpay within 3–5 business days. Cash on Delivery (COD) Orders can choose to receive your refund as store credits instantly, or provide your bank details (Account Number, IFSC) to receive a direct bank transfer within 5-7 business days."
    },
    {
      q: "Can I exchange an item for a different size or color?",
      a: "Absolutely! If your dress, kurti, or footwear doesn't fit correctly, you can request a size or color exchange within 30 days of delivery at no extra cost. We will arrange a pickup of your original item and ship the replacement variant immediately once the returned package is picked up. Exchanges are subject to inventory availability. If the required size is sold out, we will issue a full refund."
    },
    {
      q: "How do I cancel my order, and will I get a full refund?",
      a: "You can cancel your order directly from your account dashboard before the order status is marked as 'Shipped' or 'Dispatched'. Simply click 'Cancel Order' on your orders page. If the order is prepaid, a full refund will be processed immediately to your original payment source. If the package has already been dispatched, you cannot cancel it; you will need to decline the delivery or return it once received."
    }
  ],
  payments: [
    {
      q: "What payment methods do you accept at Aurabella?",
      a: "We accept a wide range of secure online payment options to ensure a smooth checkout experience. You can pay using Credit/Debit cards (Visa, Mastercard, RuPay, Maestro, Amex), Unified Payments Interface (UPI) via GPay, PhonePe, Paytm, BHIM, Net Banking across all major Indian banks, Digital Wallets, or Cash on Delivery (COD). All online transactions are encrypted and processed securely."
    },
    {
      q: "Is my payment secure on your website?",
      a: "Yes, secure online shopping is our highest priority. The Aurabella platform is fully integrated with Razorpay, India's leading payment gateway, which complies with PCI-DSS (Payment Card Industry Data Security Standard) Level 1 standards. Our entire website operates under SSL (Secure Sockets Layer) encryption, protecting your personal details, credit card numbers, and banking credentials from unauthorized access."
    },
    {
      q: "What should I do if my payment fails but the money is deducted from my bank?",
      a: "Payment failures can occur due to bank server timeouts or network fluctuations. If your payment fails but the money is deducted, the amount is completely safe. The bank's automated systems will identify the failed transaction and refund the money back to your account within 3–5 business days. You can check your email for a payment confirmation from Razorpay or contact our support team to verify if we received the payment."
    },
    {
      q: "Do your prices include Goods and Services Tax (GST)?",
      a: "Yes, all product prices listed on the Aurabella website are inclusive of GST. There are no hidden taxes added at checkout. Once you place an order, you will receive a detailed GST Invoice displaying the tax breakups (CGST/SGST/IGST) and HSN codes for your records. If you require a B2B invoice with your company's GSTIN, please contact our support team immediately after ordering."
    },
    {
      q: "Why is my coupon code not working at checkout?",
      a: "Coupon codes may fail if they have expired, if the items in your cart do not meet the minimum order value required for the promotion, or if the code is restricted to specific categories (such as clearance sale items). Please check the terms of the coupon code. Note that only one coupon code can be applied per order; coupons cannot be combined."
    },
    {
      q: "Do you save my credit card or bank details on your servers?",
      a: "No. Aurabella does not store, see, or retain your sensitive card numbers, CVVs, or bank credentials on our databases. All transactions are securely routed through tokenized encryption directly via Razorpay's systems. Your checkout experience is fast, modern, and complies with Reserve Bank of India (RBI) regulations."
    }
  ],
  account: [
    {
      q: "Do I need to create an account to shop at Aurabella?",
      a: "While you can browse our collections as a guest, we highly recommend creating a free account. Creating an account allows you to securely save your shipping address, track your shipment status in real-time, view past orders, compile a wishlist of your favorite garments, and receive exclusive member discounts and early access to our fashion sales."
    },
    {
      q: "What benefits do I get by joining the Aurabella Newsletter?",
      a: "Joining the Aurabella newsletter is the best way to stay updated on latest fashion trends. When you subscribe, you receive an instant 10% discount coupon code for your first purchase. You will also receive curated style guides, invitations to VIP sales, and alerts when new ethnic and western collections arrive. We value your privacy and never spam."
    },
    {
      q: "How do I use my wishlist to save items for later?",
      a: "Our wishlist feature lets you compile a curated gallery of your favorite dresses, sarees, and accessories. Simply click the heart icon on any product card or detail page. You can review your saved items at any time by clicking the heart icon in the navigation bar. Wishlisted items are saved to your account and can be moved to your cart with a single click."
    },
    {
      q: "How do I contact Aurabella customer support?",
      a: "Our dedicated customer care team is available to assist you with any questions about size guides, order status, payments, or returns. You can email us at support@aurabellaafroz.com, call us at +91-98765-43210 (Mon-Sat, 10 AM - 6 PM IST), or use the Contact Form available on our Contact Us page. We strive to respond to all inquiries within 24 hours."
    },
    {
      q: "How does Aurabella protect my personal information?",
      a: "We take your privacy very seriously. Our Privacy Policy governs how we handle and protect customer information. We use advanced firewall security, database encryption, and secure administrative controls to ensure your personal details are kept strictly confidential. We never rent, sell, or share your contact info with third-party advertisers."
    }
  ],
};

export default function FaqPage() {
  const [activeTab, setActiveTab] = useState("shopping");
  const [expandedIdx, setExpandedIdx] = useState(null);

  const toggleAccordion = (idx) => {
    setExpandedIdx((prev) => (prev === idx ? null : idx));
  };

  // Compile JSON-LD schema dynamically
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": Object.values(FAQ_DATA)
      .flat()
      .map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a,
        },
      })),
  };

  const activeFaqs = FAQ_DATA[activeTab] || [];

  return (
    <div className="min-h-[80vh] py-8 md:py-16 text-white font-sans max-w-5xl mx-auto px-4 md:px-8">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-wider text-white">
          Help &amp; FAQs
        </h1>
        <p className="font-serif italic text-sm text-[#9d8bbb] mt-2">
          Everything you need to know about online shopping with Aurabella
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Left Side: Tabs */}
        <div className="md:col-span-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 gap-2 border-b border-white/5 md:border-b-0">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id);
                  setExpandedIdx(null);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs transition-all whitespace-nowrap min-w-fit ${
                  isActive
                    ? "bg-brand-gradient border-primary-500/30 text-white shadow-glow-violet"
                    : "bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="text-sm flex-shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Accordion Grid */}
        <div className="md:col-span-3 flex flex-col gap-3">
          {activeFaqs.map((faq, idx) => {
            const isExpanded = expandedIdx === idx;
            return (
              <div
                key={idx}
                className="glass-card border border-white/5 rounded-2xl overflow-hidden bg-white/5 transition-all duration-300"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between text-left p-5 gap-4 hover:bg-white/5 transition-colors focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start gap-3">
                    <FiHelpCircle className="text-primary-300 text-sm mt-0.5 flex-shrink-0" />
                    <span className="font-sans font-semibold text-xs md:text-sm text-white/90">
                      {faq.q}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`text-sm text-white/40 transition-transform duration-300 flex-shrink-0 ${
                      isExpanded ? "rotate-180 text-primary-400" : ""
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? "max-h-[300px] border-t border-white/5" : "max-h-0"
                  }`}
                >
                  <div className="p-5 font-sans text-xs md:text-sm text-white/70 leading-relaxed bg-dark-900/40">
                    {faq.a}
                    {/* Inject helpful internal links dynamically context-wise */}
                    {faq.q.includes("return") && (
                      <p className="mt-3 text-[11px] text-[#9d8bbb]">
                        For complete details, please read our full{" "}
                        <Link to="/return-policy" className="text-primary-400 underline hover:text-primary-300">
                          Return Policy
                        </Link>
                        .
                      </p>
                    )}
                    {faq.q.includes("shipping") && (
                      <p className="mt-3 text-[11px] text-[#9d8bbb]">
                        For delivery regions and timelines, read our full{" "}
                        <Link to="/shipping-policy" className="text-primary-400 underline hover:text-primary-300">
                          Shipping Policy
                        </Link>
                        .
                      </p>
                    )}
                    {faq.q.includes("correct clothing size") && (
                      <p className="mt-3 text-[11px] text-[#9d8bbb]">
                        View size charts on any product page, or use our{" "}
                        <Link to="/contact" className="text-primary-400 underline hover:text-primary-300">
                          Contact Form
                        </Link>{" "}
                        to consult with a stylist.
                      </p>
                    )}
                    {faq.q.includes("protect my personal information") && (
                      <p className="mt-3 text-[11px] text-[#9d8bbb]">
                        Your data security details can be reviewed in our{" "}
                        <Link to="/privacy" className="text-primary-400 underline hover:text-primary-300">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
