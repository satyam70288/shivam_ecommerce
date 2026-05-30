import React from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/seo/SEO";

const Error = () => {
  return (
    <>
      <SEO title="Page Not Found" noindex />
    <div className="flex gap-1 flex-col justify-center items-center w-screen h-screen">
      <h1 className="text-3xl sm:text-5xl font-bold">404 Page Not Found!</h1>
      <Link to={"/"} className="underline text-sm sm:text-lg">
        Click here to go to Homepage
      </Link>
    </div>
    </>
  );
};

export default Error;
