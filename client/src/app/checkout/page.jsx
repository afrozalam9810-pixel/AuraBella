"use client";

import dynamic from "next/dynamic";

const CheckoutPage = dynamic(() => import("../../views/CheckoutPage"), { ssr: false });
const ProtectedRoute = dynamic(() => import("../../components/ProtectedRoute"), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
}
