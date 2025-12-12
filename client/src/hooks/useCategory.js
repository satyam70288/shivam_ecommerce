// src/hooks/useCategory.js
import { useState, useEffect } from "react";
import axios from "axios";

export default function useCategory(slug) {
  const [categoryName, setCategoryName] = useState("");     // "Toys"
  const [products, setProducts] = useState([]);              // product list
  const [total, setTotal] = useState(0);                     // total count
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
         setError(null); // ← IMPORTANT: reset previous error
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/by-category/${slug}`
        );

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
  }, [slug]);

  return { categoryName, products, total, loading, error };
}
