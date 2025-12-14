import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const ProductFilters = ({
  category,
  setCategory,
  categories,
  searchTerm,
  setSearchTerm,
  price,
  setPrice,
}) => {
  return (
    <form className="flex flex-wrap gap-4 items-end w-full mb-6">
  {/* Search */}
  <div className="flex-grow min-w-[250px]">
    <Label>Search Products</Label>
    <div className="relative">
      <Input
        type="text"
        placeholder="Search by name or description"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
    </div>
  </div>

  {/* Category */}
  <div className="w-[180px]">
    <Label>Category</Label>
    <Select value={category} onValueChange={setCategory}>
      <SelectTrigger>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c._id} value={c.slug}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* Max Price */}
  <div className="w-[140px]">
    <Label>Max Price (₹)</Label>
    <Input
      type="number"
      placeholder="No max"
      min="0"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
    />
  </div>
</form>

  );
};

export default ProductFilters;
