import {
  Calendar,
  ChartBar,
  FilePlus2Icon,
  GalleryVerticalEnd,
  Home,
  Inbox,
  PackageSearch,
  Search,
  Settings,
  CircleX,
  
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { setUserLogout } from "@/redux/slices/authSlice";

// Menu items.
const items = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Products", url: "/admin/products", icon: GalleryVerticalEnd },
  { title: "Create Product", url: "/admin/products/create", icon: FilePlus2Icon },
  { title: "Orders", url: "/admin/orders", icon: PackageSearch },
  { title: "Analytics", url: "/admin/analytics", icon: ChartBar },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];


const AppSidebar = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch()

  return (
    <Sidebar>
      <SidebarHeader>
        <h3 className="text-xl font-bold">Dashboard</h3>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`${
                    pathname === item.url && "bg-zinc-200 dark:bg-zinc-600"
                  }`}
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={() => dispatch(setUserLogout())}>Logout</Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
