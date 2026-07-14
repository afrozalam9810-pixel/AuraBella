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
import HomePage               from "./views/HomePage";
import ProductListingPage     from "./views/ProductListingPage";
import ProductDetailPage      from "./views/ProductDetailPage";
import CartPage               from "./views/CartPage";
import CheckoutPage           from "./views/CheckoutPage";
import WishlistPage           from "./views/WishlistPage";
import LoginPage              from "./views/LoginPage";
import RegisterPage           from "./views/RegisterPage";
import GoogleAuthCallback     from "./views/GoogleAuthCallback";
import AccountPage            from "./views/AccountPage";
import AccountOrdersPage      from "./views/AccountOrdersPage";
import AccountOrderDetailPage from "./views/AccountOrderDetailPage";
import OrderSuccessPage       from "./views/OrderSuccessPage";
import NotFoundPage           from "./views/NotFoundPage";

// Static Informational Pages
import AboutPage              from "./views/AboutPage";
import ContactPage            from "./views/ContactPage";
import PrivacyPage            from "./views/PrivacyPage";
import TermsPage              from "./views/TermsPage";
import ReturnsPage            from "./views/ReturnsPage";
import ShippingPage           from "./views/ShippingPage";
import FaqPage                from "./views/FaqPage";

// Admin imports
import AdminRoute             from "./components/AdminRoute";
import AdminLayout            from "./views/admin/AdminLayout";
import AdminDashboard         from "./views/admin/AdminDashboard";
import AdminProducts          from "./views/admin/AdminProducts";
import AdminProductForm       from "./views/admin/AdminProductForm";
import AdminCategories        from "./views/admin/AdminCategories";
import AdminOrders            from "./views/admin/AdminOrders";
import AdminCoupons           from "./views/admin/AdminCoupons";
import AdminUsers             from "./views/admin/AdminUsers";
import AdminOrderDetail       from "./views/admin/AdminOrderDetail";
import InvoicePage            from "./views/admin/InvoicePage";

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
          <Route path="/about"                    element={<AboutPage />} />
          <Route path="/contact"                  element={<ContactPage />} />
          <Route path="/privacy"                  element={<PrivacyPage />} />
          <Route path="/terms"                    element={<TermsPage />} />
          <Route path="/return-policy"            element={<ReturnsPage />} />
          <Route path="/shipping-policy"          element={<ShippingPage />} />
          <Route path="/faq"                      element={<FaqPage />} />

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
            <Route path="orders/:id"              element={<AdminOrderDetail />} />
            <Route path="orders/:id/invoice"      element={<InvoicePage />} />
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
