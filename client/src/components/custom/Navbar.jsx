// Navbar.jsx में
import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Heart, Sparkles } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import CartDrawer from "./CartDrawer";
import LogoutToggle from "./LogoutToggle";
import { useDispatch, useSelector } from "react-redux";
import swagiconDark from "../../assets/shivam_latest_logo.png";
import { setCart } from "@/redux/slices/cartSlice";
import axios from "axios";
import Navigation from "./Navigation";
import SimpleCartDrawer from "../Product/SimpleCartDrawer";
import { fetchWishlist } from "@/redux/slices/wishlistSlice";
import { fetchCartThunk } from "@/redux/thunks/cartThunk";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { wishlistStatus } = useSelector((state) => state.wishlist);
  const wishlistCount = Object.values(wishlistStatus).filter(Boolean).length;

  const { items, summary, loading } = useSelector((state) => state.cart);

  const cartCount = summary?.itemCount || 0;

  const hideNavigation = ["/orders", "/checkout"].includes(location.pathname);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchCartThunk(user.id));
    }
  }, [isAuthenticated, user?.id, dispatch]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-5 py-2">
          {/* LOGO */}
  <Link to="/" className="flex items-center group">
  <div className="relative group">
    <img
      src={swagiconDark}
      alt="Logo"
      className="w-30 h-14 sm:w-28 sm:h-12 object-contain 
        transition-all duration-300 
        group-hover:scale-105
        filter contrast-150 brightness-75" // Bas yeh line add karein
    />
  </div>

  <div className="ml-2 hidden sm:block">
  {/* Logo Text with Glow Effect */}
  <div className="relative inline-block">
    <span className="
      text-lg font-extrabold 
      bg-gradient-to-r 
      from-purple-600 via-pink-500 to-rose-500
      dark:from-purple-400 dark:via-pink-400 dark:to-rose-400
      bg-clip-text text-transparent
      tracking-tight
      relative z-10
    ">
      ShreeLaxmiShop
    </span>
    
    {/* Glow effect */}
    <div className="
      absolute -inset-1 -z-10
      bg-gradient-to-r 
      from-purple-500/30 via-pink-500/20 to-rose-500/30
      blur-lg opacity-70
      dark:from-purple-400/40 dark:via-pink-400/30 dark:to-rose-400/40
    "></div>
  </div>

  {/* Tagline */}
  <div className="flex items-center gap-1.5 mt-1.5">
    <div className="
      w-3 h-3 rounded-full
      bg-gradient-to-br from-amber-400 to-yellow-500
      dark:from-yellow-300 dark:to-amber-400
      flex items-center justify-center
    ">
      <Sparkles size={8} className="text-white dark:text-amber-800" />
    </div>
    
    <span className="
      text-xs font-medium tracking-wider
      text-gray-700 dark:text-gray-200
      uppercase
      opacity-90
    ">
      Premium Fashion
    </span>
  </div>
</div>
</Link>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Theme Toggle */}
            <div className="hover:scale-105 transition-transform">
              <ModeToggle />
            </div>

            {/* Wishlist */}
            <Link to="/account/wishlist">
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default button behavior
                    navigate("/account/wishlist");
                  }}
                  aria-label="Wishlist"
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-800/30 dark:hover:to-rose-800/30 border border-pink-100 dark:border-pink-800/30 hover:shadow-sm transition-all duration-200"
                >
                  <Heart
                    size={18}
                    className="text-pink-500 dark:text-pink-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors"
                    strokeWidth={1.5}
                    fill="currentColor"
                    fillOpacity="0.2"
                  />
                </button>
                {wishlistCount > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full shadow-md shadow-pink-500/40 ring-1 ring-white dark:ring-gray-900 z-10">
                    {wishlistCount}
                  </div>
                )}
              </div>
            </Link>

            {/* Cart */}
            <div className="relative group">
              <button
                onClick={() => {
                  const cartBtn = document.querySelector(
                    '[aria-label="Open cart"]'
                  );
                  if (cartBtn) cartBtn.click();
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 border border-emerald-100 dark:border-emerald-800/30 hover:shadow-sm transition-all duration-200"
              >
                <SimpleCartDrawer iconSize={18} />
              </button>

              {/* Cart Badge - Debug version */}
              {cartCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 text-white text-[10px] font-bold rounded-full shadow-md ring-1 ring-white dark:ring-gray-900 z-10">
                  {cartCount}
                </div>
              )}
            </div>

            {/* Account */}
            <div className="relative group">
              {isAuthenticated ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 border border-blue-100 dark:border-blue-800/30 hover:shadow-sm transition-all duration-200">
                  <LogoutToggle user={user} iconSize={18} />
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full ring-1 ring-white dark:ring-gray-900"></div>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  aria-label="Login"
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 border border-blue-100 dark:border-blue-800/30 hover:shadow-sm transition-all duration-200"
                >
                  <User
                    size={18}
                    className="text-blue-500 dark:text-blue-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors"
                    strokeWidth={1.5}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-700 to-transparent"></div>
      </nav>

      {!hideNavigation && <Navigation />}
    </>
  );
};

export default Navbar;
