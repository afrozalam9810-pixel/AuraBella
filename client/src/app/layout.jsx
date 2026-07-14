import "./../index.css";
import AppShell from "./AppShell";
import { Cormorant_Garamond, Poppins } from "next/font/google";

/**
 * Self-hosted Google Fonts via next/font.
 * Fonts are downloaded at build time and served from the same CDN as the app,
 * eliminating the render-blocking external Google Fonts network request.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const metadata = {
  metadataBase: new URL("https://www.aurabellaafroz.com"),
  title: {
    default: "AuraBella | Premium Women's Fashion & Luxury Beauty",
    template: "%s | AuraBella"
  },
  description: "Explore AuraBella for premium women's clothing, ethnic wear, western wear, luxury cosmetics, footwear, and designer accessories online in India.",
  keywords: [
    "Aurabella", "Aurabella Fashion", "Women's Fashion Online", "Women's Clothing Online",
    "Buy Women's Clothing Online", "Online Fashion Store India", "Women's Ethnic Wear",
    "Women's Western Wear", "Affordable Fashion India", "Premium Women's Fashion",
    "Online Shopping for Women", "Fashion Ecommerce India", "Women's Dresses Online",
    "Buy Sarees Online", "Buy Kurtis Online", "Women's Tops Online"
  ],
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    title: "AuraBella | Premium Women's Fashion & Luxury Beauty",
    description: "Shop the latest in premium clothing, ethnic wear, footwear, makeup, and jewellery collections at AuraBella. Experience conscious luxury and fast delivery.",
    url: "https://www.aurabellaafroz.com",
    siteName: "AuraBella",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AuraBella Premium Fashion & Luxury Beauty"
      }
    ],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraBella | Premium Women's Fashion & Luxury Beauty",
    description: "Shop the latest in premium clothing, ethnic wear, footwear, makeup, and jewellery collections at AuraBella.",
    images: ["/assets/og-image.jpg"],
    creator: "@AuraBella"
  }
};

export default function RootLayout({ children }) {
  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AuraBella",
    "url": "https://www.aurabellaafroz.com",
    "logo": "https://www.aurabellaafroz.com/assets/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-98XXX-XXXXX",
      "contactType": "customer service",
      "email": "support@aurabellaafroz.com",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    },
    "sameAs": [
      "https://www.facebook.com/aurabella",
      "https://www.instagram.com/aurabella",
      "https://twitter.com/aurabella"
    ]
  };

  const jsonLdWeb = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AuraBella",
    "url": "https://www.aurabellaafroz.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.aurabellaafroz.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className={`${cormorant.variable} ${poppins.variable}`}>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-W1CDF3ZFW2" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-W1CDF3ZFW2');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWeb) }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
