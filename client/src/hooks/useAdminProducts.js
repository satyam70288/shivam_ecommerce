import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setProducts } from "@/redux/slices/productSlice";

export const useAdminProducts = () => {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [price, setPrice] = useState("");
  console.log(category,"cate")
  const dispatch = useDispatch();

  const fetchProducts = async () => {
    let params = [];

    if (category !== "all") params.push(`category=${category}`);
    if (searchTerm) params.push(`search=${searchTerm}`);
    if (price) params.push(`price=${price}`);

    params.push(`page=${page}`);
    params.push(`limit=9`);

    const url = `${import.meta.env.VITE_API_URL}/get-products-admin?${params.join("&")}`;

    const res = await axios.get(url);

    if (res.data.success) {
      dispatch(setProducts(res.data.data));
      setTotalPages(res.data.pagination.totalPages);
    } else {
      dispatch(setProducts([]));
    }
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
    setCategories(res.data.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, category, searchTerm, price]);

  return {
    categories,
    page,
    setPage,
    totalPages,
    category,
    setCategory,
    searchTerm,
    setSearchTerm,
    price,
    setPrice,
  };
};
