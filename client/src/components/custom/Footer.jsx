import React from "react";
import { Facebook, Instagram, Youtube, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-gray-900 text-gray-700 dark:text-neutral-50 py-10 mt-12 font-bold  ">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Swag Fashion
          </h3>
           <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <MapPin className="w-16 h-6" /> {/* Address icon */}
            Parshv Elite Building No.1, Birwadi Road, Near Railway Phatak, Umroli East, Umroli, Palghar, Maharashtra - 401404
          </p>
        </div>
        {/* Navigation */}

        <div>
          <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Explore
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:underline">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        {/* Services */}
        <div>
          <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Services
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/contact" className="hover:underline">
                Print on Demand
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Bulk Orders
              </Link>
            </li>
            <li>
  <Link to="/Termsandconditions" className="hover:underline">
    Terms & Conditions
  </Link>
</li>

          </ul>
        </div>
        {/* Contact & Social */}
        <div>
          <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Connect Us
          </h4>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2">
              <Mail size={16} />
              <a
                href="https://mail.google.com/mail/"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                swagfashion077@gmail.com
              </a>
            </li>
          </ul>
          <div className="flex gap-4 mt-2">
            <a
              href="https://www.facebook.com/profile.php?id=61578870116136&mibextid=ZbWKwL"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://youtube.com/@uniqueswagfashion?si=U9ikibPt0kcq_sXE"
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Youtube size={20} />
            </a>
            <a
              href="https://www.instagram.com/swag_fashion.07/profilecard/?igsh=cTV3ODZxZHhpYndi"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className=""></div>
    </footer>
  );
};

export default Footer;
