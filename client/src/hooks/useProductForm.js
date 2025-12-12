import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useErrorLogout from "@/hooks/use-error-logout";
import { useToast } from "@/hooks/use-toast";

const MAX_GENERAL_IMAGES = 8;
const MAX_VARIANT_IMAGES = 8;

export const useProductForm = (productId) => {
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();

  // STATES
  const [isLoading, setIsLoading] = useState(false);
  const [productType, setProductType] = useState("simple");
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // === SIMPLE PRODUCT ===
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const generalInputRef = useRef(null);

  // === VARIANT PRODUCT ===
  const [variants, setVariants] = useState([]);
  const variantFileRefs = useRef({});

  // === OFFER FIELDS ===
  const [discount, setDiscount] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerValidFrom, setOfferValidFrom] = useState("");
  const [offerValidTill, setOfferValidTill] = useState("");

  /* ------------------------------------------------------
     1. LOAD CATEGORIES
  ------------------------------------------------------*/
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/categories`)
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  /* ------------------------------------------------------
     2. LOAD PRODUCT (EDIT MODE)
  ------------------------------------------------------*/
  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      try {
        setIsLoading(true);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/product/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const p = res.data.data;

        setProductType(p.productType || "simple");
        setName(p.name || "");
        setDescription(p.description || "");
        setCategoryId(p.category?._id || p.category || "");

        // SIMPLE
        setPrice(p.price ?? "");
        setStock(p.stock ?? "");

        setImages(
          (p.images || []).map((img) => ({
            file: null,
            preview: img.url,
          }))
        );

        // VARIANTS
        setVariants(
          (p.variants || []).map((v) => ({
            color: v.color,
            size: v.size,
            price: v.price,
            stock: v.stock,
            images: (v.images || []).map((i) => ({
              file: null,
              preview: i.url,
            })),
          }))
        );

        // OFFER
        setDiscount(p.discount ?? "");
        setOfferTitle(p.offerTitle || "");
        setOfferDescription(p.offerDescription || "");
        setOfferValidFrom(p.offerValidFrom?.split("T")[0] || "");
        setOfferValidTill(p.offerValidTill?.split("T")[0] || "");
      } catch (err) {
        handleErrorLogout(err, "Error loading product");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  /* ------------------------------------------------------
     3. IMAGE HANDLERS (GENERAL)
  ------------------------------------------------------*/
  const handleGeneralImages = (e) => {
    const files = [...e.target.files];
    const add = files.slice(0, MAX_GENERAL_IMAGES - images.length);

    setImages((prev) => [
      ...prev,
      ...add.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
    ]);

    e.target.value = "";
  };

  const removeGeneralImage = (i) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  /* ------------------------------------------------------
     4. VARIANT HANDLERS
  ------------------------------------------------------*/
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { color: "", size: "", price: "", stock: "", images: [] },
    ]);
  };

  const removeVariant = (i) =>
    setVariants((prev) => prev.filter((_, idx) => idx !== i));

  const updateVariant = (i, key, value) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [key]: value } : v))
    );
  };

  const handleVariantImages = (i) => (e) => {
    const files = [...e.target.files];
    const add = files.slice(
      0,
      MAX_VARIANT_IMAGES - (variants[i].images?.length || 0)
    );

    const mapped = add.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));

    setVariants((prev) =>
      prev.map((v, idx) =>
        idx === i ? { ...v, images: [...v.images, ...mapped] } : v
      )
    );

    e.target.value = "";
  };

  const removeVariantImage = (i, imgIdx) => {
    setVariants((prev) =>
      prev.map((v, idx) =>
        idx === i
          ? { ...v, images: v.images.filter((_, k) => k !== imgIdx) }
          : v
      )
    );
  };

  /* ------------------------------------------------------
     5. VALIDATION
  ------------------------------------------------------*/
  const validate = () => {
    if (!name.trim()) return "Enter product name";
    if (!description.trim()) return "Enter description";
    if (!categoryId) return "Select category";

    if (productType === "simple") {
      if (!price) return "Enter price";
      if (!stock) return "Enter stock";
      if (!images.length) return "Upload at least 1 image";
    }

    if (productType === "variant") {
      if (!variants.length) return "Add at least one variant";

      for (let i = 0; i < variants.length; i++) {
        if (!variants[i].price) return `Variant ${i + 1}: price required`;
        if (!variants[i].stock) return `Variant ${i + 1}: stock required`;
        if (!variants[i].images.length)
          return `Variant ${i + 1}: upload at least 1 image`;
      }
    }

    if (offerValidFrom && offerValidTill && offerValidFrom > offerValidTill) {
      return "Offer start date cannot be after end date";
    }

    return null;
  };

  /* ------------------------------------------------------
     6. SUBMIT (FORMDATA)
  ------------------------------------------------------*/
  const submitProduct = async () => {
    const err = validate();
    if (err) {
      toast({ title: "Error", description: err });
      return false;
    }

    try {
      setIsLoading(true);

      const form = new FormData();
      form.append("productType", productType);
      form.append("name", name);
      form.append("description", description);
      form.append("category", categoryId);

      // OFFER FIELDS
      if (discount) form.append("discount", discount);
      if (offerTitle) form.append("offerTitle", offerTitle);
      if (offerDescription) form.append("offerDescription", offerDescription);
      if (offerValidFrom) form.append("offerValidFrom", offerValidFrom);
      if (offerValidTill) form.append("offerValidTill", offerValidTill);

      // SIMPLE PRODUCT
      if (productType === "simple") {
        form.append("price", price);
        form.append("stock", stock);

        images.forEach((img) => {
          if (img.file) form.append("images", img.file);
        });
      }

      // VARIANT PRODUCT
      if (productType === "variant") {
        const variantPayload = variants.map((v, idx) => ({
          color: v.color,
          size: v.size,
          price: v.price,
          stock: v.stock,
          imagesKey: `variant_${idx}`,
        }));

        // auto generate colors + sizes for product-level schema
        const colors = [...new Set(variants.map((v) => v.color))];
        const sizes = [...new Set(variants.map((v) => v.size))];

        form.append("colors", JSON.stringify(colors));
        form.append("sizes", JSON.stringify(sizes));
        form.append("variants", JSON.stringify(variantPayload));

        variants.forEach((v, idx) => {
          v.images.forEach((img) => {
            if (img.file) form.append(`variant_${idx}`, img.file);
          });
        });
      }

      if (productId) form.append("productId", productId);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/create-product`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast({ title: "Success", description: "Product saved successfully" });
      return true;
    } catch (err) {
      handleErrorLogout(err, "Error saving product");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // main
    isLoading,
    productType,
    setProductType,

    name,
    setName,
    description,
    setDescription,
    categories,
    categoryId,
    setCategoryId,

    // simple
    price,
    setPrice,
    stock,
    setStock,
    images,

    // variants
    variants,

    discount,
    setDiscount,
    offerTitle,
    setOfferTitle,
    offerDescription,
    setOfferDescription,
    offerValidFrom,
    setOfferValidFrom,
    offerValidTill,
    setOfferValidTill,

    // refs
    generalInputRef,
    variantFileRefs,

    // handlers
    handleGeneralImages,
    removeGeneralImage,
    addVariant,
    removeVariant,
    updateVariant,
    handleVariantImages,
    removeVariantImage,

    // submit
    submitProduct,
  };
};
