import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import axios from "axios";

import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import ProductDeleteDialog from "@/components/ProductDeleteDialog";
import Pagination from "@/components/Pagination";
import EditProductDialog from "@/components/Admin/EditProductDialog";

import { useAdminProducts } from "@/hooks/useAdminProducts";
import { setProducts } from "@/redux/slices/productSlice";
import { useToast } from "@/hooks/use-toast";
import useErrorLogout from "@/hooks/use-error-logout";
import { useNavigate } from "react-router-dom";

const AllProducts = () => {
  

const navigate = useNavigate();


  const { products } = useSelector((s) => s.product);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();

  const {
    categories,
    category,
    setCategory,
    searchTerm,
    setSearchTerm,
    price,
    setPrice,
    page,
    setPage,
    totalPages,
    refreshProducts,
  } = useAdminProducts();

  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/delete-product/${deleteId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast({ title: res.data.message || "Product deleted" });

      dispatch(setProducts(products.filter((p) => p._id !== deleteId)));
      setDeleteId(null);
    } catch (err) {
      handleErrorLogout(err, "Failed to delete product");
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 pb-16">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      {/* Filters */}
      <ProductFilters
        categories={categories}
        category={category}
        setCategory={setCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        price={price}
        setPrice={setPrice}
      />

      {/* TABLE */}
      {/* PRODUCTS */}
{products.length === 0 ? (
  <p className="text-center text-gray-500 mt-8">
    No products found.
  </p>
) : (
  <>
    {/* ===== MOBILE VIEW ===== */}
    <div className="flex flex-col gap-4 md:hidden mt-6">
      {products.map((p) => (
        <ProductCardRow
          key={p._id}
          product={p}
          onEdit={setEditProduct}
          onDelete={setDeleteId}
        />
      ))}
    </div>

    {/* ===== DESKTOP TABLE ===== */}
    <div className="hidden md:block mt-6 border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((p) => (
            <TableRow
              key={p._id}
              className="cursor-pointer"
              onClick={() => navigate(`/admin/products/${p._id}`)}
            >
              <TableCell>
                <img
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  alt={p.name}
                  className="w-12 h-12 rounded-md object-cover border"
                />
              </TableCell>

              <TableCell className="font-medium">
                {p.name}
              </TableCell>

              <TableCell>
                {p.category?.name || "-"}
              </TableCell>

              <TableCell>₹{p.price}</TableCell>

              <TableCell>
                {p.stock > 0 ? (
                  <span className="text-green-600 font-semibold">
                    {p.stock}
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    Out of stock
                  </span>
                )}
              </TableCell>

              <TableCell>
                {p.blacklisted ? (
                  <span className="text-red-600">Inactive</span>
                ) : (
                  <span className="text-green-600">Active</span>
                )}
              </TableCell>

              <TableCell
                className="text-right space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditProduct(p)}
                >
                  <Pencil size={14} />
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteId(p._id)}
                >
                  <Trash2 size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>
)}


      {/* Pagination */}
      {/* DESKTOP */}
<div className="hidden md:block">
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    onPageChange={setPage}
  />
</div>

{/* MOBILE */}
{page < totalPages && (
  <div className="md:hidden flex justify-center mt-6">
    <Button
      variant="outline"
      onClick={() => setPage((p) => p + 1)}
    >
      Load more
    </Button>
  </div>
)}


      {/* Delete Dialog */}
      <ProductDeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      {/* Edit Dialog */}
      <EditProductDialog
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        categories={categories}
        onSave={() => {
          refreshProducts();
          setEditProduct(null);
        }}
      />
    </div>
  );
};

export default AllProducts;


const ProductCardRow = ({ product, onEdit, onDelete }) => {
  return (
    <div className="border rounded-lg p-4 flex gap-4 items-start">
      <img
        src={product.images?.[0]?.url || "/placeholder.png"}
        alt={product.name}
        className="w-16 h-16 rounded-md object-cover border shrink-0"
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground">
          {product.category?.name || "-"}
        </p>

        <div className="mt-2 flex justify-between items-center">
          <span className="font-semibold">
            ₹{product.price}
          </span>

          <span
            className={`text-xs font-semibold ${
              product.stock > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(product)}
          >
            <Pencil size={14} />
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(product._id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
