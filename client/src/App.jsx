/**
 * App.jsx
 * Root application component.
 * Defines the full route tree with Navbar + Footer shared layout.
 */

import { Routes, Route } from "react-router-dom";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage               from "./pages/HomePage";
import ProductListingPage     from "./pages/ProductListingPage";
import ProductDetailPage      from "./pages/ProductDetailPage";
import CartPage               from "./pages/CartPage";
import CheckoutPage           from "./pages/CheckoutPage";
import WishlistPage           from "./pages/WishlistPage";
import LoginPage              from "./pages/LoginPage";
import RegisterPage           from "./pages/RegisterPage";
import GoogleAuthCallback     from "./pages/GoogleAuthCallback";
import AccountPage            from "./pages/AccountPage";
import AccountOrdersPage      from "./pages/AccountOrdersPage";
import AccountOrderDetailPage from "./pages/AccountOrderDetailPage";
import OrderSuccessPage       from "./pages/OrderSuccessPage";
import NotFoundPage           from "./pages/NotFoundPage";

// Admin imports
import AdminRoute             from "./components/AdminRoute";
import AdminLayout            from "./pages/admin/AdminLayout";
import AdminDashboard         from "./pages/admin/AdminDashboard";
import AdminProducts          from "./pages/admin/AdminProducts";
import AdminProductForm       from "./pages/admin/AdminProductForm";
import AdminCategories        from "./pages/admin/AdminCategories";
import AdminOrders            from "./pages/admin/AdminOrders";
import AdminCoupons           from "./pages/admin/AdminCoupons";
import AdminUsers             from "./pages/admin/AdminUsers";

// General components
import Toast                  from "./components/Toast";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-dark-900">
      <Navbar />
      <Toast />

      {/* Main content grows to fill remaining viewport height */}
      <main className="flex-grow">
        <Routes>
          {/* Public */}
          <Route path="/"                         element={<HomePage />} />
          <Route path="/category/:slug"           element={<ProductListingPage />} />
          <Route path="/product/:id"              element={<ProductDetailPage />} />
          <Route path="/cart"                     element={<CartPage />} />
          <Route path="/login"                    element={<LoginPage />} />
          <Route path="/register"                 element={<RegisterPage />} />
          <Route path="/auth/google/callback"     element={<GoogleAuthCallback />} />

          {/* Protected Routes */}
          <Route path="/checkout"                 element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/wishlist"                 element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/account"                  element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/account/orders"           element={<ProtectedRoute><AccountOrdersPage /></ProtectedRoute>} />
          <Route path="/account/orders/:id"       element={<ProtectedRoute><AccountOrderDetailPage /></ProtectedRoute>} />
          <Route path="/order-success/:orderId"   element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin"                    element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index                          element={<AdminDashboard />} />
            <Route path="products"                element={<AdminProducts />} />
            <Route path="products/new"            element={<AdminProductForm />} />
            <Route path="products/:id/edit"       element={<AdminProductForm />} />
            <Route path="categories"              element={<AdminCategories />} />
            <Route path="orders"                  element={<AdminOrders />} />
            <Route path="coupons"                 element={<AdminCoupons />} />
            <Route path="users"                   element={<AdminUsers />} />
          </Route>

          {/* 404 */}
          <Route path="*"                         element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
