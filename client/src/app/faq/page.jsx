import FaqPage from "../../views/FaqPage";

export const metadata = {
  title: "FAQs & Help Center | AuraBella Fashion",
  description: "Find answers to frequently asked questions about online shopping, size guides, sarees, kurtis, secure payments, Cash on Delivery, returns, and shipping at AuraBella.",
  alternates: { canonical: "/faq" },
};

export default function Page() {
  return <FaqPage />;
}
