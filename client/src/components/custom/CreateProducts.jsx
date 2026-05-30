import React, { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Loader2,
  Upload,
  X,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
  Tag,
  Truck,
  Sparkles,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
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

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const SectionBadge = ({ step, title, icon: Icon }) => (
  <div className="flex items-center gap-2">
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
      {step}
    </span>
    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    <CardTitle className="text-lg">{title}</CardTitle>
  </div>
);

const CreateProducts = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const f = useProductForm(productId);
  const isEdit = Boolean(productId);
  const [dragOver, setDragOver] = useState(false);

  const finalPrice = useMemo(() => {
    const p = Number(f.price) || 0;
    const d = Number(f.discount) || 0;
    if (!p || d <= 0) return p;
    return Math.round(p - (p * d) / 100);
  }, [f.price, f.discount]);

  const onDropImages = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      f.handleGeneralImages({ target: { files } });
    },
    [f]
  );

  if (f.isLoading && isEdit && !f.name) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading product…</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await f.submitProduct();
          if (ok) navigate("/admin/products");
        }}
        className="mx-auto max-w-6xl space-y-8"
      >
        {/* Header */}
        <div className="rounded-xl border bg-gradient-to-br from-primary/8 via-card to-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {isEdit ? "Edit mode" : "New listing"}
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {isEdit ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {isEdit
                  ? "Update details below. Existing images stay unless you remove them; add more anytime."
                  : "Required: name, description, category, price, stock, 1+ image, and at least one feature."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/products")}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to products
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Basic */}
            <Card>
              <CardHeader>
                <SectionBadge step={1} title="Basic Details" icon={Package} />
                <CardDescription>Name, description, category & pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g. Kids Remote Control Car"
                    value={f.name}
                    onChange={(e) => f.setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <div className="mt-1.5 rounded-md border bg-background [&_.ql-container]:min-h-[140px] [&_.ql-editor]:min-h-[120px]">
                    <ReactQuill
                      theme="snow"
                      modules={quillModules}
                      value={f.description}
                      onChange={f.setDescription}
                      placeholder="Describe features, material, ideal age…"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Category *</Label>
                    <Select value={f.categoryId} onValueChange={f.setCategoryId}>
                      <SelectTrigger className="mt-1.5">
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
                    <Label>Brand</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="Optional"
                      value={f.brand}
                      onChange={(e) => f.setBrand(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Price (₹) *</Label>
                    <Input
                      className="mt-1.5"
                      type="number"
                      min={0}
                      placeholder="499"
                      value={f.price}
                      onChange={(e) => f.setPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Stock *</Label>
                    <Input
                      className="mt-1.5"
                      type="number"
                      min={0}
                      placeholder="50"
                      value={f.stock}
                      onChange={(e) => f.setStock(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <SectionBadge step={2} title="Product Images" icon={ImagePlus} />
                <CardDescription>
                  First image = main photo on shop. Up to {f.maxGeneralImages} images.
                  <span className="ml-1 font-medium text-foreground">
                    {f.images.length}/{f.maxGeneralImages}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDropImages}
                  onClick={() =>
                    f.images.length < f.maxGeneralImages &&
                    f.generalInputRef.current?.click()
                  }
                  className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                  } ${f.images.length >= f.maxGeneralImages ? "pointer-events-none opacity-50" : ""}`}
                >
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag & drop images here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, WebP — multiple files allowed
                  </p>
                </div>

                {f.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {f.images.map((img, i) => (
                      <div
                        key={`${img.preview}-${i}`}
                        className="group relative aspect-square overflow-hidden rounded-lg border bg-muted shadow-sm"
                      >
                        <img
                          src={img.preview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {i === 0 && (
                          <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Main
                          </span>
                        )}
                        {!img.isExisting && (
                          <span className="absolute left-1.5 bottom-1.5 rounded bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            New
                          </span>
                        )}
                        <div className="absolute inset-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/70 via-transparent to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                          {i > 0 && (
                            <button
                              type="button"
                              title="Set as main image"
                              onClick={(e) => {
                                e.stopPropagation();
                                f.setPrimaryImage(i);
                              }}
                              className="rounded bg-white/90 p-1 text-amber-600 hover:bg-white"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Move left"
                            disabled={i === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              f.moveImage(i, -1);
                            }}
                            className="rounded bg-white/90 p-1 disabled:opacity-40"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Move right"
                            disabled={i === f.images.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              f.moveImage(i, 1);
                            }}
                            className="rounded bg-white/90 p-1 disabled:opacity-40"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              f.removeGeneralImage(i);
                            }}
                            className="rounded bg-red-500/90 p-1 text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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

            {/* Attributes */}
            <Card>
              <CardHeader>
                <SectionBadge step={3} title="Attributes & Filters" icon={Tag} />
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Materials</Label>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Sidebar → Material filter
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {MATERIAL_OPTIONS.map((m) => (
                      <label
                        key={m.value}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 text-sm hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={f.materials.includes(m.value)}
                          onCheckedChange={() => f.toggleMaterial(m.value)}
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Age Group</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {AGE_GROUP_OPTIONS.map((ag) => (
                      <label
                        key={ag.value}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={f.ageGroup.includes(ag.value)}
                          onCheckedChange={() => f.toggleAgeGroup(ag.value)}
                        />
                        {ag.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Colors</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => f.toggleColor(c.value)}
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-all ${
                          f.colors.includes(c.value)
                            ? "border-primary bg-primary/10 font-medium"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 shrink-0 rounded-full ${c.swatch}`}
                        />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Sizes (optional)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SIZE_OPTIONS.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => f.toggleSize(size)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Tags</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="toy, gift, kids"
                      value={f.tags}
                      onChange={(e) => f.setTags(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Comma separated
                    </p>
                  </div>
                  <div>
                    <Label>Keywords (SEO)</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="remote car, battery toy"
                      value={f.keywords}
                      onChange={(e) => f.setKeywords(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/30 p-4">
                  <p className="w-full text-xs font-medium text-muted-foreground">
                    Highlights (sidebar filters)
                  </p>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={f.isFeatured}
                      onCheckedChange={f.setIsFeatured}
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={f.isNewArrival}
                      onCheckedChange={f.setIsNewArrival}
                    />
                    New Arrival
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={f.isBestSeller}
                      onCheckedChange={f.setIsBestSeller}
                    />
                    Best Seller
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Specs & features */}
            <Card>
              <CardHeader>
                <SectionBadge step={4} title="Specs & Features" icon={Sparkles} />
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label>
                    Features (one per line) <span className="text-destructive">*</span>
                  </Label>
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    At least one line required — shown on product page
                  </p>
                  <Textarea
                    className="mt-1.5"
                    rows={4}
                    value={f.featuresText}
                    onChange={(e) => f.setFeaturesText(e.target.value)}
                    placeholder={"Powerful spring action\nSafe suction darts"}
                  />
                </div>

                <div>
                  <Label>Specifications</Label>
                  {f.specifications.map((spec, i) => (
                    <div key={i} className="mb-2 flex gap-2">
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
                        size="icon"
                        onClick={() => f.removeSpec(i)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={f.addSpec}>
                    + Add row
                  </Button>
                </div>

                <div>
                  <Label>Dimensions</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Price preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MRP</span>
                  <span>₹{Number(f.price) || 0}</span>
                </div>
                {Number(f.discount) > 0 && (
                  <>
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span>{f.discount}% off</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-base font-semibold">
                      <span>Selling price</span>
                      <span className="text-primary">₹{finalPrice}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Discount (%)</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    max={100}
                    value={f.discount}
                    onChange={(e) => f.setDiscount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Offer title</Label>
                  <Input
                    className="mt-1"
                    value={f.offerTitle}
                    onChange={(e) => f.setOfferTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Offer description</Label>
                  <Textarea
                    className="mt-1"
                    rows={2}
                    value={f.offerDescription}
                    onChange={(e) => f.setOfferDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">From</Label>
                    <Input
                      type="date"
                      value={f.offerValidFrom}
                      onChange={(e) => f.setOfferValidFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Till</Label>
                    <Input
                      type="date"
                      value={f.offerValidTill}
                      onChange={(e) => f.setOfferValidTill(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionBadge step={5} title="Delivery" icon={Truck} />
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={f.canDispatchFast}
                    onCheckedChange={f.setCanDispatchFast}
                  />
                  Ready to Ship
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={f.returnEligible}
                    onCheckedChange={f.setReturnEligible}
                  />
                  Easy Returns
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={f.codAvailable}
                    onCheckedChange={f.setCodAvailable}
                  />
                  COD available
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={f.qualityVerified}
                    onCheckedChange={f.setQualityVerified}
                  />
                  Quality checked
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={f.freeShipping}
                    onCheckedChange={f.setFreeShipping}
                  />
                  Free shipping
                </label>
                <div>
                  <Label>Handling time (days)</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    value={f.handlingTime}
                    onChange={(e) => f.setHandlingTime(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sticky submit */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:pl-[var(--sidebar-width,0)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <p className="hidden text-sm text-muted-foreground sm:block">
              {isEdit
                ? "Save changes — existing images are kept when you add new ones."
                : "Review all sections before publishing."}
            </p>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/products")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={f.isLoading} className="min-w-[140px]">
                {f.isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Update Product" : "Publish Product"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProducts;
