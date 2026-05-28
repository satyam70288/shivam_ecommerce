import { useState } from "react";
import { Truck, FileText, Tag, ExternalLink, Loader2 } from "lucide-react";
import { orderApi } from "@/api/orderApi";
import TrackingSection from "./TrackingSection";

export default function ShiprocketOrderActions({ orderId, shipment, status }) {
  const [tracking, setTracking] = useState(null);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [error, setError] = useState(null);

  const token = () => localStorage.getItem("token");

  const openUrl = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleTrack = async () => {
    if (showTracking) {
      setShowTracking(false);
      return;
    }
    if (shipment?.trackingUrl && !tracking) {
      setShowTracking(true);
      return;
    }
    try {
      setLoadingTrack(true);
      setError(null);
      const data = await orderApi.trackOrder(orderId, token());
      setTracking(data);
      setShowTracking(true);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Tracking unavailable");
    } finally {
      setLoadingTrack(false);
    }
  };

  const fetchDoc = async (type) => {
    try {
      setLoadingDoc(type);
      setError(null);
      const url =
        type === "label"
          ? await orderApi.getShiprocketLabel(orderId, token())
          : await orderApi.getShiprocketInvoice(orderId, token());
      if (url) openUrl(url);
      else setError(`${type === "label" ? "Label" : "Invoice"} not ready yet`);
    } catch (e) {
      setError(e.response?.data?.message || "Document not available");
    } finally {
      setLoadingDoc(null);
    }
  };

  if (!shipment) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Shipment will be created on Shiprocket when your order is processed. Tracking
        and documents will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          Shiprocket Shipping
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
          {shipment.courier && (
            <p>
              Courier: <span className="font-medium text-foreground">{shipment.courier}</span>
            </p>
          )}
          {shipment.awb && (
            <p>
              AWB: <span className="font-medium text-foreground">{shipment.awb}</span>
            </p>
          )}
          {shipment.shippingStatus && (
            <p>
              Status:{" "}
              <span className="font-medium text-foreground">
                {shipment.shippingStatus.replace(/_/g, " ")}
              </span>
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleTrack}
            disabled={loadingTrack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 text-sm font-medium disabled:opacity-50"
          >
            {loadingTrack ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Truck className="w-4 h-4" />
            )}
            {showTracking ? "Hide tracking" : "Track shipment"}
          </button>

          {shipment.trackingUrl && (
            <a
              href={shipment.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg brand-gradient-bg text-primary-foreground text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open on Shiprocket
            </a>
          )}

          <button
            type="button"
            onClick={() => fetchDoc("label")}
            disabled={loadingDoc === "label"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium disabled:opacity-50"
          >
            {loadingDoc === "label" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Tag className="w-4 h-4" />
            )}
            Shipping label
          </button>

          <button
            type="button"
            onClick={() => fetchDoc("invoice")}
            disabled={loadingDoc === "invoice"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium disabled:opacity-50"
          >
            {loadingDoc === "invoice" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Invoice (Shiprocket)
          </button>

          {shipment.labelUrl && (
            <button
              type="button"
              onClick={() => openUrl(shipment.labelUrl)}
              className="text-sm text-primary underline"
            >
              Saved label PDF
            </button>
          )}
          {shipment.invoiceUrl && (
            <button
              type="button"
              onClick={() => openUrl(shipment.invoiceUrl)}
              className="text-sm text-primary underline"
            >
              Saved invoice PDF
            </button>
          )}
        </div>
      </div>

      {showTracking && (
        <div className="rounded-xl border border-border p-4">
          {tracking?.currentStatus && (
            <p className="text-sm font-medium text-foreground mb-3">
              Current: {tracking.currentStatus}
            </p>
          )}
          <TrackingSection trackingData={tracking?.history || []} />
        </div>
      )}
    </div>
  );
}
