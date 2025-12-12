import FilterMenu from "@/components/custom/FilterMenu";
import Header from "@/components/custom/Header";
import HeaderDisplay from "@/components/custom/HeaderDisplay";
import ProductList from "@/components/custom/ProductList";
import React from "react";

const Home = () => {


  return (
    <div>
      <HeaderDisplay />
      {/* <Header/> */}
      <FilterMenu />
      <ProductList/>

    </div>
  );
};

export default Home;
