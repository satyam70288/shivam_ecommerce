import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { pathname } = useLocation();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const render = children || <Outlet />;  
  // If children passed → use children
  // If used as wrapper → use Outlet

  // ============================
  // ADMIN ROUTES
  // ============================
  if (pathname.startsWith("/admin")) {

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

    if (role !== "admin") return <Navigate to="/" replace />;

    if (role === "admin" && pathname === "/admin/login") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // ============================
  // USER ROUTES
  // ============================
  if (!isAuthenticated && (pathname === "/orders" || pathname === "/account")) {
    return <Navigate to="/login" replace />;
  }

  if (pathname === "/checkout" && cartItems.length === 0) {
    return <Navigate to="/" replace />;
  }

  if (
    isAuthenticated &&
    role === "user" &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    return <Navigate to="/" replace />;
  }

  return render;
};

export default ProtectedRoute;
