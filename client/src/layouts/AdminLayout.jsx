import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/custom/AppSidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        {/* LEFT SIDEBAR */}
        <AppSidebar />

        {/* RIGHT CONTENT AREA */}
        <main className="flex-1">
          <SidebarTrigger />

          <div className="sm:m-10 p-5">
            <Outlet />  {/* THIS IS VERY IMPORTANT */}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
