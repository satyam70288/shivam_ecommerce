import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Menu, X, User } from "lucide-react";
import { useSelector } from "react-redux";

import Search from "../custom/Search";
import CartDrawer from "./CartDrawer";
import LogoutToggle from "./LogoutToggle";
import { ModeToggle } from "./ModeToggle";

import logo from "../../assets/shivam_logo.png";
import Navigation from "./Navigation";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);

  return (
   <>
    <header className="w-full sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b">
      {/* TOP STRIP */}
      <div className="hidden sm:block text-xs bg-gray-900 text-white py-2">
        <div className="max-w-7xl mx-auto flex justify-between px-4">
          <p>Get up to 50% off new season styles</p>
          <div className="flex gap-4 text-gray-300">
            <Link to="#">Help</Link>
            <Link to="#">Track Order</Link>
          </div>
        </div>
      </div>

      {/* MAIN BAR */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button className="sm:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </button>

          <img
            src={logo}
            className="h-12 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        {/* SEARCH */}
        <div className="hidden md:block flex-1 max-w-xl">
          <Search />
        </div>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-4">
          <ModeToggle />

          <Heart className="hover:scale-110 cursor-pointer" />

          <CartDrawer />

          {isAuthenticated ? (
            <LogoutToggle user={user} />
          ) : (
            <Link to="/login">
              <User className="hover:scale-110" />
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div className="w-64 h-full bg-white dark:bg-zinc-900 p-6">
            <X
              className="mb-6 cursor-pointer"
              onClick={() => setOpen(false)}
            />

            <Search />

            <div className="mt-6 flex flex-col gap-4">
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
            </div>
          </div>
        </div>
      )}
    </header>
    <Navigation/>
   </>
  );
};

export default Header;
