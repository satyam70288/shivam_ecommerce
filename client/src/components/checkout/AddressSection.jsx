import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, setAddress } from "@/redux/slices/checkoutSlice";
import AddressForm from "@/components/checkout/AddressForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  MapPin,
  Home,
  Building,
  Phone,
  Edit2,
  Plus,
  X,
  ChevronRight,
  Globe,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Custom hook for checking screen size
const useMediaQuery = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isDesktop;
};

const AddressSection = () => {
  const dispatch = useDispatch();
  const { addresses, addressId } = useSelector((s) => s.checkout);
  
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(); // Using our custom hook
  
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [expandedAddressId, setExpandedAddressId] = useState(null);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleAddAddress = () => {
    setEditAddress(null);
    if (isDesktop) {
      // Desktop: Open modal
      setShowForm(true);
    } else {
      // Mobile: Navigate to separate page or open full-screen modal
      // Option 1: Navigate to separate page
      // navigate("/checkout/address/new");
      
      // Option 2: Open full-screen modal (simpler)
      setIsMobileFormOpen(true);
    }
  };

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "home":
        return <Home size={18} className="text-blue-600 dark:text-blue-400" />;
      case "office":
        return (
          <Building
            size={18}
            className="text-purple-600 dark:text-purple-400"
          />
        );
      default:
        return (
          <MapPin size={18} className="text-gray-600 dark:text-gray-400" />
        );
    }
  };

  const toggleAddressExpand = (addressId, e) => {
    e.stopPropagation();
    setExpandedAddressId(expandedAddressId === addressId ? null : addressId);
  };

  const handleEditAddress = (addr) => {
    setEditAddress(addr);
    if (isDesktop) {
      setShowForm(true);
    } else {
      setIsMobileFormOpen(true);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsMobileFormOpen(false);
    setEditAddress(null);
  };

  return (
    <>
      <Card className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                Delivery Address
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Select or add a delivery address
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md w-full sm:w-auto text-sm md:text-base"
            onClick={handleAddAddress}
          >
            <Plus size={16} className="mr-1 md:mr-2" />
            Add New Address
          </Button>
        </div>

        {/* Address list */}
        <div className="space-y-3 md:space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-6 md:py-8 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl px-4">
              <MapPin className="w-10 h-10 md:w-12 md:h-12 text-gray-400 dark:text-zinc-600 mx-auto mb-2 md:mb-3" />
              <h3 className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                No Address Found
              </h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4">
                Add an address to deliver your order
              </p>
              <Button
                onClick={handleAddAddress}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base w-full sm:w-auto"
              >
                <Plus size={14} className="mr-1 md:mr-2" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            addresses.map((addr) => {
              const selected = addressId === addr._id;
              const isExpanded = expandedAddressId === addr._id;

              return (
                <div
                  key={addr._id}
                  className={`
                    rounded-xl p-3 md:p-5 transition-all duration-300 cursor-pointer
                    border-2
                    ${
                      selected
                        ? "border-blue-500 dark:border-blue-400 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 shadow-lg"
                        : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-md "
                    }
                  `}
                  onClick={() => dispatch(setAddress(addr._id))}
                >
                  <div className="flex items-start justify-between gap-2 md:gap-4">
                    {/* Left Content */}
                    <div className="flex gap-2 md:gap-4 flex-1 min-w-0">
                      {/* Selection Indicator */}
                      <div className="mt-0.5 md:mt-1 flex-shrink-0">
                        <div
                          className={`
                          w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center
                          ${
                            selected
                              ? "border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400"
                              : "border-gray-300 dark:border-zinc-600 "
                          }
                        `}
                        >
                          {selected && (
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>

                      {/* Address Details */}
                     <div className="space-y-2 md:space-y-4 flex-1 min-w-0">
  {/* Name & Badge - Top Row */}
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 md:gap-4 min-w-0">
      <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
        <div className="text-blue-600 dark:text-blue-400">
          {getAddressIcon(addr.address_type)}
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-base md:text-lg font-sans tracking-tight">
          {addr.name}
        </h3>
        <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30">
          {addr.address_type || "Other"}
        </span>
      </div>
    </div>

    {/* Mobile Expand Button */}
    <button
      onClick={(e) => toggleAddressExpand(addr._id, e)}
      className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
    >
      <ChevronRight
        className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
          isExpanded ? "rotate-90" : ""
        }`}
      />
    </button>

    {selected && (
      <span className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
        <CheckCircle size={18} className="flex-shrink-0" />
        Selected
      </span>
    )}
  </div>

  {/* Selected badge for mobile */}
  {selected && (
    <div className="md:hidden inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full w-fit">
      <CheckCircle size={14} className="flex-shrink-0" />
      Selected
    </div>
  )}

  {/* Main Address (Always visible) */}
  <div className="space-y-1.5 md:space-y-2">
    <p className="text-gray-800 dark:text-gray-100 font-semibold text-sm md:text-base font-sans line-clamp-1 tracking-wide">
      {addr.address_line1}
    </p>
    <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm font-medium tracking-wide">
      {addr.city}, {addr.state} - {addr.pincode}
    </p>
  </div>

  {/* Expanded Details (Mobile) or Always Visible (Desktop) */}
  {(isExpanded || window.innerWidth >= 768) && (
    <div className="space-y-2.5 md:space-y-3 pt-3 md:pt-4 border-t border-gray-100 dark:border-zinc-800/50">
      {/* Full Address Lines */}
      {addr.address_line2 && (
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-medium tracking-wide">
            {addr.address_line2}
          </p>
        </div>
      )}
      
      <div className="flex items-start gap-2">
        <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">
          {addr.country}
        </p>
      </div>

      {/* Contact Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5 pt-3 md:pt-4">
        <div className="inline-flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full">
            <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200 tracking-tight">
            {addr.phone}
          </span>
        </div>
        
        {addr.email && (
          <div className="inline-flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg">
            <div className="p-1.5 bg-rose-100 dark:bg-rose-900/40 rounded-full">
              <Mail className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200 tracking-tight truncate">
              {addr.email}
            </span>
          </div>
        )}
      </div>
    </div>
  )}
</div>
                    </div>

                    {/* Edit Button - Desktop */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hidden md:flex text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(addr);
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                  </div>

                  {/* Mobile Edit Button and Expanded Content */}
                  <div className="flex items-center justify-between mt-2 md:mt-0 pt-2 border-t border-gray-100 dark:border-zinc-800 md:border-0">
                    {/* Mobile Edit Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="md:hidden text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(addr);
                      }}
                    >
                      <Edit2 size={12} className="mr-1" />
                      Edit
                    </Button>

                    {/* Mobile View More/Less */}
                    {isExpanded && (
                      <button
                        onClick={(e) => toggleAddressExpand(addr._id, e)}
                        className="md:hidden text-xs text-blue-600 dark:text-blue-400 font-medium"
                      >
                        View Less
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Desktop Modal Form */}
      {showForm && isDesktop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60">
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
                  onClick={handleCloseForm}
                  className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <AddressForm
                editAddress={editAddress}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full Screen Form */}
      {isMobileFormOpen && !isDesktop && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
            <button
              onClick={handleCloseForm}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {editAddress ? "Edit Address" : "Add Address"}
              </h3>
            </div>
            <div className="w-10"></div>
          </div>
          
          <div className="p-4">
            <AddressForm
              editAddress={editAddress}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AddressSection;