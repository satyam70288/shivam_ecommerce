import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";

const EditProductDialog = ({ open, onClose, product, categories, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    discount: "",
    offerTitle: "",
    offerDescription: "",
    offerValidFrom: "",
    offerValidTill: "",
  });

  const [loading, setLoading] = useState(false);

  // Load initial product data
  useEffect(() => {
    if (!product) return;

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      category: product.category || "",
      discount: product.discount || "",
      offerTitle: product.offerTitle || "",
      offerDescription: product.offerDescription || "",
      offerValidFrom: product.offerValidFrom?.split("T")[0] || "",
      offerValidTill: product.offerValidTill?.split("T")[0] || "",
    });
  }, [product]);

  // Form update helper
  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Save updates
  const saveChanges = async () => {
    try {
      setLoading(true);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/update-product/${product._id}`,
        form,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      onSave();
      onClose();
    } catch (err) {
      console.error("Error updating product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">

        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-3">

          {/* BASIC FIELDS */}
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="dark:bg-neutral-800 dark:border-neutral-700"
            />
          </Field>

          <Field label="Description">
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="dark:bg-neutral-800 dark:border-neutral-700"
            />
          </Field>

          <Field label="Price">
            <Input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="dark:bg-neutral-800 dark:border-neutral-700"
            />
          </Field>

          <Field label="Stock">
            <Input
              type="number"
              value={form.stock}
              onChange={(e) => updateField("stock", e.target.value)}
              className="dark:bg-neutral-800 dark:border-neutral-700"
            />
          </Field>

          {/* CATEGORY */}
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="border w-full p-2 rounded dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">Select Category</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          {/* OFFER SECTION */}
          <div className="border-t pt-3 dark:border-neutral-700">
            <h3 className="font-semibold text-lg">Offer Details</h3>
          </div>

          <Field label="Discount (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={form.discount}
              onChange={(e) => updateField("discount", e.target.value)}
              className="dark:bg-neutral-800 dark:border-neutral-700"
            />
          </Field>

          <Field label="Offer Title">
            <Input
              value={form.offerTitle}
              onChange={(e) => updateField("offerTitle", e.target.value)}
              className="dark:bg-neutral-800 dark:border-neutral-700"
            />
          </Field>

          <Field label="Offer Description">
            <Textarea
              rows={3}
              value={form.offerDescription}
              onChange={(e) => updateField("offerDescription", e.target.value)}
              className="dark:bg-neutral-800 dark:border-neutral-700"
            />
          </Field>

          <Field label="Valid From">
            <Input
              type="date"
              value={form.offerValidFrom}
              onChange={(e) => updateField("offerValidFrom", e.target.value)}
              className="dark:bg-neutral-800 dark:border-neutral-700"
            />
          </Field>

          <Field label="Valid Till">
            <Input
              type="date"
              value={form.offerValidTill}
              onChange={(e) => updateField("offerValidTill", e.target.value)}
              className="dark:bg-neutral-800 dark:border-neutral-700"
            />
          </Field>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={saveChanges} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

/* Reusable Wrapper */
const Field = ({ label, children }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);

export default EditProductDialog;
