// Home.jsx - CORRECT VERSION
import FilterMenu from "@/components/custom/FilterMenu";
import HeaderDisplay from "@/components/custom/HeaderDisplay";
import ProductList from "@/components/custom/ProductList";
import SEO from "@/components/seo/SEO";
import { SITE } from "@/config/seo";
import { organizationSchema, websiteSchema } from "@/utils/seoSchemas";
import React, { useState } from "react";

const Home = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="">
      <SEO
        title="Home"
        description={SITE.description}
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [organizationSchema(), websiteSchema()],
        }}
      />
       <HeaderDisplay />
      {/* FilterMenu ko onSearch prop pass karo */}
      <FilterMenu onSearch={setSearch} />
      
      {/* ProductList ko search prop pass karo */}
      <ProductList search={search} />
    </div>
  );
};

export default Home;