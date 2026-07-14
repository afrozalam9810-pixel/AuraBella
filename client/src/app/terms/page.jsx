import TermsPage from "../../views/TermsPage";

export const metadata = {
  title: "Terms & Conditions | AuraBella Fashion",
  description: "Read the Terms & Conditions governing the use of AuraBella's website, order placement policies, user accounts, and licensing terms.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <TermsPage />;
}
