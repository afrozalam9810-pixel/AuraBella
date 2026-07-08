import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Check if authenticated and is admin
  if (!isAuthenticated || user?.role !== "admin") {
    // Redirect to login or account page
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  return children;
}
