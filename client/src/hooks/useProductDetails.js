import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const useProductDetails = (productId) => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [promise,setPromise]=useState([])

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
  if (!productId) return;

  const fetchProduct = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/product/${productId}`
    );

    const data = res.data.data;
    setProduct(data);
    setPromise(res.data.promises)

    if (data.colors?.length) setColor(data.colors[0]);
    if (data.sizes?.length) setSize(data.sizes[0]);
  };

  fetchProduct();
}, [productId]);


  /* ================= DERIVED FLAGS ================= */
  const isVariant = product?.productType === "variant";

  const hasColors = useMemo(
    () => Array.isArray(product?.colors) && product.colors.length > 0,
    [product]
  );

  const hasSizes = useMemo(
    () => Array.isArray(product?.sizes) && product.sizes.length > 0,
    [product]
  );

  const images = useMemo(() => {
    if (!product) return [];
    if (isVariant) {
      return (
        product.variants?.find((v) => v.color === color)?.images || []
      );
    }
    return product.images || [];
  }, [product, isVariant, color]);

  useEffect(() => {
    setSelectedImage(0);
  }, [color]);

  /* ================= PRICE ================= */
  const isOfferActive =
    product?.discount > 0 &&
    product?.offerValidTill &&
    new Date(product.offerValidTill) >= new Date();

  const displayPrice = isOfferActive
    ? product?.discountedPrice
    : product?.price;

  /* ================= VALIDATION ================= */
  const validateSelection = () => {
    if ((hasColors || isVariant) && !color) return false;
    if (hasSizes && !size) return false;
    return true;
  };

  return {
    product,
    quantity,
    setQuantity,
    selectedImage,
    setSelectedImage,
    color,
    setColor,
    size,
    setSize,
    images,
    isVariant,
    hasColors,
    hasSizes,
    isOfferActive,
    displayPrice,
    validateSelection,
    promise

  };
};

export default useProductDetails;
