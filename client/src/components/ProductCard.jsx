import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const image =
    product.productType === "simple"
      ? product.images?.[0]?.url
      : product.variants?.[0]?.images?.[0]?.url;

  return (
    <Card className="flex flex-col">
      <div className="aspect-square relative">
        <img
          src={image || "/placeholder.png"}
          alt={product.name}
          className="rounded-t-lg object-cover w-full h-full"
        />
      </div>

      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        <p className="text-lg font-bold mt-2">₹{(product.price || 0).toFixed(2)}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" onClick={() => onEdit(product)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={() => onDelete(product._id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
