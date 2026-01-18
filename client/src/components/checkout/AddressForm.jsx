import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { createAddress, updateAddress } from "@/redux/slices/checkoutSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Home,
  Building,
  MapPin,
  Save,
  User,
  Phone,
  Mail,
  Map,
  Hash,
  Globe,
  ChevronLeft,
  Loader2,
  Navigation,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchStates } from "@/api/state";
import { debounce } from "lodash";

// Constants
const ADDRESS_TYPES = [
  { value: "home", label: "🏠 Home" },
  { value: "office", label: "🏢 Office" },
  { value: "other", label: "📍 Other" },
];

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

// Reusable Components
const FormInput = React.memo(({ label, required = false, children, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
));

FormInput.displayName = "FormInput";

const IconInput = React.memo(({ icon: Icon, children, className = "" }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    <div className={className}>{children}</div>
  </div>
));

IconInput.displayName = "IconInput";

const SectionHeader = React.memo(({ icon: Icon, title }) => (
  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
    <Icon className="w-4 h-4" />
    {title}
  </h4>
));

SectionHeader.displayName = "SectionHeader";

const LocationButton = ({ onClick, isLoading, isAvailable }) => {
  if (!isAvailable) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Detecting...
        </>
      ) : (
        <>
          <Navigation className="w-4 h-4" />
          Use My Location
        </>
      )}
    </button>
  );
};

// Move the form sections outside of the main component
const PersonalDetailsSection = React.memo(({ form, handleChange }) => (
  <div className="space-y-4">
    <SectionHeader icon={User} title="Personal Details" />
    <div className="space-y-4">
      <FormInput label="Full Name" required>
        <Input
          name="name"
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full h-12"
        />
      </FormInput>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Phone Number" required>
          <IconInput icon={Phone} className="pl-10">
            <Input
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              required
              maxLength="10"
              className="w-full h-12"
            />
          </IconInput>
        </FormInput>

        <FormInput label="Email Address">
          <IconInput icon={Mail} className="pl-10">
            <Input
              name="email"
              placeholder="Enter email (optional)"
              value={form.email}
              onChange={handleChange}
              type="email"
              className="w-full h-12"
            />
          </IconInput>
        </FormInput>
      </div>
    </div>
  </div>
));

PersonalDetailsSection.displayName = "PersonalDetailsSection";

const AddressDetailsSection = React.memo(({ 
  form, 
  handleChange, 
  handlePincodeChange,
  loading,
  error,
  states,
  isGeolocationAvailable,
  isGettingLocation,
  getCurrentLocation,
  locationError 
}) => (
  <div className="space-y-4">
    <SectionHeader icon={Map} title="Address Details" />
    
    {/* Location Auto-fill */}
    {isGeolocationAvailable && (
      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Fill address automatically
        </span>
        <LocationButton
          onClick={getCurrentLocation}
          isLoading={isGettingLocation}
          isAvailable={isGeolocationAvailable}
        />
      </div>
    )}

    {locationError && (
      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">
          {locationError}
        </p>
      </div>
    )}

    <div className="space-y-4">
      <FormInput label="House/Flat/Street" required>
        <Input
          name="address_line1"
          placeholder="Enter house number, flat, street"
          value={form.address_line1}
          onChange={handleChange}
          required
          className="w-full h-12"
        />
      </FormInput>

      <FormInput label="Area/Landmark">
        <Input
          name="address_line2"
          placeholder="Enter area, landmark, society"
          value={form.address_line2}
          onChange={handleChange}
          className="w-full h-12"
        />
      </FormInput>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput label="City" required>
          <Input
            name="city"
            placeholder="Enter city"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full h-12"
          />
        </FormInput>

        <FormInput label="State" required>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full h-12 rounded-lg px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading ? "Loading states..." : "Select State"}
            </option>
            {states.map((s) => (
              <option key={s._id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </FormInput>

        <FormInput label="Pincode" required>
          <IconInput icon={Hash} className="pl-10">
            <Input
              name="pincode"
              placeholder="Enter pincode"
              value={form.pincode}
              onChange={handlePincodeChange}
              required
              maxLength="6"
              className="w-full h-12"
            />
          </IconInput>
        </FormInput>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Country">
          <IconInput icon={Globe} className="pl-10">
            <Input
              name="country"
              placeholder="Enter country"
              value={form.country}
              onChange={handleChange}
              className="w-full h-12"
            />
          </IconInput>
        </FormInput>

        <FormInput label="Address Type">
          <select
            name="address_type"
            value={form.address_type}
            onChange={handleChange}
            className="w-full h-12 rounded-lg px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30"
          >
            {ADDRESS_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FormInput>
      </div>
    </div>
  </div>
));

AddressDetailsSection.displayName = "AddressDetailsSection";

const PreferencesSection = React.memo(({ form, handleChange }) => (
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
));

PreferencesSection.displayName = "PreferencesSection";

const FormActions = React.memo(({ isModal, isSubmitting, isEditMode, onClose, handleSubmit }) => (
  isModal ? (
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
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isEditMode ? "Update" : "Save Address"}
          </span>
        )}
      </Button>
    </div>
  ) : (
    <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-4 pb-6">
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {isEditMode ? "Update Address" : "Save Address"}
          </span>
        )}
      </Button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        Fields marked with <span className="text-red-500">*</span> are required
      </p>
    </div>
  )
));

