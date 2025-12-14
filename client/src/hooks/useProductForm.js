import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useErrorLogout from "@/hooks/use-error-logout";
import { useToast } from "@/hooks/use-toast";

const MAX_GENERAL_IMAGES = 8;

export const useProductForm = (productId) => {
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();

  // ================================
  // BASIC PRODUCT STATES
  // ================================
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // ================================
  // SIMPLE PRODUCT FIELDS
  // ================================
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const generalInputRef = useRef(null);

  // ================================
  // NEW SCHEMA FIELDS
  // ================================
  const [material, setMaterial] = useState("");
  const [ageGroup, setAgeGroup] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [brand, setBrand] = useState("");

  const [tags, setTags] = useState(""); // comma string
  const [keywords, setKeywords] = useState(""); // comma string

  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // ================================
  // OFFER FIELDS
  // ================================
  const [discount, setDiscount] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerValidFrom, setOfferValidFrom] = useState("");
  const [offerValidTill, setOfferValidTill] = useState("");

  // ================================
  // LOAD CATEGORIES
  // ================================
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/categories`)
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  // ================================
  // LOAD PRODUCT IN EDIT MODE
  // ================================
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

        setName(p.name);
        setDescription(p.description);
        setCategoryId(p.category?._id || p.category);

        setPrice(p.price ?? "");
        setStock(p.stock ?? "");

        setMaterial(p.material || "");

        setAgeGroup(p.ageGroup || []);
        setColors(p.colors || []);
        setSizes(p.sizes || []);

        setBrand(p.brand || "");

        setTags((p.tags || []).join(", "));
        setKeywords((p.keywords || []).join(", "));

        setIsFeatured(p.isFeatured || false);
        setIsNewArrival(p.isNewArrival || false);
        setIsBestSeller(p.isBestSeller || false);

        // Images
        setImages(
          (p.images || []).map((img) => ({
            file: null,
            preview: img.url,
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

  // ================================
  // IMAGE HANDLING
  // ================================
  const handleGeneralImages = (e) => {
    const files = [...e.target.files];
    const add = files.slice(0, MAX_GENERAL_IMAGES - images.length);

    const mapped = add.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));

    setImages((prev) => [...prev, ...mapped]);
  };

  const removeGeneralImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ================================
  // TOGGLE HANDLERS FOR NEW FIELDS
  // ================================
  const toggleColor = (color) => {
    setColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleAgeGroup = (item) => {
    setAgeGroup((prev) =>
      prev.includes(item) ? prev.filter((g) => g !== item) : [...prev, item]
    );
  };

  // ================================
  // VALIDATION
  // ================================
  const validate = () => {
    if (!name.trim()) return "Enter product name";
    if (!description.trim()) return "Enter description";
    if (!categoryId) return "Select category";

    if (!price) return "Enter price";
    if (!stock) return "Enter stock";

    if (!images.length) return "Upload at least 1 image";

    if (offerValidFrom && offerValidTill && offerValidFrom > offerValidTill)
      return "Offer start date cannot be after end date";

    return null;
  };

  // ================================
  // SUBMIT PRODUCT
  // ================================
  const submitProduct = async () => {
    const err = validate();
    if (err) {
      toast({ title: "Error", description: err });
      return false;
    }

    try {
      setIsLoading(true);

      const form = new FormData();
      form.append("productType", "simple");

      form.append("name", name);
      form.append("description", description);
      form.append("category", categoryId);

      form.append("price", price);
      form.append("stock", stock);

      // NEW FIELDS
      form.append("material", material);
      form.append("brand", brand);

      form.append("ageGroup", JSON.stringify(ageGroup));
      form.append("colors", JSON.stringify(colors));
      form.append("sizes", JSON.stringify(sizes));

      if (tags)
        form.append(
          "tags",
          JSON.stringify(tags.split(",").map((t) => t.trim()))
        );
      if (keywords)
        form.append(
          "keywords",
          JSON.stringify(keywords.split(",").map((k) => k.trim()))
        );

      form.append("isFeatured", isFeatured);
      form.append("isNewArrival", isNewArrival);
      form.append("isBestSeller", isBestSeller);

      // OFFER
      form.append("discount", discount);
      form.append("offerTitle", offerTitle);
      form.append("offerDescription", offerDescription);
      form.append("offerValidFrom", offerValidFrom);
      form.append("offerValidTill", offerValidTill);

      // IMAGES
      images.forEach((img) => {
        if (img.file) form.append("images", img.file);
      });

      if (productId) form.append("productId", productId);

      await axios.post(`${import.meta.env.VITE_API_URL}/create-product`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

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
    // Main states
    isLoading,
    name,
    setName,
    description,
    setDescription,
    categories,
    categoryId,
    setCategoryId,

    price,
    setPrice,
    stock,
    setStock,
    images,
    handleGeneralImages,
    removeGeneralImage,
    generalInputRef,

    // New fields
    material,
    setMaterial,
    ageGroup,
    toggleAgeGroup,
    colors,
    toggleColor,
    sizes,
    toggleSize,

    brand,
    setBrand,
    tags,
    setTags,
    keywords,
    setKeywords,

    isFeatured,
    setIsFeatured,
    isNewArrival,
    setIsNewArrival,
    isBestSeller,
    setIsBestSeller,

    // Offer
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

    // Submit
    submitProduct,
  };
};
