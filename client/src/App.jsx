/**
 * App.jsx
 * Root application component.
 * Defines the full route tree with Navbar + Footer shared layout.
 */

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { useIsMobile } from "./hooks/useIsMobile";

const MobileHeader = lazy(() => import("./components/mobile/MobileHeader"));
const MobileBottomNavigation = lazy(() => import("./components/mobile/MobileBottomNavigation"));

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

import AdminRoute             from "./components/AdminRoute";
// Admin pages are loaded only for an admin route. This keeps the storefront
// bundle from downloading dashboard and invoice code before it is needed.
const AdminLayout = lazy(() => import("./views/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./views/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./views/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./views/admin/AdminProductForm"));
const AdminCategories = lazy(() => import("./views/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./views/admin/AdminOrders"));
const AdminCoupons = lazy(() => import("./views/admin/AdminCoupons"));
const AdminUsers = lazy(() => import("./views/admin/AdminUsers"));
const AdminOrderDetail = lazy(() => import("./views/admin/AdminOrderDetail"));
const InvoicePage = lazy(() => import("./views/admin/InvoicePage"));

// General components
import Toast                  from "./components/Toast";

function App() {
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col min-h-screen bg-dark-900 ${isMobile ? "pb-16" : ""}`}>
      {isMobile ? (
        <Suspense fallback={null}>
          <MobileHeader />
        </Suspense>
      ) : (
        <Navbar />
      )}
      <Toast />

      {/* Main content grows to fill remaining viewport height */}
      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
            </div>
          }
        >
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
        </Suspense>
      </main>

      {isMobile ? (
        <Suspense fallback={null}>
          <MobileBottomNavigation />
        </Suspense>
      ) : (
        <Footer />
      )}
    </div>
  );
}

export default App;
