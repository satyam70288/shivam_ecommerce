import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const useProductDetails = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [promise, setPromise] = useState([]);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setProduct(null);
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/product/${productId}`
        );

        if (cancelled) return;

        const data = res.data.data;
        setProduct(data);
        setPromise(res.data.promises || []);

        setSelectedImage(0);
      } catch (err) {
        if (!cancelled) {
          console.error("Product fetch error:", err);
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images || product.allImages || [];
  }, [product]);

  const isOfferActive =
    product?.discount > 0 &&
    product?.offerValidTill &&
    new Date(product.offerValidTill) >= new Date();

  const displayPrice = isOfferActive
    ? product?.discountedPrice
    : product?.price;

  return {
    product,
    loading,
    quantity,
    setQuantity,
    selectedImage,
    setSelectedImage,
    images,
    isOfferActive,
    displayPrice,
    promise,
  };
};

export default useProductDetails;
