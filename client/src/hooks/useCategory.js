import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";

function buildFilterQuery(selectedFilters) {
  let query = "";
  for (const key in selectedFilters) {
    const value = selectedFilters[key];
    if (Array.isArray(value) && value.length > 0) {
      query += `${query ? "&" : "?"}${key}=${value.join(",")}`;
    }
  }
  return query;
}

export default function useCategory(slug, selectedFilters = {}) {
  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevSlugRef = useRef(slug);

  const filterKey = useMemo(
    () => JSON.stringify(selectedFilters),
    [selectedFilters]
  );

  useEffect(() => {
    if (!slug) return;

    if (prevSlugRef.current !== slug) {
      setProducts([]);
      prevSlugRef.current = slug;
    }

    let cancelled = false;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = buildFilterQuery(selectedFilters);
        const url = `${import.meta.env.VITE_API_URL}/products/by-category/${slug}${query}`;
        const res = await axios.get(url);

        if (cancelled) return;

        setCategoryName(res.data?.category || "");
        setProducts(res.data?.data || []);
        setTotal(res.data?.total || 0);
      } catch (err) {
        if (!cancelled) {
          console.error("Category fetch error:", err);
          setError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCategory();

    return () => {
      cancelled = true;
    };
  }, [slug, filterKey]);

  return { categoryName, products, total, loading, error };
}
