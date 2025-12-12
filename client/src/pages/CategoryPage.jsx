import { useParams } from "react-router-dom";
import useCategory from "@/hooks/useCategory";
import { FolderIcon } from "@/components/Notfound/icons";
import FiltersSidebar from "@/components/category/FiltersSidebar";
import TopBar from "@/components/category/TopBar";
import ProductGrid from "@/components/category/ProductGrid"
import { FoldersIcon } from "lucide-react";
import NotFound from "@/components/Notfound/NotFound";

export default function CategoryPage() {
  const { slug } = useParams();
  const { products, loading, error } = useCategory(slug);

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
    max-w-7xl mx-auto px-4 
    grid grid-cols-12 gap-10 
    bg-gradient-to-b from-gray-50 to-white
    dark:from-zinc-950 dark:to-zinc-900
    h-screen
  "
>
  {/* LEFT SIDEBAR */}
  <aside
    className="
      col-span-12 md:col-span-3
      sticky top-0 
      h-screen
      overflow-hidden
    "
  >
    <div className="overflow-y-auto h-full pr-2 pb-10">
      <FiltersSidebar />
    </div>
  </aside>

  {/* RIGHT CONTENT */}
  <section
    className="
      col-span-12 md:col-span-9 
      overflow-y-auto 
      h-screen
      space-y-8
    "
  >
    <TopBar productsCount={products?.length} />
    {loading ? <ProductGrid loading /> : <ProductGrid products={products} />}
  </section>
</div>

  );
}
