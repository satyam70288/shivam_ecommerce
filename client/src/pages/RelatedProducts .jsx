import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ProductCard from "@/components/custom/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const RelatedProductsCarousel = ({ productId, category }) => {
  const { products } = useSelector((state) => state.product);
  const [related, setRelated] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!products?.length) return;

    const filtered = products
      .filter(p => p.category === category && p._id !== productId)
      .slice(0, 8);

    setRelated(filtered);
  }, [products, category, productId]);

  if (related.length === 0) return null;

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
      {/* ✅ OUTER CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">You may also like</h2>

          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="
                p-2 rounded-full border
                bg-background hover:bg-muted
                transition
              "
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="
                p-2 rounded-full border
                bg-background hover:bg-muted
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
            scrollbar-none
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
