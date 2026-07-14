import PrivacyPage from "../../views/PrivacyPage";

export const metadata = {
  title: "Privacy Policy | AuraBella India",
  description: "Read AuraBella's Privacy Policy to learn how we collect, store, process, and protect your personal shopping data and billing credentials.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PrivacyPage />;
}
