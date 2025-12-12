import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/custom/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AccountLayout() {
  return (
    <div className="min-h-screen bg-muted/40 dark:bg-background">
      
      {/* ================= MOBILE HEADER ================= */}
      <div className="
        md:hidden
        sticky top-0 z-20
        flex items-center justify-between
        px-4 py-3
        bg-background/95 backdrop-blur
        border-b
      ">
        <h2 className="text-base font-semibold tracking-tight">
          My Account
        </h2>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-[280px]">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* ================= DESKTOP LAYOUT ================= */}
      <div
        className="
          mx-auto
          max-w-6xl
          px-4 sm:px-6
          py-6
          flex gap-6
          min-h-[calc(100vh-4rem)]
        "
      >
        {/* Sidebar */}
        <aside className="hidden md:block w-[260px] shrink-0">
          <div className="
            sticky top-6
            rounded-2xl
            bg-background
            shadow-sm
          ">
            <Sidebar />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1">
          <div className="
            w-full h-full
            rounded-2xl
            bg-background
            shadow-sm
            p-4 sm:p-6 md:p-8
          ">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
