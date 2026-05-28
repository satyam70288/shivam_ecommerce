import { useState } from "react";
import axios from "axios";
import {
  Package,
  Truck,
  CheckCircle,
  Tag,
  FileText,
  RefreshCw,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API = () => import.meta.env.VITE_API_URL;
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const ShippingActions = ({ order, fetchOrders }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(null);

  const shipment = order.shipment || {};
  const shippingStatus = shipment.shippingStatus || "NOT_CREATED";
  const orderId = order._id;

  const post = async (path, key) => {
    setIsLoading(key);
    try {
      const res = await axios.post(`${API()}${path}`, {}, { headers: authHeader() });
      toast({
        title: "Success",
        description: res.data?.message || "Done",
      });
      if (fetchOrders) setTimeout(fetchOrders, 1500);
      return res.data;
    } catch (err) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(null);
    }
  };

  const createShipment = () =>
    post(`/admin/orders/${orderId}/create-shipment`, "create");

  const assignCourier = () =>
    post(`/admin/orders/${orderId}/assign-courier`, "assign");

  const refreshDocs = () =>
    post(`/admin/orders/${orderId}/refresh-shiprocket-docs`, "refresh");

  const openUrl = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const getStatusInfo = () => {
    switch (shippingStatus) {
      case "NOT_CREATED":
        return {
          icon: <Package className="h-5 w-5" />,
          label: "Ready to Ship",
          color: "bg-gray-100 text-gray-800",
          description: "Create Shiprocket order to start shipping",
        };
      case "CREATED":
        return {
          icon: <Package className="h-5 w-5 text-blue-600" />,
          label: "On Shiprocket",
          color: "bg-blue-100 text-blue-800",
          description: "Assign AWB / courier if not done automatically",
        };
      case "COURIER_ASSIGNED":
        return {
          icon: <Truck className="h-5 w-5 text-green-600" />,
          label: "Courier Assigned",
          color: "bg-green-100 text-green-800",
          description: shipment.courier
            ? `Courier: ${shipment.courier}`
            : "AWB assigned — download label & invoice",
        };
      case "DELIVERED":
        return {
          icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
          label: "Delivered",
          color: "bg-purple-100 text-purple-800",
          description: "Package delivered",
        };
      default:
        return {
          icon: <Package className="h-5 w-5" />,
          label: shippingStatus.replace(/_/g, " "),
          color: "bg-gray-100 text-gray-800",
          description: "Shipment in progress",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const busy = (key) => isLoading === key;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`p-2 rounded-lg ${statusInfo.color}`}>
            {statusInfo.icon}
          </span>
          <div>
            <h3 className="font-medium text-gray-900">Shiprocket</h3>
            <p className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </p>
          </div>
        </div>
        {shipment.shiprocketOrderId && (
          <span className="text-xs text-gray-500">
            SR #{shipment.shiprocketOrderId}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">{statusInfo.description}</p>

      <div className="flex flex-wrap gap-2">
        {shippingStatus === "NOT_CREATED" && (
          <button
            type="button"
            onClick={createShipment}
            disabled={!!isLoading}
            className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy("create") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Package className="h-4 w-4" />
            )}
            Create on Shiprocket
          </button>
        )}

        {shippingStatus !== "NOT_CREATED" && !shipment.awb && (
          <button
            type="button"
            onClick={assignCourier}
            disabled={!!isLoading}
            className="flex-1 min-w-[140px] border border-blue-600 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy("assign") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            Assign AWB
          </button>
        )}

        {shippingStatus !== "NOT_CREATED" && (
          <button
            type="button"
            onClick={refreshDocs}
            disabled={!!isLoading}
            className="flex-1 min-w-[140px] border border-gray-300 py-2 px-3 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy("refresh") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh docs
          </button>
        )}
      </div>

      {(shipment.labelUrl ||
        shipment.invoiceUrl ||
        shipment.trackingUrl ||
        shipment.awb) && (
        <div className="mt-4 pt-4 border-t space-y-2 text-sm">
          {shipment.awb && (
            <div className="flex justify-between">
              <span className="text-gray-600">AWB</span>
              <span className="font-medium">{shipment.awb}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {shipment.trackingUrl && (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Track
              </a>
            )}
            {shipment.labelUrl && (
              <button
                type="button"
                onClick={() => openUrl(shipment.labelUrl)}
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                <Tag className="h-3.5 w-3.5" />
                Label PDF
              </button>
            )}
            {shipment.invoiceUrl && (
              <button
                type="button"
                onClick={() => openUrl(shipment.invoiceUrl)}
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                Invoice PDF
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingActions;
