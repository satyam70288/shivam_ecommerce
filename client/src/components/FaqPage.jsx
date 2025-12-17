import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What products are available at Shree Laxmi Shop?",
    answer:
      "We sell a wide range of products including toys, gifts, stationery, cosmetics, imitation jewellery, pooja samagri, bags, and other daily-use items.",
  },
  {
    question: "Do you sell original and good quality products?",
    answer:
      "Yes. We carefully source our products to ensure good quality at affordable prices. Customer satisfaction is our top priority.",
  },
  {
    question: "Can I place bulk or gift orders?",
    answer:
      "Yes, bulk orders and gift purchases are available. Please contact us directly for bulk pricing and availability.",
  },
  {
    question: "Do you offer home delivery?",
    answer:
      "Delivery availability depends on your location. Please contact us or check during checkout for delivery options.",
  },
  {
    question: "Are prices fixed or negotiable?",
    answer:
      "Most prices are fixed to offer fair pricing to all customers. However, bulk purchases may be eligible for special discounts.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can reach us via the Contact page or email us at support@shreelaxmishop.com. We will respond as soon as possible.",
  },
];

const FaqPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-zinc-900 dark:text-zinc-100">
        Frequently Asked Questions
      </h1>

      <div className="space-y-5">
        {faqs.map((faq, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={index}
              className="border rounded-xl bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm"
            >
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-semibold text-zinc-800 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                onClick={() => toggle(index)}
              >
                {faq.question}
                <span
                  className={`transition-transform duration-200 ${
                    isActive ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={20} />
                </span>
              </button>

              <div
                className={`px-6 overflow-hidden transition-all duration-300 text-zinc-600 dark:text-zinc-300 ${
                  isActive ? "max-h-40 pb-4" : "max-h-0"
                }`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FaqPage;
