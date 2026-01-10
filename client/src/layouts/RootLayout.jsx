// layouts/RootLayout.jsx
import Footer from "@/components/custom/Footer";
import Header from "@/components/custom/Header";
import Navbar from "@/components/custom/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <>
    <ScrollToTop />
      <Navbar className="bg-gray-200 "/>
      <main className=" bg-gray-200  dark:bg-black">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default RootLayout;
