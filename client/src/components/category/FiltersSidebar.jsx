import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

import {
  ChevronDown,
  Package,
  Gift,
  PencilRuler,
  Sparkles,
  Gem,
  Flower2,
  Backpack,
} from "lucide-react";

const categories = [
  { label: "Toys", icon: <Package size={16} /> },
  { label: "Gift Items", icon: <Gift size={16} /> },
  { label: "Stationery", icon: <PencilRuler size={16} /> },
  { label: "Cosmetic", icon: <Sparkles size={16} /> },
  { label: "Imitation Jewellery", icon: <Gem size={16} /> },
  { label: "Pooja Samagri", icon: <Flower2 size={16} /> },
  { label: "Bags", icon: <Backpack size={16} /> },
];

export default function FiltersSidebar({ selectedFilters, updateFilter }) {
  return (
    <div className="space-y-6">

      {/* PRICE RANGE */}
      <FilterSection title="Price Range">
        <CheckboxList
          filterKey="priceRange"
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          options={[
            { label: "₹0 – ₹199", value: "0-199" },
            { label: "₹200 – ₹499", value: "200-499" },
            { label: "₹500 – ₹999", value: "500-999" },
            { label: "₹1000 – ₹1999", value: "1000-1999" },
            { label: "₹2000 & above", value: "2000-999999" },
          ]}
        />
      </FilterSection>

      {/* DISCOUNTS */}
      <FilterSection title="Discount">
        <CheckboxList
          filterKey="discount"
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          options={[
            { label: "10% or more", value: "10" },
            { label: "20% or more", value: "20" },
            { label: "30% or more", value: "30" },
            { label: "40% or more", value: "40" },
            { label: "50% or more", value: "50" },
          ]}
        />
      </FilterSection>

      {/* RATINGS */}
      <FilterSection title="Ratings">
        <CheckboxList
          filterKey="ratings"
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          options={[
            { label: "4 ★ & above", value: "4" },
            { label: "3 ★ & above", value: "3" },
          ]}
        />
      </FilterSection>

      {/* AGE GROUP */}
      <FilterSection title="Age Group">
        <CheckboxList
          filterKey="ageGroup"
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          options={[
            { label: "0 – 3 years", value: "0-3" },
            { label: "3 – 6 years", value: "3-6" },
            { label: "6 – 9 years", value: "6-9" },
            { label: "9 – 12 years", value: "9-12" },
            { label: "12+ years", value: "12+" },
          ]}
        />
      </FilterSection>

      {/* MATERIAL */}
      <FilterSection title="Material">
        <CheckboxList
          filterKey="material"
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          options={[
            { label: "Plastic", value: "plastic" },
            { label: "Wood", value: "wood" },
            { label: "Metal", value: "metal" },
            { label: "Cotton", value: "cotton" },
            { label: "Synthetic", value: "synthetic" },
            { label: "Alloy", value: "alloy" },
            { label: "Paper", value: "paper" },
          ]}
        />
      </FilterSection>

      {/* AVAILABILITY */}
      <FilterSection title="Availability">
        <CheckboxList
          filterKey="availability"
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          options={[
            { label: "In Stock", value: "in" },
            { label: "Out of Stock", value: "out" },
          ]}
        />
      </FilterSection>

    </div>
  );
}



function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2 font-semibold text-gray-800 dark:text-gray-200"
      >
        {title}
        <ChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          size={18}
        />
      </button>

      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function CheckboxList({ options, filterKey, selectedFilters, updateFilter }) {
  // console.log( filterKey);
  return options.map((opt, i) => (
    <label key={i} className="flex items-center gap-3 cursor-pointer text-sm">
      <Checkbox
        checked={selectedFilters[filterKey]?.includes(opt.value)}
        onCheckedChange={() => updateFilter(filterKey, opt.value)}
      />

      <span className="flex items-center gap-2">
        {opt.icon}
        {opt.label}
      </span>
    </label>
  ));
}

function ColorList({ colors }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <div
          key={c.name}
          className={`w-5 h-5 rounded-full border cursor-pointer ${c.class}`}
          title={c.name}
        ></div>
      ))}
    </div>
  );
}
