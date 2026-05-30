import React from "react";
import shopLogo from "@/assets/shivam_new_logo.png";
import SEO from "@/components/seo/SEO";

const TermsAndConditions = () => {
  return (
    <>
      <SEO
        title="Terms and Conditions"
        description="Terms and conditions for using Shree Laxmi Shop website and placing orders."
        path="/Termsandconditions"
      />
    <div className="max-w-4xl mx-auto bg-card text-foreground border border-border rounded-lg shadow-md my-10">
      <header
        className="w-full text-3xl font-bold text-center p-4 bg-muted/50 
             [box-shadow:0_4px_6px_-1px_rgba(0,0,0,0.1)]"
      >
        Terms and Conditions
      </header>

      <div className=" relative max-h-[60vh] overflow-y-auto p-6 custom-scrollbar">
        {/* Introduction */}
        <section className="mb-4 ">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            Welcome to <strong>Shree Laxmi Shop</strong>, our online store! Shree Laxmi Shop and its associates provide their services subject to the following terms and conditions. By visiting or shopping on this website, you agree to these terms. Please read them carefully.
          </p>
        </section>

        {/* Privacy */}
        <section className="mb-4  ">
          <h2 className="text-xl font-semibold mb-2 ">2. Privacy</h2>
          <p>
            At <strong>Shree Laxmi Shop</strong>, we respect your privacy and protect your personal information. By using our website, you agree to this policy.
          </p>
        </section>

        {/* Services Provided */}
        <section className="mb-4 ">
          <h2 className="text-xl font-semibold mb-2">3. Services Provided</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>Wide Product Range:</strong> Toys, gifts, stationery, cosmetics, imitation jewellery, pooja samagri, bags, and other daily-use items.
            </li>
            <li>
              <strong>Quality Products:</strong> We source products carefully to offer good quality at affordable prices.
            </li>
            <li>
              <strong>Bulk & Gift Orders:</strong> Bulk purchases and gift orders are welcome. Contact us for availability and special pricing.
            </li>
            <li>
              <strong>Fast Shipping & Delivery:</strong> Multiple shipping options with tracking for eligible orders.
            </li>
            <li>
              <strong>Customer Support:</strong> Email and phone support for product queries, orders, and delivery help.
            </li>
            <li>
              <strong>Secure Payments:</strong> Online payment and cash on delivery (where available). Safe and encrypted payment process.
            </li>
            <li>
              <strong>Pricing and Availability:</strong> Prices are subject to change without notice. Product availability may vary based on stock.
            </li>
            <li>
              <strong>Intellectual Property:</strong> All designs, logos, and content on the website are owned by Shree Laxmi Shop and cannot be copied or used without permission.
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
            <strong>Shree Laxmi Shop</strong> is not liable for indirect, incidental, or consequential damages arising from your use of the service.
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

      <section className="w-full h-36 bg-muted/40 text-center rounded-t-md shadow-md flex flex-col items-center justify-center mt-6">
        <h1 className="text-lg font-bold mb-2">Shree Laxmi Shop</h1>
        <img src={shopLogo} alt="Shree Laxmi Shop Logo" className="h-16 w-16" />
      </section>
    </div>
    </>
  );
};

export default TermsAndConditions;
