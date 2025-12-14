import React, { useState } from "react";
import { Card } from "../ui/card";
import { ArrowDownToLine, IndianRupee } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import axios from "axios";
import { CancelOrderDialog } from "../CancelOrderDialog";

const OrderData = ({
  products = [],
  companyInfo = {
    name: "Swag Fashion",
    addressLines: [
      "Parshv Elite Building No.1, Birwadi Road",
      "Umroli East, Palghar, Maharashtra - 401404",
    ],
  },
  gstNumber = "29ABCDE1234F2Z5",
  panNumber = "ABCDE1234F",
  amount = 0,
  address = {},
  status = "pending",
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
  _id,                 // 👈 backend se aa raha
  orderNumber = "ORD123456",
  invoiceNumber = "INV123456",
  isCancelled,
  isPaid = true,
}) => {
  const orderId = _id;   // 👈 YAHAN FIX
  const [trackingData, setTrackingData] = useState([]);

  const handleTrackOrder = async (orderId) => {
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
    } catch (error) {
      console.error(error);
      alert("Failed to fetch tracking data");
    }
  };

  return (
    <div>
      <Card className="grid gap-3 p-3">
        {/* Products */}
        {products.map((product, idx) => (
          <div
            key={product.productId || idx}
            className="flex flex-col sm:flex-row justify-between items-end sm:items-center border p-3 rounded-lg bg-gray-100 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-2">
              <img
                src={product.image || "/placeholder.png"}
                alt={product.name || "Product"}
                className="w-20 h-20 rounded-lg object-cover"
              />

              <div className="grid gap-1">
                <h1 className="font-semibold text-sm sm:text-lg">
                  {product.name || "Unknown Product"}
                </h1>

                <p className="flex text-xs sm:text-sm gap-2 text-gray-500">
                  <span>
                    Color:{" "}
                    <span
                      className="inline-block w-4 h-2 rounded-full border border-gray-300"
                      style={{
                        backgroundColor:
                          product.color && product.color !== "Default"
                            ? product.color
                            : "#e5e7eb",
                      }}
                    />
                  </span>
                  <span className="hidden sm:block">|</span>
                  <span>
                    Status: <span className="capitalize">{status}</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col gap-3 sm:gap-0 mt-2 sm:mt-0 sm:items-center">
              <h2 className="text-md sm:text-xl font-bold flex items-center dark:text-customYellow">
                <IndianRupee size={18} />{" "}
                {(product.price * product.quantity).toFixed(2)}
              </h2>
              <p className="dark:text-customYellow text-end">
                Qty: {product.quantity}
              </p>
            </div>
          </div>
        ))}

        {/* Order Summary */}
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

        {/* Delivery Address */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <span>
            Delivery At:{" "}
            {address?.name ? (
              <>
                {address.name}, {address.address_line1},{" "}
                {address.city}, {address.state} - {address.pincode},{" "}
                {address.country}
                <br />
                Phone: {address.phone}, Email: {address.email}
              </>
            ) : (
              "N/A"
            )}
          </span>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0 items-start sm:items-center">
            {status !== "Exchange" && (
              <CancelOrderDialog
                orderId={orderId}
                isCancelled={isCancelled}
              />
            )}

            <button
              onClick={() => handleTrackOrder(orderId)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:scale-105"
            >
              Track Order
            </button>
          </div>
        </div>

        {/* Tracking Status */}
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
    </div>
  );
};


export default OrderData;
