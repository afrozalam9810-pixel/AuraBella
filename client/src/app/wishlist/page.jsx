import dynamic from "next/dynamic";

const WishlistPage = dynamic(() => import("../../views/WishlistPage"), { ssr: false });
const ProtectedRoute = dynamic(() => import("../../components/ProtectedRoute"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute>
      <WishlistPage />
    </ProtectedRoute>
  );
}
