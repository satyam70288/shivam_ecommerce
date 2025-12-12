import React from "react";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  return (
    <div className="searchBox w-full h-[42px] flex items-center rounded-full overflow-hidden bg-[#f8f8f8] border border-gray-300 shadow-sm">

      {/* Input */}
      <input
        type="text"
        placeholder="Search for products..."
        className="flex-1 h-full px-4 text-[14px] outline-none placeholder-gray-500 bg-transparent"
      />

      {/* Search Button */}
      <button
        className="h-full px-5 bg-gray-800 flex items-center justify-center 
                   transition-all duration-300 group 
                   hover:bg-gray-900"
      >
        <SearchIcon
          size={18}
          className="text-white transition-all duration-300 group-hover:scale-110"
        />
      </button>

    </div>
  );
};

export default Search;
