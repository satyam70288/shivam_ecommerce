// layouts/RootLayout.jsx
import Footer from "@/components/custom/Footer";
import Navbar from "@/components/custom/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="bg-background min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default RootLayout;
