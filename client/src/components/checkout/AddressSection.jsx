import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, setAddress } from "@/redux/slices/checkoutSlice";
import AddressForm from "@/components/checkout/AddressForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const AddressSection = () => {
  const dispatch = useDispatch();
  const { addresses, addressId } = useSelector((s) => s.checkout);

  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  return (
    <Card className="p-4 space-y-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Delivery Address
        </h2>

        <Button size="sm" onClick={() => { setEditAddress(null); setShowForm(true); }}>
          + Add
        </Button>
      </div>

      {/* Address list */}
      <div className="space-y-3">
        {addresses.map((addr) => {
          const selected = addressId === addr._id;

          return (
            <div
              key={addr._id}
              className={`
                rounded-lg p-4 transition
                border
                ${selected
                  ? "border-black dark:border-white ring-2 ring-black dark:ring-white bg-gray-50 dark:bg-zinc-800"
                  : "border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Select */}
                <label
                  onClick={() => dispatch(setAddress(addr._id))}
                  className="flex gap-3 cursor-pointer flex-1"
                >
                  <input
                    type="radio"
                    checked={selected}
                    readOnly
                    className="mt-1 accent-black dark:accent-white"
                  />

                  <div className="space-y-1 text-sm">
                    {/* Name */}
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {addr.name}
                      </p>

                      {selected && (
                        <span className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle size={14} /> Selected
                        </span>
                      )}
                    </div>

                    {/* Address lines */}
                    <p className="text-gray-700 dark:text-gray-300">
                      {addr.address_line1}
                      {addr.address_line2 && `, ${addr.address_line2}`}
                    </p>

                    <p className="text-gray-700 dark:text-gray-300">
                      {addr.city}, {addr.state} – {addr.pincode}
                    </p>

                    <p className="text-gray-600 dark:text-gray-400">
                      {addr.country}
                    </p>

                    {/* Meta */}
                    <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>📞 {addr.phone}</span>
                      <span className="capitalize">🏠 {addr.address_type}</span>
                    </div>
                  </div>
                </label>

                {/* Edit */}
                <Button
                  size="xs"
                  variant="outline"
                  className="border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-gray-200"
                  onClick={() => {
                    setEditAddress(addr);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Address Form */}
      {showForm && (
        <AddressForm
          onClose={() => setShowForm(false)}
          editAddress={editAddress}
        />
      )}
    </Card>
  );
};

export default AddressSection;
