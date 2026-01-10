// Home.jsx - CORRECT VERSION
import FilterMenu from "@/components/custom/FilterMenu";
import HeaderDisplay from "@/components/custom/HeaderDisplay";
import ProductList from "@/components/custom/ProductList";
import React, { useState } from "react";

const Home = () => {
  const [search, setSearch] = useState("");


  return (
    <div className="">
       <HeaderDisplay />
      {/* FilterMenu ko onSearch prop pass karo */}
      <FilterMenu onSearch={setSearch} />
      
      {/* ProductList ko search prop pass karo */}
      <ProductList search={search} />
    </div>
  );
};

export default Home;