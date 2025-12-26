import React from "react";
import { Link } from "react-router-dom";
import swagiconDark from "@/assets/shivam_new_logo.png";
const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto  bg-white dark:bg-black text-gray-900 dark:text-neutral-50 rounded-lg shadow-md my-10 ">
      <header
        className="w-full text-3xl font-bold text-center p-4 bg-white dark:bg-gray-900 
             [box-shadow:0_4px_6px_-1px_rgba(0,0,0,0.1)]"
      >
        Terms and Conditions
      </header>

      <div className=" relative max-h-[60vh] overflow-y-auto p-6 custom-scrollbar">
        {/* Introduction */}
        <section className="mb-4 ">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            Welcome to <strong>www.swagfashion.in</strong>, our online store! Swag Fashion and its associates provide their services subject to the following terms and conditions. By visiting or shopping on this website, you agree to these terms. Please read them carefully.
          </p>
        </section>

        {/* Privacy */}
        <section className="mb-4  ">
          <h2 className="text-xl font-semibold mb-2 ">2. Privacy</h2>
          <p>
            At <strong>Swag Fashion</strong>, we respect your privacy and protect your personal information. By using our website, you agree to this policy.
          </p>
        </section>

        {/* Services Provided */}
        <section className="mb-4 ">
          <h2 className="text-xl font-semibold mb-2">3. Services Provided</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>Easy Exchanges:</strong> You can exchange products, but returns are not accepted. Size or quality issues are handled quickly.
            </li>
            <li>
              <strong>Wide Range of Styles & Sizes:</strong> T-shirts for men, women, and kids (fits: slim, regular, oversized). Available in sizes S, M, L, XL, XXL, etc.
            </li>
            <li>
              <strong>Premium Quality Materials:</strong> Soft, durable, and comfortable fabrics. Eco-friendly or organic cotton options.
            </li>
            <li>
              <strong>Bulk Orders & Corporate Orders:</strong> Discounts available for bulk purchases. Custom designs for events, teams, or companies.
            </li>
            <li>
              <strong>Fast Shipping & Delivery:</strong> Multiple shipping options with tracking for all orders.
            </li>
            <li>
              <strong>Customer Support:</strong> Live chat, email, and phone support. Assistance with sizing, design, or order queries.
            </li>
            <li>
              <strong>Secure Payments:</strong> Multiple payment options: cards, online wallets, and COD. Safe and encrypted payment process.
            </li>
            <li>
              <strong>Pricing and Availability:</strong> Prices are subject to change without notice. Product availability may vary based on stock.
            </li>
            <li>
              <strong>Intellectual Property:</strong> All designs, logos, and content on the website are owned by Swag Fashion and cannot be copied or used without permission.
            </li>
          </ul>
        </section>

        {/* User Responsibilities */}
        <section className="mb-4">
          <h2 className="text-xl font-semibold mb-2">4. User Responsibilities</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>You must provide accurate information.</li>
            <li>You agree not to misuse the platform or engage in illegal activity.</li>
            <li>You’re responsible for maintaining the confidentiality of your account.</li>
          </ul>
        </section>

        {/* Payments and Billing */}
        <section className="mb-4">
          <h2 className="text-xl font-semibold mb-2">5. Payments and Billing</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>All fees are listed clearly before purchase.</li>
            <li>Payments must be made through approved methods.</li>
            <li>No refunds unless stated in our Refund Policy.</li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-4">
          <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
          <p>
            <strong>Swag Fashion</strong> is not liable for indirect, incidental, or consequential damages arising from your use of the service.
          </p>
        </section>

        {/* Termination */}
        <section className="mb-4">
          <h2 className="text-xl font-semibold mb-2">7. Termination</h2>
          <p>We may suspend or terminate your access if you violate these Terms.</p>
        </section>

        {/* Governing Law */}
        <section className="mb-4">
          <h2 className="text-xl font-semibold mb-2">8. Governing Law</h2>
          <p>These Terms are governed by the laws of <strong>India</strong>.</p>
        </section>

        {/* Changes to Terms */}
        <section className="mb-4">
          <h2 className="text-xl font-semibold mb-2">9. Changes to Terms</h2>
          <p>We reserve the right to update these Terms at any time. Changes will be posted on the website or communicated via email.</p>
        </section>






      </div>
      <section className="w-full h-36 bg-white dark:bg-gray-800 text-center rounded-t-md shadow-md flex flex-col items-center justify-center mt-6">
    <h1 className="text-lg font-bold mb-2">Swag Fashion</h1>
    <img src={swagiconDark} alt="Swag Icon" className="h-16 w-16" />
  </section>





    </div>
  );
};

export default TermsAndConditions;
