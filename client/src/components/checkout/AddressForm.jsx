import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createAddress, updateAddress } from "@/redux/slices/checkoutSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Home, Building, MapPin, Save, User, Phone, Mail, Map, Hash, Globe, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom"; // या next/router अगर Next.js हो

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

const AddressForm = ({ onClose, editAddress, isModal = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // अगर separate page चाहिए तो
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill on edit
  useEffect(() => {
    if (editAddress) setForm(editAddress);
  }, [editAddress]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
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

    setIsSubmitting(true);
    
    try {
      if (editAddress) {
        await dispatch(updateAddress({ id: editAddress._id, data: form }));
      } else {
        await dispatch(createAddress(form));
      }
      onClose();
      // अगर separate page है तो navigate back
      if (!isModal) navigate(-1);
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case "home": return <Home size={18} />;
      case "office": return <Building size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  // Desktop Modal View
  if (isModal) {
    return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

        <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Desktop Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {editAddress ? "Edit Address" : "Add New Address"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Please fill in all required fields marked with *
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="p-6 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Details
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full h-12"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            name="phone"
                            placeholder="Enter phone number"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            className="w-full h-12 pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            name="email"
                            placeholder="Enter email (optional)"
                            value={form.email}
                            onChange={handleChange}
                            type="email"
                            className="w-full h-12 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Address Details
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        House/Flat/Street <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="address_line1"
                        placeholder="Enter house number, flat, street"
                        value={form.address_line1}
                        onChange={handleChange}
                        required
                        className="w-full h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Area/Landmark
                      </label>
                      <Input
                        name="address_line2"
                        placeholder="Enter area, landmark, society"
                        value={form.address_line2}
                        onChange={handleChange}
                        className="w-full h-12"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="city"
                          placeholder="Enter city"
                          value={form.city}
                          onChange={handleChange}
                          required
                          className="w-full h-12"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="state"
                          placeholder="Enter state"
                          value={form.state}
                          onChange={handleChange}
                          required
                          className="w-full h-12"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            name="pincode"
                            placeholder="Enter pincode"
                            value={form.pincode}
                            onChange={handleChange}
                            required
                            className="w-full h-12 pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            name="country"
                            placeholder="Enter country"
                            value={form.country}
                            onChange={handleChange}
                            className="w-full h-12 pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address Type
                        </label>
                        <select
                          name="address_type"
                          value={form.address_type}
                          onChange={handleChange}
                          className="
                            w-full h-12 rounded-lg px-4
                            bg-white dark:bg-gray-800
                            text-gray-900 dark:text-gray-100
                            border border-gray-300 dark:border-gray-600
                            focus:border-blue-500 dark:focus:border-blue-400
                            focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30
                          "
                        >
                          <option value="home">🏠 Home</option>
                          <option value="office">🏢 Office</option>
                          <option value="other">📍 Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={form.isDefault}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Set as default address
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Use this address for all future orders
                      </p>
                    </div>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="h-11 px-6"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {editAddress ? "Update" : "Save Address"}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Full Screen View
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          disabled={isSubmitting}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
            {getAddressTypeIcon(form.address_type)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              {editAddress ? "Edit Address" : "Add Address"}
            </h3>
          </div>
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Mobile Form Body */}
      <div className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Personal Details
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full h-12"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      name="phone"
                      placeholder="Enter phone number"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full h-12 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      name="email"
                      placeholder="Enter email (optional)"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      className="w-full h-12 pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Address Details
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  House/Flat/Street <span className="text-red-500">*</span>
                </label>
                <Input
                  name="address_line1"
                  placeholder="Enter house number, flat, street"
                  value={form.address_line1}
                  onChange={handleChange}
                  required
                  className="w-full h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Area/Landmark
                </label>
                <Input
                  name="address_line2"
                  placeholder="Enter area, landmark, society"
                  value={form.address_line2}
                  onChange={handleChange}
                  className="w-full h-12"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="city"
                    placeholder="Enter city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="state"
                    placeholder="Enter state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className="w-full h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      name="pincode"
                      placeholder="Enter pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                      className="w-full h-12 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      name="country"
                      placeholder="Enter country"
                      value={form.country}
                      onChange={handleChange}
                      className="w-full h-12 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address Type
                  </label>
                  <select
                    name="address_type"
                    value={form.address_type}
                    onChange={handleChange}
                    className="
                      w-full h-12 rounded-lg px-4
                      bg-white dark:bg-gray-800
                      text-gray-900 dark:text-gray-100
                      border border-gray-300 dark:border-gray-600
                      focus:border-blue-500 dark:focus:border-blue-400
                    "
                  >
                    <option value="home">🏠 Home</option>
                    <option value="office">🏢 Office</option>
                    <option value="other">📍 Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Set as default address
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Use this address for all future orders
                </p>
              </div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-4 pb-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editAddress ? "Update Address" : "Save Address"}
                </span>
              )}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              Fields marked with <span className="text-red-500">*</span> are required
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;