FormActions.displayName = "FormActions";

const AddressForm = ({ onClose, editAddress, isModal = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false);
  const [isGeolocationEnabled, setIsGeolocationEnabled] = useState(false);

  // Memoized values
  const isEditMode = useMemo(() => Boolean(editAddress), [editAddress]);
  const addressTypeIcon = useMemo(() => {
    switch (form.address_type) {
      case "home": return <Home size={18} />;
      case "office": return <Building size={18} />;
      default: return <MapPin size={18} />;
    }
  }, [form.address_type]);

  // Effects
  useEffect(() => {
    if (editAddress) {
      setForm(editAddress);
    }
  }, [editAddress]);

  useEffect(() => {
    const loadStates = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchStates();
        setStates(data);
      } catch (err) {
        setError(err.message || "Failed to load states");
      } finally {
        setLoading(false);
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    const checkGeolocation = () => {
      const isAvailable = "geolocation" in navigator;
      setIsGeolocationAvailable(isAvailable);

      if (!isAvailable) return;

      if (navigator.permissions?.query) {
        navigator.permissions.query({ name: "geolocation" })
          .then((permissionStatus) => {
            setIsGeolocationEnabled(permissionStatus.state === "granted");
            permissionStatus.onchange = () => {
              setIsGeolocationEnabled(permissionStatus.state === "granted");
            };
          })
          .catch(() => {
            setIsGeolocationEnabled(true);
          });
      } else {
        setIsGeolocationEnabled(true);
      }
    };

    checkGeolocation();
  }, []);

  // Handlers
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  }, []);

  // Debounced pincode validation
  const validatePincode = useCallback(
    debounce((pincode) => {
      if (pincode && pincode.length !== 6) {
        setError(prev => prev === "Invalid pincode" ? prev : "Invalid pincode");
      }
    }, 500),
    []
  );

  const handlePincodeChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    handleChange({ target: { name: "pincode", value } });
    if (value.length === 6) {
      validatePincode(value);
    }
  }, [handleChange, validatePincode]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      handleLocationSuccess,
      handleLocationError,
      geolocationOptions
    );
  }, []);

  const handleLocationSuccess = useCallback(async (position) => {
    const { latitude, longitude } = position.coords;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) throw new Error("Failed to fetch address");

      const data = await response.json();
      
      if (data?.address) {
        const { address } = data;
        setForm(prev => ({
          ...prev,
          address_line1: address.road || address.neighbourhood || "",
          address_line2: address.suburb || address.quarter || "",
          city: address.city || address.town || address.village || "",
          state: address.state || "",
          pincode: address.postcode || "",
          country: address.country || "India",
          landmark: address.amenity || "",
        }));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocationError("Failed to get address. Please enter manually.");
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  const handleLocationError = useCallback((error) => {
    setIsGettingLocation(false);

    const errorMessages = {
      [error.PERMISSION_DENIED]: "Please enable location permissions.",
      [error.POSITION_UNAVAILABLE]: "Location information is unavailable.",
      [error.TIMEOUT]: "Location request timed out.",
    };

    setLocationError(
      `Failed to get your location. ${errorMessages[error.code] || "Please enter address manually."}`
    );
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = ['name', 'phone', 'address_line1', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !form[field].trim());
    
    if (missingFields.length > 0) {
      alert(`Please fill all required fields`);
      return false;
    }
    
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return false;
    }
    
    if (form.pincode && form.pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode");
      return false;
    }
    
    return true;
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await dispatch(updateAddress({ id: editAddress._id, data: form }));
      } else {
        await dispatch(createAddress(form));
      }
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [form, isEditMode, editAddress, dispatch, onClose, validateForm]);

  // Main form render
  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalDetailsSection form={form} handleChange={handleChange} />
      <AddressDetailsSection 
        form={form}
        handleChange={handleChange}
        handlePincodeChange={handlePincodeChange}
        loading={loading}
        error={error}
        states={states}
        isGeolocationAvailable={isGeolocationAvailable}
        isGettingLocation={isGettingLocation}
        getCurrentLocation={getCurrentLocation}
        locationError={locationError}
      />
      <PreferencesSection form={form} handleChange={handleChange} />
      <FormActions 
        isModal={isModal}
        isSubmitting={isSubmitting}
        isEditMode={isEditMode}
        onClose={onClose}
        handleSubmit={handleSubmit}
      />
    </form>
  );

  // Modal View
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {isEditMode ? "Edit Address" : "Add New Address"}
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
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
            {renderFormContent()}
          </div>
        </div>
      </div>
    );
  }

  // Mobile Full Screen View
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          disabled={isSubmitting}
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
            {addressTypeIcon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              {isEditMode ? "Edit Address" : "Add Address"}
            </h3>
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="p-4">{renderFormContent()}</div>
    </div>
  );
};

export default React.memo(AddressForm);