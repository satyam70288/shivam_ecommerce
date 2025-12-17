import React, { useState, useEffect } from "react";

const AboutPage = () => {
  // Online placeholder images (replace later anytime)
  const images = [
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    "https://images.unsplash.com/photo-1580910051074-7e4c4f4c1f86",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* HERO */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Shree Laxmi Shop is a trusted multi-category retail store offering
          quality products at affordable prices. We focus on customer
          satisfaction, fair pricing, and reliable service.
        </p>
      </div>

      {/* WHO WE ARE */}
      <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
        <img
          src={images[currentIndex]}
          alt="Shree Laxmi Shop"
          className="w-full h-[350px] object-cover rounded-lg shadow-md transition-all duration-700"
        />

        <div>
          <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Shree Laxmi Shop is a local retail store providing a wide variety of
            products such as toys, gifts, stationery, cosmetics, imitation
            jewellery, pooja samagri, bags, and daily-use items.
            <br /><br />
            Our goal is simple — give customers good products, honest prices,
            and a smooth shopping experience both online and offline.
          </p>
        </div>
      </div>

      {/* HOW WE WORK */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8">
          How We Serve Our Customers
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Wide Product Range</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Multiple categories under one roof to meet everyday and special
              needs.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Quality Check</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Products are checked before sale to maintain quality standards.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Fair Pricing</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Transparent pricing with no hidden charges.
            </p>
          </div>

          <div className="md:col-span-3 flex justify-center gap-8 mt-4">
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow w-full md:w-1/3">
              <h3 className="text-xl font-bold mb-2">Customer Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Help available for product queries and bulk orders.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow w-full md:w-1/3">
              <h3 className="text-xl font-bold mb-2">Reliable Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Safe and timely delivery to ensure customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
