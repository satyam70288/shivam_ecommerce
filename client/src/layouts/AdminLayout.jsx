import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/custom/AppSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        
        {/* LEFT SIDEBAR */}
        <AppSidebar />

        {/* RIGHT CONTENT AREA */}
        <main className="flex-1 overflow-x-hidden">
          <SidebarTrigger />

          {/* FULL WIDTH WRAPPER */}
          <div className="w-full px-5 sm:px-10 py-5">
            <Outlet />
          </div>
          
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
