"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import OrderSuccessPage from "../../../views/OrderSuccessPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <OrderSuccessPage />
    </ProtectedRoute>
  );
}
