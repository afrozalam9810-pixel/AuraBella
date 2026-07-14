"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import AccountOrdersPage from "../../../views/AccountOrdersPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <AccountOrdersPage />
    </ProtectedRoute>
  );
}
