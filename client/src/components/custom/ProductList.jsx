import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import Pagination from "../Pagination";
import { useDispatch } from "react-redux";
import { setProducts as setReduxProducts } from "@/redux/slices/productSlice"; // FIXED

const ProductList = ({ category, price, search }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const limit = 12; // test purpose

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/get-products`,
        {
          params: {
            page,
            limit,
            category: category !== "All" ? category : "",
            price: price || "",
            search: search || "",
          },
        }
      );

      const { data, pagination } = res.data;

      // Set frontend products
      setProducts(Array.isArray(data) ? data : []);

      // Update Redux (if needed)
      dispatch(setReduxProducts(data));

      // FIX: Always calculate correct total pages
      const total = pagination?.totalProducts || 0;
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, price, search]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto grid gap-5 grid-cols-[repeat(auto-fill,minmax(160px,1fr))] px-4 py-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border shadow rounded-xl p-3 animate-pulse">
            <div className="bg-gray-300 h-32 rounded mb-4" />
            <div className="h-4 bg-gray-300 w-3/4 mb-2 rounded" />
            <div className="h-3 bg-gray-200 w-1/2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>

      {products.length > 0 && (
        <div className="max-w-7xl mx-auto grid gap-5 grid-cols-[repeat(auto-fill,minmax(170px,1fr))] px-4 py-10">
          {products.map((p) => (
            <ProductCard key={p._id} {...p} />
          ))}
        </div>
      )}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

    </>
  );
};

export default ProductList;
