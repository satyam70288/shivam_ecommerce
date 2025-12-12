import { Checkbox } from "@/components/ui/checkbox";
import { Tag, Layers, ShoppingBag, PackageOpen, Star } from "lucide-react";

const categories = [
  { label: "Fashion", icon: <Tag size={16} /> },
  { label: "Electronics", icon: <Layers size={16} /> },
  { label: "Bags", icon: <ShoppingBag size={16} /> },
  { label: "Footwear", icon: <PackageOpen size={16} /> },
  { label: "Groceries", icon: <Layers size={16} /> },
  { label: "Beauty", icon: <Star size={16} /> },
];

export default function FiltersSidebar() {
  return (
    <div className="space-y-10">

      {/* CATEGORY */}
      <FilterCard title="Shop by Category">
        <div className="space-y-3">
          {categories.map((cat) => (
            <label
              key={cat.label}
              className="
                flex items-center gap-3 text-sm cursor-pointer
                text-gray-700 dark:text-zinc-300
                hover:text-red-500 transition-all
              "
            >
              <Checkbox className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" />
              <span className="flex items-center gap-2">{cat.icon}{cat.label}</span>
            </label>
          ))}
        </div>
      </FilterCard>

      {/* PRICE */}
      <FilterCard title="Price Range">
        <div className="flex justify-between text-sm text-gray-500 dark:text-zinc-400">
          <span>₹0</span>
          <span>₹60,000</span>
        </div>
        <div className="mt-2 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full">
          <div className="h-1 bg-red-500 rounded-full w-1/2"></div>
        </div>
      </FilterCard>

      {/* RATINGS */}
      <FilterCard title="Ratings">
        <div className="space-y-3">
          {[5, 4, 3].map((r) => (
            <label
              key={r}
              className="flex items-center gap-3 cursor-pointer text-sm text-gray-600 dark:text-zinc-400 hover:text-yellow-500"
            >
              <Checkbox />
              <span className="text-yellow-400">{`★`.repeat(r)}</span>
            </label>
          ))}
        </div>
      </FilterCard>
    </div>
  );
}

function FilterCard({ title, children }) {
  return (
    <div
      className="
        rounded-2xl border border-gray-200 dark:border-zinc-800 
        bg-white dark:bg-zinc-900 p-6 shadow-md hover:shadow-lg
        transition-shadow duration-300 space-y-4
      "
    >
      <h3 className="font-bold text-lg text-gray-900 dark:text-zinc-100">
        {title}
      </h3>
      {children}
    </div>
  );
}
