import { useState } from "react";
import axios from "axios";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

const ShippingActions = ({ order, fetchOrders }) => {
  const [isLoading, setIsLoading] = useState(false);

  const createShipment = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/orders/${order._id}/create-shipment`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      
      toast({ 
        title: "Shipment created successfully",
        description: "Shipment will be processed automatically.",
        variant: "default",
      });
      
      if (fetchOrders) {
        setTimeout(() => {
          fetchOrders();
        }, 2000); // Wait 2 seconds for backend to process
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Please try again later";
      toast({
        title: "Failed to create shipment",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shipment = order.shipment || {};
  const shippingStatus = shipment.shippingStatus || "NOT_CREATED";

  // Get status info
  const getStatusInfo = () => {
    switch(shippingStatus) {
      case "NOT_CREATED":
        return {
          icon: <Package className="h-5 w-5" />,
          label: "Ready to Ship",
          color: "bg-gray-100 text-gray-800",
          description: "Create shipment to start shipping process",
          showButton: true
        };
      case "CREATED":
        return {
          icon: <Package className="h-5 w-5 text-blue-600" />,
          label: "Shipment Created",
          color: "bg-blue-100 text-blue-800",
          description: "Processing courier assignment automatically",
          showButton: false
        };
      case "COURIER_ASSIGNED":
        return {
          icon: <Truck className="h-5 w-5 text-green-600" />,
          label: "Courier Assigned",
          color: "bg-green-100 text-green-800",
          description: shipment.courier ? `Courier: ${shipment.courier}` : "Courier assigned",
          showButton: false
        };
      case "DELIVERED":
        return {
          icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
          label: "Delivered",
          color: "bg-purple-100 text-purple-800",
          description: shipment.deliveredAt 
            ? `Delivered on ${new Date(shipment.deliveredAt).toLocaleDateString()}`
            : "Package delivered",
          showButton: false
        };
      default:
        return {
          icon: <Package className="h-5 w-5" />,
          label: shippingStatus.replace(/_/g, " "),
          color: "bg-gray-100 text-gray-800",
          description: "Shipment in progress",
          showButton: false
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`p-2 rounded-lg ${statusInfo.color}`}>
            {statusInfo.icon}
          </span>
          <div>
            <h3 className="font-medium text-gray-900">Shipping Status</h3>
            <p className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </p>
          </div>
        </div>
        
        {shipment.shiprocketOrderId && (
          <span className="text-xs text-gray-500">
            ID: {shipment.shiprocketOrderId}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {statusInfo.description}
      </p>

      {/* Show Create Shipment button only for NOT_CREATED status */}
      {statusInfo.showButton && (
        <button
          onClick={createShipment}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Package className="h-4 w-4" />
              Create Shipment
            </>
          )}
        </button>
      )}

      {/* Show tracking button if available */}
      {shipment.trackingUrl && (
        <a
          href={shipment.trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Truck className="h-4 w-4" />
          Track Shipment
        </a>
      )}

      {/* Additional info */}
      <div className="mt-4  text-sm">
        {shipment.awb && (
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">AWB:</span>
            <span className="font-medium">{shipment.awb}</span>
          </div>
        )}
{/*         
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Order Date:</span>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery City:</span>
          <span>{order.address?.city || "N/A"}</span>
        </div> */}
      </div>
    </div>
  );
};

export default ShippingActions;