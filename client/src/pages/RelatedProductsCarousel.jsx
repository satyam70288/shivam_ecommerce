import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ProductCard from "@/components/custom/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const RelatedProductsCarousel = ({ productId, category }) => {
  const { products } = useSelector((state) => state.product);
  const [related, setRelated] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!products?.length || !productId || !category) {
      setRelated([]);
      return;
    }

    const getCategoryId = (cat) => {
      if (!cat) return null;
      if (typeof cat === "string") return cat;
      if (typeof cat === "object") return cat._id || cat.id;
      return null;
    };

    const categoryId = getCategoryId(category);

    const filtered = products
      .filter((p) => {
        if (!p || p._id === productId) return false;

        const productCategoryId = getCategoryId(p.category);
        return productCategoryId && productCategoryId === categoryId;
      })
      .slice(0, 8);

    setRelated(filtered);
  }, [products, category, productId]);

  // ✅ Correct UX: hide section if nothing relevant
  if (!related.length) return null;

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const offset = scrollRef.current.clientWidth * 0.8;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            You may also like
          </h2>

          <div className="hidden md:flex gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="
                p-2 rounded-full border
                border-gray-300 bg-white hover:bg-gray-100
                dark:border-white/20 dark:bg-black dark:hover:bg-white/10
                transition
              "
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              className="
                p-2 rounded-full border
                border-gray-300 bg-white hover:bg-gray-100
                dark:border-white/20 dark:bg-black dark:hover:bg-white/10
                transition
              "
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* CAROUSEL */}
        <div
          ref={scrollRef}
          className="
            flex gap-4
            overflow-x-auto
            scroll-smooth
            snap-x snap-mandatory
            pb-3
          "
        >
          {related.map((item) => (
            <div
              key={item._id}
              className="
                min-w-[70%]
                sm:min-w-[45%]
                md:min-w-[30%]
                lg:min-w-[22%]
                snap-start
              "
            >
              <ProductCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProductsCarousel;
