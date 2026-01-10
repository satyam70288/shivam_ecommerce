// src/hooks/useCategory.js
import { useState, useEffect } from "react";
import axios from "axios";

export default function useCategory(slug, selectedFilters = {}) {
  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        /** ---------------------------
         *   STEP 1: Create query string
         * ---------------------------*/
        let query = "";

        for (const key in selectedFilters) {
          const value = selectedFilters[key];

          if (Array.isArray(value) && value.length > 0) {
            query += `${query ? "&" : "?"}${key}=${value.join(",")}`;
          }
        }

        /** ---------------------------
         *   STEP 2: Build final URL
         * ---------------------------*/
        const url = `${import.meta.env.VITE_API_URL}/products/by-category/${slug}${query}`;

      

        /** ---------------------------
         *   STEP 3: Call API
         * ---------------------------*/
        const res = await axios.get(url);

        setCategoryName(res.data?.category || "");
        setProducts(res.data?.data || []);
        setTotal(res.data?.total || 0);

      } catch (err) {
        console.error("Category fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug, selectedFilters]); // filters change → refetch

  return { categoryName, products, total, loading, error };
}
