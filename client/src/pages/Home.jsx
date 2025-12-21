import FilterMenu from "@/components/custom/FilterMenu";
import Header from "@/components/custom/Header";
import HeaderDisplay from "@/components/custom/HeaderDisplay";
import ProductList from "@/components/custom/ProductList";
import React, { useState } from "react";

const Home = () => {
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");

  return (
    <div>
      <HeaderDisplay />
      {/* <Header/> */}
      
      {/* FilterMenu को onSearch prop pass करें */}
      <FilterMenu 
        onSearch={setSearch}
        onCategoryChange={setCategory}
        onPriceChange={setPrice}
      />
      
      {/* ProductList को search और अन्य filters pass करें */}
      <ProductList 
        search={search}
        category={category}
        price={price}
      />
    </div>
  );
};

export default Home;