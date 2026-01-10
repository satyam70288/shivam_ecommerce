import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setProduct(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
 
  // 🔥 IMPORTANT GUARDS
  if (loading) {
    return <p>Loading product...</p>;
  }

  if (!product) {
    return <p>Product not found</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost">← Back</Button>
          <h1 className="text-2xl font-bold mt-2">{product.name}</h1>
        </div>

        <div className="flex gap-2">
          <Button>Edit</Button>
          <Button variant="outline">
            {product.blacklisted ? "Unlist" : "Blacklist"}
          </Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>

      <Separator />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* PRODUCT INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <b>Material:</b> {product.material || "—"}
              </p>

              <p>
                <b>Age Group:</b>{" "}
                {product.ageGroup?.length ? product.ageGroup.join(", ") : "—"}
              </p>

              <p>
                <b>Colors:</b>{" "}
                {product.colors?.length ? product.colors.join(", ") : "—"}
              </p>

              <p>
                <b>Sizes:</b>{" "}
                {product.sizes?.length ? product.sizes.join(", ") : "—"}
              </p>
            </CardContent>
          </Card>

          {/* PRICING */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Original</p>
                <p className="font-semibold">₹{product.price}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discount</p>
                <p className="font-semibold">{product.discount}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Final</p>
                <p className="font-bold text-green-600">
                  ₹{product.finalPrice}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* IMAGES */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.images?.map((img) => (
                <img
                  key={img._id}
                  src={img.url}
                  className="rounded-lg border object-cover h-32 w-full"
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* STATUS */}
          <Card>
            <CardHeader>
              <CardTitle>Offer & Discount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <b>Offer Active:</b> {product.isOfferActive ? "Yes" : "No"}
              </p>
              <p>
                <b>Offer Title:</b> {product.offerTitle || "—"}
              </p>
              <p>
                <b>Offer Description:</b> {product.offerDescription || "—"}
              </p>

              <p>
                <b>Valid From:</b>{" "}
                {product.offerValidFrom
                  ? new Date(product.offerValidFrom).toLocaleDateString()
                  : "—"}
              </p>

              <p>
                <b>Valid Till:</b>{" "}
                {product.offerValidTill
                  ? new Date(product.offerValidTill).toLocaleDateString()
                  : "—"}
              </p>
            </CardContent>
          </Card>

          {/* INVENTORY */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Stock: <b>{product.stock}</b>
              </p>
              {product.stock < 10 && <Badge variant="warning">Low Stock</Badge>}
            </CardContent>
          </Card>

          {/* META */}
          <Card>
            <CardHeader>
              <CardTitle>Flags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {product.isFeatured && <Badge>Featured</Badge>}
              {product.isNewArrival && <Badge>New Arrival</Badge>}
              {product.isBestSeller && <Badge>Best Seller</Badge>}

              {!product.isFeatured &&
                !product.isNewArrival &&
                !product.isBestSeller && (
                  <span className="text-sm text-muted-foreground">
                    No flags set
                  </span>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <b>Tags:</b>{" "}
                {product.tags?.length ? product.tags.join(", ") : "—"}
              </p>
              <p>
                <b>Keywords:</b>{" "}
                {product.keywords?.length ? product.keywords.join(", ") : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetails;
