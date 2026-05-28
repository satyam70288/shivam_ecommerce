import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Heart, Sparkles, ShoppingCart } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import LogoutToggle from "./LogoutToggle";
import { useDispatch, useSelector } from "react-redux";
import shopLogo from "../../assets/shivam_latest_logo.png";
import Navigation from "./Navigation";
import SimpleCartDrawer from "../Product/SimpleCartDrawer";
import { fetchWishlist } from "@/redux/slices/wishlistSlice";
import { fetchCart } from "@/redux/slices/cartSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBadgeKey, setCartBadgeKey] = useState(0);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { wishlistStatus } = useSelector((state) => state.wishlist);
  const wishlistCount = Object.values(wishlistStatus).filter(Boolean).length;

  const { summary, loading } = useSelector((state) => state.cart);
  const cartCount = summary?.itemCount || 0;

  const hideNavigation = ["/orders", "/checkout"].includes(location.pathname);
  const isCheckoutPage = location.pathname === "/checkout";

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [isAuthenticated, user?.id, dispatch]);

  useEffect(() => {
    const handleCartUpdate = () => {
      if (isAuthenticated && user?.id) {
        dispatch(fetchCart(user.id));
        setCartBadgeKey((prev) => prev + 1);
      }
    };

    const handleOpenCartDrawer = () => {
      setIsCartOpen(true);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("openCartDrawer", handleOpenCartDrawer);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("openCartDrawer", handleOpenCartDrawer);
    };
  }, [isAuthenticated, user?.id, dispatch]);

  const openCartDrawer = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsCartOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-5 py-2">
          <Link to="/" className="flex items-center group">
            <img
              src={shopLogo}
              alt="Shree Laxmi Shop"
              className="w-30 h-14 sm:w-28 sm:h-12 object-contain transition-all duration-300 group-hover:scale-105"
            />

            <div className="ml-2 hidden sm:block">
              <span className="text-lg font-extrabold brand-gradient-text tracking-tight">
                ShreeLaxmiShop
              </span>

              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles size={8} className="text-primary-foreground" />
                </div>
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Toys • Gifts • Daily Needs
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="hover:scale-105 transition-transform">
              <ModeToggle />
            </div>

            <Link to="/account/wishlist" className="relative group">
              <button
                aria-label="Wishlist"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full nav-icon-btn"
              >
                <Heart
                  size={18}
                  className="transition-colors"
                  strokeWidth={1.5}
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                  fillOpacity="0.2"
                />
              </button>
              {wishlistCount > 0 && (
                <div
                  key={`wishlist-${wishlistCount}`}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-md ring-1 ring-background z-10"
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </div>
              )}
            </Link>

            <div className="relative group">
              <button
                onClick={openCartDrawer}
                disabled={isCheckoutPage || loading}
                aria-label="Open cart"
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all duration-200 relative ${
                  isCheckoutPage
                    ? "bg-muted cursor-not-allowed opacity-60"
                    : "nav-icon-btn"
                } ${loading ? "opacity-70 cursor-wait" : ""}`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart size={18} strokeWidth={1.5} />
                )}
              </button>

              {cartCount > 0 && !isCheckoutPage && (
                <div
                  key={`cart-badge-${cartBadgeKey}`}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-md ring-1 ring-background z-10"
                >
                  {cartCount}
                </div>
              )}
            </div>

            <div className="relative group">
              {isAuthenticated ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full nav-icon-btn">
                  <LogoutToggle user={user} iconSize={18} />
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full ring-1 ring-background" />
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  aria-label="Login"
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full nav-icon-btn"
                >
                  <User size={18} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />
      </nav>

      {!hideNavigation && <Navigation />}

      <SimpleCartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};

export default Navbar;
