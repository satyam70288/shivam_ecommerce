// ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { pathname, search } = location;

  const { isAuthenticated, role } = useSelector((state) => state.auth);
  
  // ✅ CORRECT: 'items' access करें, 'cartItems' नहीं
  const { items = [] } = useSelector((state) => state.cart); // 'items' है slice में

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
  if (
    !isAuthenticated &&
    (pathname === "/orders" ||
      pathname.startsWith("/orders/") ||
      pathname === "/account" ||
      pathname.startsWith("/account/"))
  ) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🟢 FIXED: 'items' use करें
  if (
    pathname === "/checkout" &&
    items.length === 0 &&  // ✅ अब 'items' है
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