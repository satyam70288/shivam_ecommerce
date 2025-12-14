import { useParams } from "react-router-dom";
import useCategory from "@/hooks/useCategory";
import { FolderIcon } from "@/components/Notfound/icons";
import FiltersSidebar from "@/components/category/FiltersSidebar";
import TopBar from "@/components/category/TopBar";
import ProductGrid from "@/components/category/ProductGrid";
import { FoldersIcon } from "lucide-react";
import NotFound from "@/components/Notfound/NotFound";
import MobileFilterButton from "@/components/category/MobileFilterButton";
import { useState } from "react";

export default function CategoryPage() {
const [selectedFilters, setSelectedFilters] = useState({
  categories: [],
  priceRange: [],
  discount: [],
  ratings: [],
  ageGroup: [],
  colors: [],
  material: [],
  availability: [],
});

  const updateFilter = (key, value) => {
    console.log(key,value)
  setSelectedFilters((prev) => {
    const arr = prev[key];
    console.log(arr,"arr")

    if (arr.includes(value)) {
      return { ...prev, [key]: arr.filter((v) => v !== value) };
    }

    return { ...prev, [key]: [...arr, value] };
  });
};

  const { slug } = useParams();
  const { products, loading, error } = useCategory(slug,selectedFilters);

  if (error?.response?.status === 404) {
    return (
      <NotFound
        icon={<FoldersIcon className="w-20 h-20 text-gray-400" />}
        title="Category Not Found"
        message="This category doesn't exist."
      />
    );
  }

  return (
    <div
      className="
  max-w-7xl mx-auto px-4 py-4
  flex flex-col md:flex-row
  gap-6 md:gap-10
  bg-gradient-to-b from-gray-50 to-white
  dark:from-zinc-950 dark:to-zinc-900
  min-h-screen
"
    >
      {/* MOBILE FILTER BUTTON */}
      <div className="md:hidden">
        <MobileFilterButton />
      </div>

      {/* LEFT SIDEBAR */}
    
  <aside
  className="
    hidden md:block w-[220px] sticky top-20 pl-2
    h-[calc(100vh-80px)] overflow-hidden rounded-xl
    bg-white dark:bg-zinc-900
    shadow-[0_0_25px_-5px_rgba(255,100,100,0.3)]
    dark:shadow-[0_0_20px_-5px_rgba(255,255,255,0.08)]
  "
>


  <div
    className="
      overflow-y-auto h-full pr-2 pb-10
      scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200
      dark:scrollbar-thumb-zinc-700 dark:scrollbar-track-zinc-900
    "
  >
  <FiltersSidebar 
  selectedFilters={selectedFilters}
  updateFilter={updateFilter}
/>

  </div>
</aside>


      {/* RIGHT CONTENT */}
     <section
  className="
    flex-1 p-2
    overflow-y-auto no-scrollbar
    min-h-screen md:h-[calc(100vh-80px)]
    space-y-8
    shadow-md rounded-lg
    bg-white dark:bg-zinc-900
  "
>
  <TopBar productsCount={products?.length} />
  {loading ? <ProductGrid loading /> : <ProductGrid products={products} />}
</section>

    </div>
  );
}
