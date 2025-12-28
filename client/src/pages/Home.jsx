// Home.jsx - CORRECT VERSION
import FilterMenu from "@/components/custom/FilterMenu";
import ProductList from "@/components/custom/ProductList";
import React, { useState } from "react";

const Home = () => {
  const [search, setSearch] = useState("");

  console.log("Home Component - Search State:", search); // Debug ke liye

  return (
    <div>
      {/* FilterMenu ko onSearch prop pass karo */}
      <FilterMenu onSearch={setSearch} />
      
      {/* ProductList ko search prop pass karo */}
      <ProductList search={search} />
    </div>
  );
};

export default Home;