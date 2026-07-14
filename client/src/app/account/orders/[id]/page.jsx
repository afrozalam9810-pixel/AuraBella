"use client";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import AccountOrderDetailPage from "../../../../views/AccountOrderDetailPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <AccountOrderDetailPage />
    </ProtectedRoute>
  );
}
