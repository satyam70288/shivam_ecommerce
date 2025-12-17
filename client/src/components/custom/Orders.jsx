import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import OrderProductTile from "./OrderProductTile";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const { handleErrorLogout } = useErrorLogout();

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/get-all-orders`,
        {
          params: {
            page: currentPage,
            limit: 10,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      handleErrorLogout(error, error.response?.data?.message);
    }
  };

  fetchOrders();
}, [currentPage]);


 return (
  <>
    <h1 className="text-3xl font-bold mb-6 ml-3">Orders</h1>

    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-2">
      {orders.length === 0 ? (
        <h2 className="text-muted-foreground text-xl ml-3">
          No orders found
        </h2>
      ) : (
        orders.map((order) => (
          <Card
            key={order._id}
            className="p-5 rounded-2xl shadow-sm border space-y-4"
          >
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Order ID
                </p>
                <p className="font-mono text-sm">{order._id}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-lg font-semibold">
                  ₹{order.totalAmount}
                </p>

                <Select
                  value={order.status}
                  onValueChange={(value) => {
                    if (window.confirm("Update order status?")) {
                      updateOrderStatus(value, order._id);
                    }
                  }}
                >
                  <SelectTrigger className="w-[150px] capitalize">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="capitalize">
                    <SelectItem value="PLACED">Placed</SelectItem>
                    <SelectItem value="PACKED">Packed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <hr />

            {/* PRODUCTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {order.items.map((product) => (
                <OrderProductTile
                  key={product.productId}
                  {...product}
                />
              ))}
            </div>

            <hr />

            {/* INFO GRID */}
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {/* LEFT */}
              <div className="space-y-1">
                <p className="font-semibold">Shipping Address</p>
                <p className="text-muted-foreground">
                  {order.address?.name} <br />
                  {order.address?.phone} <br />
                  {order.address?.addressLine1},{" "}
                  {order.address?.city},{" "}
                  {order.address?.state} -{" "}
                  {order.address?.pincode}
                </p>
              </div>

              {/* RIGHT */}
              <div className="space-y-1">
                <p>
                  <b>User:</b> {order.user?.name}
                </p>
                <p className="text-muted-foreground">
                  {order.user?.email}
                </p>

                <p>
                  <b>Payment:</b>{" "}
                  <span className="capitalize">
                    {order.payment.method}
                  </span>{" "}
                  ({order.payment.status})
                </p>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  </>
);

};

export default Orders;
