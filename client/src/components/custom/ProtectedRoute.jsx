import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { pathname, search } = location;

  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const params = new URLSearchParams(search);
  const isBuyNow = Boolean(params.get("productId"));

  const render = children || <Outlet />;

  // ============================
  // ADMIN ROUTES
  // ============================
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
    if (role !== "admin") return <Navigate to="/" replace />;
  }

  // ============================
  // USER ROUTES
  // ============================
  if (!isAuthenticated && (pathname === "/orders" || pathname === "/account")) {
    return <Navigate to="/login" replace />;
  }

  // 🟢 FIX: allow buy-now checkout
  if (
    pathname === "/checkout" &&
    cartItems.length === 0 &&
    !isBuyNow
  ) {
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
