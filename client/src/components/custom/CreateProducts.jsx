/* YOUR SAME IMPORTS */
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { useProductForm } from "@/hooks/useProductForm";

const MAX_GENERAL_IMAGES = 8;

/* Static Options */
const MATERIAL_OPTIONS = [
  "Plastic",
  "Wood",
  "Metal",
  "Cotton",
  "Synthetic",
  "Alloy",
  "Paper",
  "Other",
];
const AGE_GROUPS = ["0-3", "3-6", "6-9", "9-12", "12+"];
const COLORS = ["Red", "Blue", "Black", "White", "Pink", "Gold", "Silver"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

const CreateProducts = ({ productId }) => {
  const f = useProductForm(productId);

  if (f.isLoading) {
    return (
      <div className="flex items-center justify-center absolute inset-0">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        f.submitProduct();
      }}
      className="space-y-10"
    >
      {/* ================================
      2 COLUMN GRID — MAIN FIELDS
     ================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT PANEL */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <Label>Product Name</Label>
              <Input
                value={f.name}
                onChange={(e) => f.setName(e.target.value)}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={f.description}
                onChange={(e) => f.setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={f.categoryId} onValueChange={f.setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  {f.categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Material</Label>
              <Select value={f.material} onValueChange={f.setMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Plastic",
                    "Metal",
                    "Wood",
                    "Cotton",
                    "Synthetic",
                    "Alloy",
                    "Paper",
                    "Other",
                  ].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={f.price}
                  onChange={(e) => f.setPrice(e.target.value)}
                />
              </div>

              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={f.stock}
                  onChange={(e) => f.setStock(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT PANEL */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Attributes</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Age Group */}
            <div>
              <Label>Age Group</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["0-3", "3-6", "6-9", "9-12", "12+"].map((ag) => (
                  <label key={ag} className="flex items-center gap-2">
                    <Checkbox
                      checked={f.ageGroup.includes(ag)}
                      onCheckedChange={() => f.toggleAgeGroup(ag)}
                    />
                    {ag} years
                  </label>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <Label>Colors</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  "Red",
                  "Blue",
                  "Black",
                  "White",
                  "Pink",
                  "Gold",
                  "Silver",
                ].map((col) => (
                  <button
                    type="button"
                    key={col}
                    onClick={() => f.toggleColor(col)}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      f.colors.includes(col)
                        ? "bg-red-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <Label>Sizes</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => f.toggleSize(s)}
                    className={`px-3 py-1 rounded border text-sm ${
                      f.sizes.includes(s)
                        ? "bg-black text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div>
              <Label>Brand</Label>
              <Input
                value={f.brand}
                onChange={(e) => f.setBrand(e.target.value)}
              />
            </div>

            {/* Tags + Keywords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tags</Label>
                <Input
                  value={f.tags}
                  onChange={(e) => f.setTags(e.target.value)}
                />
              </div>
              <div>
                <Label>Keywords</Label>
                <Input
                  value={f.keywords}
                  onChange={(e) => f.setKeywords(e.target.value)}
                />
              </div>
            </div>

            {/* Feature Flags */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={f.isFeatured}
                  onCheckedChange={f.setIsFeatured}
                />
                Featured Product
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={f.isNewArrival}
                  onCheckedChange={f.setIsNewArrival}
                />
                New Arrival
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={f.isBestSeller}
                  onCheckedChange={f.setIsBestSeller}
                />
                Best Seller
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================
        OFFER SECTION (FULL WIDTH)
     ================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount (%)</Label>
              <Input
                type="number"
                value={f.discount}
                onChange={(e) => f.setDiscount(e.target.value)}
              />
            </div>

            <div>
              <Label>Offer Title</Label>
              <Input
                value={f.offerTitle}
                onChange={(e) => f.setOfferTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={f.offerDescription}
              onChange={(e) => f.setOfferDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valid From</Label>
              <Input
                type="date"
                value={f.offerValidFrom}
                onChange={(e) => f.setOfferValidFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>Valid Till</Label>
              <Input
                type="date"
                value={f.offerValidTill}
                onChange={(e) => f.setOfferValidTill(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================
        IMAGES SECTION (FULL WIDTH)
     ================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
          <CardDescription>
            {f.images.length}/{MAX_GENERAL_IMAGES}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-3">
            {f.images.map((img, i) => (
              <div
                key={i}
                className="relative w-24 h-24 rounded overflow-hidden"
              >
                <img src={img.preview} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => f.removeGeneralImage(i)}
                  className="absolute top-0 right-0 bg-black/60 p-1 rounded"
                >
                  <X className="text-white h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => f.generalInputRef.current.click()}
            disabled={f.images.length >= MAX_GENERAL_IMAGES}
          >
            <Upload className="h-4 w-4 mr-2" /> Upload Images
          </Button>

          <input
            ref={f.generalInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={f.handleGeneralImages}
          />
        </CardContent>
      </Card>

      {/* SUBMIT BUTTON */}
      <Button className="w-full" disabled={f.isLoading}>
        {f.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {productId ? "Update Product" : "Add Product"}
      </Button>
    </form>
  );
};

export default CreateProducts;
