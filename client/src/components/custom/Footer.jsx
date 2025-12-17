import React from "react";
import { Facebook, Instagram, Youtube, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* SHOP INFO */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Shree Laxmi Shop
          </h3>

          <p className="text-sm mb-4">
            Shree Laxmi Shop is a trusted multi-category retail store offering
            toys, gifts, stationery, cosmetics, imitation jewellery, pooja
            samagri, bags, and many daily-use products at affordable prices.
          </p>

          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-5 h-5 mt-1 shrink-0" />
            <span>
              Parshv Elite Building No.1, Birwadi Road, Near Railway Phatak,
              Umroli East, Umroli, Palghar, Maharashtra - 401404
            </span>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/faq" className="hover:underline">FAQs</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li>
              <Link to="/Termsandconditions" className="hover:underline">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* CATEGORIES */}
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Shop Categories
          </h4>
          <ul className="space-y-2 text-sm">
            <li>Toys</li>
            <li>Gifts & Accessories</li>
            <li>Stationery</li>
            <li>Cosmetics & Personal Care</li>
            <li>Imitation Jewellery</li>
            <li>Pooja Samagri</li>
            <li>Bags & Travel Items</li>
          </ul>
        </div>

        {/* CONTACT & SOCIAL */}
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Contact Us
          </h4>

          <div className="flex items-center gap-2 text-sm mb-4">
            <Mail size={16} />
            <a
              href="mailto:support@shreelaxmishop.com"
              className="hover:underline"
            >
              support@shreelaxmishop.com
            </a>
          </div>

          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=61578870116136"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>

            <a
              href="https://youtube.com/@uniqueswagfashion"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>

            <a
              href="https://www.instagram.com/swag_fashion.07/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm">
        © {new Date().getFullYear()} Shree Laxmi Shop. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
