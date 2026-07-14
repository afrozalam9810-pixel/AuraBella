"use client";

import AdminRoute from "../../components/AdminRoute";
import AdminLayout from "../../views/admin/AdminLayout";

export default function Layout({ children }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}
