import React, { useState } from "react";
import { Card } from "../ui/card";
import { IndianRupee } from "lucide-react";
import axios from "axios";
import { CancelOrderDialog } from "../CancelOrderDialog";

const OrderData = ({
  products = [],
  amount = 0,
  status = "PLACED",
  createdAt,
  _id,
}) => {
  const orderId = _id;
  const [trackingData, setTrackingData] = useState([]);

  const handleTrackOrder = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/track/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTrackingData(res.data.tracking || []);
    } catch {
      alert("Failed to fetch tracking data");
    }
  };

  return (
    <Card className="grid gap-3 p-3">
      {/* PRODUCTS */}
      {products.map((product, idx) => {
        const itemTotal =
          (product.price || 0) * (product.quantity || 0);

        const saved =
          ((product.originalPrice || product.price) - product.price) *
          product.quantity;

        return (
          <div
            key={product.productId || idx}
            className="flex flex-col sm:flex-row justify-between items-end sm:items-center border p-3 rounded-lg bg-gray-100 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-2">
              <img
                src={product.image || "/placeholder.png"}
                alt={product.name}
                className="w-20 h-20 rounded-lg object-cover"
              />

              <div className="grid gap-1">
                <h1 className="font-semibold text-sm sm:text-lg">
                  {product.name}
                </h1>

                <p className="flex text-xs sm:text-sm gap-2 text-gray-500">
                  {product.color && (
                    <span>
                      Color:{" "}
                      <span
                        className="inline-block w-4 h-2 rounded-full border"
                        style={{ backgroundColor: product.color }}
                      />
                    </span>
                  )}
                  <span className="hidden sm:block">|</span>
                  <span>Status: {status}</span>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col gap-3 sm:gap-0 mt-2 sm:mt-0 sm:items-center">
              <h2 className="text-md sm:text-xl font-bold flex items-center dark:text-customYellow">
                <IndianRupee size={18} />
                {itemTotal.toFixed(2)}
              </h2>

              <p className="text-sm text-gray-500">
                Qty: {product.quantity}
              </p>

              {saved > 0 && (
                <p className="text-xs text-green-600">
                  Saved ₹{saved.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* ORDER SUMMARY */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-2 font-semibold">
        <span>
          Ordered On:{" "}
          {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
        </span>
        <span className="flex items-center gap-1 dark:text-customYellow">
          Total: <IndianRupee size={14} /> {amount.toFixed(2)}
        </span>
      </div>

      <hr className="my-2" />

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        {["PLACED", "CONFIRMED"].includes(status) && (
          <CancelOrderDialog orderId={orderId} />
        )}

        <button
          onClick={handleTrackOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          Track Order
        </button>
      </div>

      {/* TRACKING */}
      {trackingData.length > 0 && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-zinc-700 rounded">
          <h2 className="font-semibold">Tracking Status:</h2>
          <ul className="list-disc ml-5">
            {trackingData.map((step, idx) => (
              <li key={idx}>
                <strong>{step.status}</strong> at{" "}
                {new Date(step.updated_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default OrderData;
