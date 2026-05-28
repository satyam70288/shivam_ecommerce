import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";

/** Map UI filter state → API query string */
export function buildFilterQuery(selectedFilters) {
  const params = new URLSearchParams();

  if (selectedFilters.priceRange?.length) {
    params.set("priceRange", selectedFilters.priceRange.join(","));
  }

  if (selectedFilters.discount?.length) {
    params.set("discount", selectedFilters.discount.join(","));
  }

  if (selectedFilters.ratings?.length) {
    params.set("rating", selectedFilters.ratings.join(","));
  }

  if (selectedFilters.colors?.length) {
    params.set("color", selectedFilters.colors.join(","));
  }

  if (selectedFilters.ageGroup?.length) {
    params.set("ageGroup", selectedFilters.ageGroup.join(","));
  }

  if (selectedFilters.material?.length) {
    params.set("material", selectedFilters.material.join(","));
  }

  if (selectedFilters.availability?.length) {
    const mapped = selectedFilters.availability.map((v) =>
      v === "in" ? "In Stock" : v === "out" ? "Out of Stock" : v
    );
    params.set("availability", mapped.join(","));
  }

  if (selectedFilters.offers?.length) {
    params.set("offers", selectedFilters.offers.join(","));
  }

  if (selectedFilters.badges?.length) {
    params.set("badges", selectedFilters.badges.join(","));
  }

  if (selectedFilters.sort && selectedFilters.sort !== "newest") {
    params.set("sort", selectedFilters.sort);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
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
