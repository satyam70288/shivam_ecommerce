/* YOUR SAME IMPORTS */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import "react-quill/dist/quill.snow.css";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { useProductForm } from "@/hooks/useProductForm";
import ReactQuill from "react-quill";
import {
  MATERIAL_OPTIONS,
  AGE_GROUP_OPTIONS,
  COLOR_OPTIONS,
} from "@/constants/filtersConfig";

const MAX_GENERAL_IMAGES = 8;

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

const CreateProducts = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const f = useProductForm(productId);
  const isEdit = Boolean(productId);

  if (f.isLoading) {
    return (
      <div className="flex items-center justify-center absolute inset-0">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await f.submitProduct();
        if (ok) navigate("/admin/products");
      }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to products
        </button>
      </div>
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
              {/* <Textarea
                rows={4}
                value={f.description}
                onChange={(e) => f.setDescription(e.target.value)}
              /> */}
              <ReactQuill
                value={f.description}
                onChange={f.setDescription}
                placeholder="Product description..."
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
              <Label>Materials</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                Used in sidebar → Material filter
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_OPTIONS.map((m) => (
                  <label key={m.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={f.materials.includes(m.value)}
                      onCheckedChange={() => f.toggleMaterial(m.value)}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
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
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                Used in sidebar → Age group filter (mainly Toys)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AGE_GROUP_OPTIONS.map((ag) => (
                  <label key={ag.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={f.ageGroup.includes(ag.value)}
                      onCheckedChange={() => f.toggleAgeGroup(ag.value)}
                    />
                    {ag.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <Label>Colors</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                Used in sidebar → Color filter
              </p>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => f.toggleColor(c.value)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-sm transition-all ${
                      f.colors.includes(c.value)
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full shrink-0 ${c.swatch}`}
                    />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <Label>Sizes (optional)</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                For bags, clothing-style items
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => f.toggleSize(size)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                      f.sizes.includes(size)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {size}
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
              <p className="text-xs text-muted-foreground mb-1">
                Used in sidebar → Highlights filter
              </p>
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
        <Card>
          <CardHeader>
            <CardTitle>Delivery & Policy</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={f.canDispatchFast}
                onCheckedChange={f.setCanDispatchFast}
              />
              Ready to Ship
            </label>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={f.returnEligible}
                onCheckedChange={f.setReturnEligible}
              />
              Easy Returns
            </label>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={f.codAvailable}
                onCheckedChange={f.setCodAvailable}
              />
              Secure Payments (COD)
            </label>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={f.qualityVerified}
                onCheckedChange={f.setQualityVerified}
              />
              Quality Checked
            </label>
          </CardContent>
        </Card>

        <div>
          <Label>Features (one per line)</Label>
          <Textarea
            rows={4}
            value={f.featuresText}
            onChange={(e) => f.setFeaturesText(e.target.value)}
            placeholder="Powerful spring action
Safe suction darts
Lightweight design"
          />
        </div>
        <div className="space-y-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Used in sidebar → Free shipping (Offers filter)
          </p>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={f.freeShipping}
              onCheckedChange={f.setFreeShipping}
            />
            Free Shipping
          </label>

          <div>
            <Label>Handling Time (Days)</Label>
            <Input
              type="number"
              min={0}
              value={f.handlingTime}
              onChange={(e) => f.setHandlingTime(e.target.value)}
            />
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>

        <CardContent>
          {f.specifications.map((spec, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input
                placeholder="Key"
                value={spec.key}
                onChange={(e) => f.updateSpecKey(i, e.target.value)}
              />
              <Input
                placeholder="Value"
                value={spec.value}
                onChange={(e) => f.updateSpecValue(i, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => f.removeSpec(i)}
              >
                <X size={14} />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={f.addSpec}>
            + Add Specification
          </Button>
        </CardContent>
      </Card>
      <div className="mt-6">
        <Label>Dimensions</Label>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <Input
            type="number"
            placeholder="Length (cm)"
            value={f.dimensions.length}
            onChange={(e) =>
              f.setDimensions({
                ...f.dimensions,
                length: Number(e.target.value),
              })
            }
          />

          <Input
            type="number"
            placeholder="Width (cm)"
            value={f.dimensions.width}
            onChange={(e) =>
              f.setDimensions({
                ...f.dimensions,
                width: Number(e.target.value),
              })
            }
          />

          <Input
            type="number"
            placeholder="Height (cm)"
            value={f.dimensions.height}
            onChange={(e) =>
              f.setDimensions({
                ...f.dimensions,
                height: Number(e.target.value),
              })
            }
          />

          <Input
            type="number"
            step="0.01"
            placeholder="Weight (kg)"
            value={f.dimensions.weight}
            onChange={(e) =>
              f.setDimensions({
                ...f.dimensions,
                weight: Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      {/* ================================
        OFFER SECTION (FULL WIDTH)
     ================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Discount % + dates → sidebar &quot;Discount&quot; and &quot;On sale&quot; filters.
            Price & stock → price range and availability filters.
          </p>
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
        {isEdit ? "Update Product" : "Add Product"}
      </Button>
    </form>
  );
};

export default CreateProducts;
