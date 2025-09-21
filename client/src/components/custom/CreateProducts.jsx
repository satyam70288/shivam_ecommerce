import React, { useRef, useState, useEffect } from "react";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_OPTIONS = [
  { name: "White", code: "#FFFFFF" },
  { name: "Black", code: "#000000" },
  { name: "Maroon", code: "#800000" },
  { name: "Gray", code: "#808080" },
  { name: "Blue", code: "#0000FF" },
  { name: "Purple", code: "#800080" }, 
];

const MAX_IMAGES_PER_COLOR = 40;

const CreateProducts = ({ productId }) => {
  const [currentColor, setCurrentColor] = useState("");
  const [colors, setColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [sizes, setSizes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [discount, setDiscount] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerValidTill, setOfferValidTill] = useState("");
  const [offerValidFrom, setOfferValidFrom] = useState("");
  const [variantImages, setVariantImages] = useState({}); // { colorName: [{ file, preview }] }
  const fileInputRefs = useRef({});
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();

  // ---- Map API variants to variantImages ----
  const mapVariantsFromAPI = (variants) => {
    const mapped = {};
    variants.forEach((v) => {
      mapped[v.color] = v.images.map((img) => ({ file: null, preview: img.url }));
    });
    return mapped;
  };

  // ---- Load product data if editing ----
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/product/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const product = res.data.data;
        setSizes(product.sizes || []);
        setColors(product.variants.map((v) => v.color) || []);
        setVariantImages(mapVariantsFromAPI(product.variants || []));
        setDiscount(product.discount || "");
        setOfferTitle(product.offerTitle || "");
        setOfferDescription(product.offerDescription || "");
        setOfferValidFrom(product.offerValidFrom || "");
        setOfferValidTill(product.offerValidTill || "");
      } catch (error) {
        handleErrorLogout(error, "Error fetching product");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // ---- Sizes ----
  const addSize = () => {
    if (selectedSize && !sizes.includes(selectedSize)) setSizes([...sizes, selectedSize]);
  };
  const removeSize = (size) => setSizes(sizes.filter((s) => s !== size));

  // ---- Colors ----
  const addColor = () => {
    if (!currentColor) return;
    const colorObj = COLOR_OPTIONS.find((c) => c.code === currentColor);
    if (colorObj && !colors.includes(colorObj.name)) {
      setColors([...colors, colorObj.name]);
      setCurrentColor("");
    }
  };
  const removeColor = (colorName) => {
    setColors(colors.filter((c) => c !== colorName));
    const updated = { ...variantImages };
    delete updated[colorName];
    setVariantImages(updated);
  };

  // ---- Image Upload with 40 limit ----
  const handleImageUpload = (colorName) => (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setVariantImages((prev) => {
      const existingImages = prev[colorName] || [];
      const currentCount = existingImages.length;

      if (currentCount >= MAX_IMAGES_PER_COLOR) {
        toast({
          title: "Limit Reached",
          description: `You can upload a maximum of ${MAX_IMAGES_PER_COLOR} images for ${colorName}.`,
        });
        return prev;
      }

      const allowedFiles = files.slice(0, MAX_IMAGES_PER_COLOR - currentCount);
      const newFiles = allowedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      return {
        ...prev,
        [colorName]: [...existingImages, ...newFiles],
      };
    });

    e.target.value = "";
  };
  const removeImage = (colorName, index) => {
    setVariantImages((prev) => ({
      ...prev,
      [colorName]: prev[colorName].filter((_, i) => i !== index),
    }));
  };

  // ---- Submit ----
  const onSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const description = e.target.description.value.trim();
    const price = e.target.price.value.trim();
    const stock = e.target.stock.value.trim();
    const category = e.target.category.value;

    if (!name || !description || !price || !stock || !category || colors.length === 0 || sizes.length === 0) {
      return toast({ title: "Error", description: "Please fill out all fields" });
    }

    for (const colorName of colors) {
      if (!variantImages[colorName] || variantImages[colorName].length === 0) {
        return toast({ title: "Error", description: `Please upload at least one image for color: ${colorName}` });
      }
    }

    if (offerValidFrom && offerValidTill && offerValidFrom > offerValidTill) {
      return toast({ title: "Error", description: "Offer start date cannot be after end date" });
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", category);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("colors", JSON.stringify(colors));
    formData.append("discount", discount);
    formData.append("offerTitle", offerTitle);
    formData.append("offerDescription", offerDescription);
    formData.append("offerValidFrom", offerValidFrom);
    formData.append("offerValidTill", offerValidTill);

    const colorImageMap = [];
    Object.entries(variantImages).forEach(([colorName, imgs]) => {
      imgs.forEach((imgObj) => {
        if (imgObj.file) formData.append("images", imgObj.file);
        colorImageMap.push(colorName);
      });
    });
    formData.append("colorsForImages", JSON.stringify(colorImageMap));

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/create-product`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast({ title: "Success", description: res.data.message });

      // Reset form
      setSizes([]); setColors([]); setVariantImages({});
      setDiscount(""); setOfferTitle(""); setOfferDescription("");
      setOfferValidFrom(""); setOfferValidTill("");
      e.target.reset();
    } catch (error) {
      handleErrorLogout(error, "Error uploading product");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center absolute inset-0"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  return (
    <div className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Add / Edit Product</CardTitle>
        <CardDescription>Enter the details for the product</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:w-[70vw]">
          {/* Left Column */}
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" placeholder="Enter product name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} placeholder="Enter description" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" min="0" placeholder="20" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Category">All Category</SelectItem>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Kid">Kid</SelectItem>
                  <SelectItem value="Men & Women">Men & Women</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          {/* Right Column */}
          <CardContent className="space-y-6">
            {/* Sizes */}
            <div className="space-y-2">
              <Label>Sizes</Label>
              <div className="flex items-center space-x-2">
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-[120px]"><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>{SIZE_OPTIONS.map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={addSize}>Add Size</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size) => (
                  <div key={size} className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                    <span className="text-sm mr-1 dark:text-slate-900">{size}</span>
                    <Button variant="ghost" className="h-6 w-6 p-0 rounded-full" onClick={() => removeSize(size)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label>Colors</Label>
              <div className="flex gap-2">
                <select value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} className="border border-gray-600 rounded-md px-3 py-2 bg-gray-900 text-white flex-1">
                  <option value="">Select color</option>
                  {COLOR_OPTIONS.map((color) => (<option key={color.code} value={color.code}>{color.name}</option>))}
                </select>
                <Button type="button" onClick={addColor}>Add Color</Button>
              </div>

              {colors.map((colorName) => {
                const colorCode = COLOR_OPTIONS.find(c => c.name === colorName)?.code || "#000";
                const imageCount = variantImages[colorName]?.length || 0;
                return (
                  <div key={colorName} className="border border-gray-700 rounded-lg p-3 bg-gray-900 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: colorCode }} />
                        <span className="font-medium text-white">{colorName}</span>
                        <span className="text-sm text-gray-400">({imageCount}/{MAX_IMAGES_PER_COLOR})</span>
                      </div>
                      <Button variant="ghost" size="sm" className="p-1" onClick={() => removeColor(colorName)}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    {/* Existing images */}
                    <div className="flex flex-wrap gap-3 mb-2">
                      {(variantImages[colorName] || []).map((imgObj, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700 group">
                          <img src={imgObj.preview} className="w-full h-full object-cover" />
                          <Button variant="ghost" className="absolute -top-1 -right-1 p-1 bg-gray-800 rounded-full shadow opacity-0 group-hover:opacity-100 transition" onClick={() => removeImage(colorName, i)}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Upload Images button */}
                    <Button type="button" variant="outline" disabled={imageCount >= MAX_IMAGES_PER_COLOR} onClick={() => fileInputRefs.current[colorName]?.click()} className="w-full flex items-center justify-center gap-2 border-dashed border-gray-600 hover:border-indigo-400 hover:text-indigo-500">
                      <Upload className="h-5 w-5" /> {imageCount >= MAX_IMAGES_PER_COLOR ? "Limit Reached" : "Upload Images"}
                    </Button>
                    <input type="file" multiple accept="image/*" className="hidden" ref={(el) => (fileInputRefs.current[colorName] = el)} onChange={handleImageUpload(colorName)} />
                  </div>
                );
              })}
            </div>

            {/* Offer & Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input id="discount" type="number" min="0" max="100" placeholder="Enter discount %" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerTitle">Offer Title</Label>
              <Input id="offerTitle" placeholder="Enter offer title" value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerDescription">Offer Description</Label>
              <Textarea id="offerDescription" rows={3} placeholder="Enter offer description" value={offerDescription} onChange={(e) => setOfferDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerValidFrom">Offer Valid From</Label>
              <Input id="offerValidFrom" type="date" value={offerValidFrom} onChange={(e) => setOfferValidFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerValidTill">Offer Valid Till</Label>
              <Input id="offerValidTill" type="date" value={offerValidTill} onChange={(e) => setOfferValidTill(e.target.value)} />
            </div>
          </CardContent>
        </div>

        {/* Submit Product */}
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Adding Product..." : "Add Product"}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default CreateProducts;
