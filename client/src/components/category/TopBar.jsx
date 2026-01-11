import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function TopBar({ productsCount }) {
  return (
    <div
      className="
        flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 
        p-5 rounded-2xl border shadow-md
        bg-white dark:bg-zinc-900
        border-gray-200 dark:border-zinc-800
      "
    >
      <p className="text-sm text-gray-700 dark:text-zinc-300">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-zinc-100">
          {productsCount}
        </span>{" "}
        products
      </p>

      {/* <DropdownMenu>
        <DropdownMenuTrigger
          className="
            border px-5 py-2.5 rounded-lg text-sm shadow-sm
            bg-white dark:bg-zinc-800
            border-gray-200 dark:border-zinc-700
            text-gray-700 dark:text-zinc-100
            hover:bg-gray-100 dark:hover:bg-zinc-700 transition
          "
        >
          Sort by: Name A–Z
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700">
          <DropdownMenuItem>Name A–Z</DropdownMenuItem>
          <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
          <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
    </div>
  );
}
