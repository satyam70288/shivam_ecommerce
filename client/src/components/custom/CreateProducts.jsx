import React from "react";
import {
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { useProductForm } from "@/hooks/useProductForm";

const MAX_GENERAL_IMAGES = 8;

const CreateProducts = ({ productId }) => {
  const f = useProductForm(productId); // already handles simple fields

  if (f.isLoading) {
    return (
      <div className="flex items-center justify-center absolute inset-0">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      {/* HEADER */}
      <CardHeader>
        <CardTitle className="text-2xl">
          {productId ? "Edit Product" : "Add Product"}
        </CardTitle>
        <CardDescription>Fill product details (Simple Product Only)</CardDescription>
      </CardHeader>

      {/* FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          f.submitProduct();
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE */}
          <CardContent className="space-y-4">

            {/* PRODUCT NAME */}
            <div>
              <Label>Product Name</Label>
              <Input
                value={f.name}
                onChange={(e) => f.setName(e.target.value)}
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={f.description}
                onChange={(e) => f.setDescription(e.target.value)}
              />
            </div>

            {/* CATEGORY */}
            <div>
              <Label>Category</Label>
              <Select value={f.categoryId} onValueChange={(v) => f.setCategoryId(v)}>
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

            {/* PRICE */}
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                min="0"
                value={f.price}
                onChange={(e) => f.setPrice(e.target.value)}
              />
            </div>

            {/* STOCK */}
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                min="0"
                value={f.stock}
                onChange={(e) => f.setStock(e.target.value)}
              />
            </div>

            {/* IMAGES */}
            <div>
              <Label>
                Product Images ({f.images.length}/{MAX_GENERAL_IMAGES})
              </Label>

              {/* Preview list */}
              <div className="flex gap-3 flex-wrap mt-2">
                {f.images.map((img, i) => (
                  <div key={i} className="relative w-24 h-24 rounded overflow-hidden">
                    <img src={img.preview} className="w-full h-full object-cover" />

                    <button
                      type="button"
                      onClick={() => f.removeGeneralImage(i)}
                      className="absolute -top-1 -right-1 bg-black/60 p-1 rounded-full"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => f.generalInputRef.current.click()}
                disabled={f.images.length >= MAX_GENERAL_IMAGES}
              >
                <Upload className="h-4 w-4 mr-1" /> Upload Images
              </Button>

              {/* Hidden input */}
              <input
                ref={f.generalInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={f.handleGeneralImages}
              />
            </div>

          </CardContent>

          {/* RIGHT SIDE */}
          <CardContent className="space-y-4">

            {/* DISCOUNT */}
            <div>
              <Label>Discount %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={f.discount}
                onChange={(e) => f.setDiscount(e.target.value)}
              />
            </div>

            {/* OFFER TITLE */}
            <div>
              <Label>Offer Title</Label>
              <Input
                value={f.offerTitle}
                onChange={(e) => f.setOfferTitle(e.target.value)}
              />
            </div>

            {/* OFFER DESCRIPTION */}
            <div>
              <Label>Offer Description</Label>
              <Textarea
                rows={3}
                value={f.offerDescription}
                onChange={(e) => f.setOfferDescription(e.target.value)}
              />
            </div>

            {/* OFFER VALID FROM */}
            <div>
              <Label>Valid From</Label>
              <Input
                type="date"
                value={f.offerValidFrom}
                onChange={(e) => f.setOfferValidFrom(e.target.value)}
              />
            </div>

            {/* OFFER VALID TILL */}
            <div>
              <Label>Valid Till</Label>
              <Input
                type="date"
                value={f.offerValidTill}
                onChange={(e) => f.setOfferValidTill(e.target.value)}
              />
            </div>

          </CardContent>
        </div>

        {/* FOOTER BUTTON */}
        <CardFooter>
          <Button className="w-full" type="submit" disabled={f.isLoading}>
            {f.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {productId ? "Update Product" : "Add Product"}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default CreateProducts;
