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

const AllProducts = () => {
  const { products } = useSelector((s) => s.product);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();

  // ---- HOOK: FILTERS + PAGINATION ----
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

  // ---- STATE: Edit & Delete ----
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // ---- DELETE HANDLER ----
  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/delete-product/${deleteId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast({ title: res.data.message || "Product deleted" });

      // remove UI instantly
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

      {/* Grid */}
      {products.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No products found.</p>
      ) : (
       <div className="grid gap-6 mt-6 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">


          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onEdit={() => setEditProduct(p)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

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
