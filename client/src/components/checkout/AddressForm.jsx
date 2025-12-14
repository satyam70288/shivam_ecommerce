import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createAddress, updateAddress } from "@/redux/slices/checkoutSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  landmark: "",
  address_type: "home",
  isDefault: false,
};

const AddressForm = ({ onClose, editAddress }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(emptyForm);

  // Prefill on edit
  useEffect(() => {
    if (editAddress) setForm(editAddress);
  }, [editAddress]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.phone ||
      !form.address_line1 ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (editAddress) {
      dispatch(updateAddress({ id: editAddress._id, data: form }));
    } else {
      dispatch(createAddress(form));
    }

    onClose();
  };

  return (
    <Card className="p-4 space-y-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {editAddress ? "Edit Address" : "Add New Address"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
        />

        <Input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
        />

        <Input
          name="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
          className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
        />

        <Input
          name="address_line1"
          placeholder="House / Flat / Street"
          value={form.address_line1}
          onChange={handleChange}
          className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
        />

        <Input
          name="address_line2"
          placeholder="Area / Landmark"
          value={form.address_line2}
          onChange={handleChange}
          className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
          />

          <Input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            name="pincode"
            placeholder="Pincode"
            value={form.pincode}
            onChange={handleChange}
            className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
          />

          <Input
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Address Type */}
        <select
          name="address_type"
          value={form.address_type}
          onChange={handleChange}
          className="
            w-full rounded-md px-2 py-2
            bg-white dark:bg-zinc-800
            text-gray-900 dark:text-gray-100
            border border-gray-300 dark:border-zinc-600
          "
        >
          <option value="home">Home</option>
          <option value="office">Office</option>
          <option value="other">Other</option>
        </select>

        {/* Default */}
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
            className="accent-black dark:accent-white"
          />
          Set as default address
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-gray-200"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="submit">
            {editAddress ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddressForm;
