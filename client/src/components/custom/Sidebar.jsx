import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Heart, LogOut, MapPin, ShoppingBag, User } from "lucide-react";
import { useRef, useState } from "react";

export function Sidebar() {
  const navigate = useNavigate();
  const menu = [
    { label: "My Profile", icon: User, to: "/account" },
    { label: "Address", icon: MapPin, to: "/account/address" },
    { label: "My List", icon: Heart, to: "/account/wishlist" },
    { label: "My Orders", icon: ShoppingBag, to: "/orders" },
  ];
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ❌ reject non-images
    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    // ✅ preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };
  const handleLogout = () => {
    // logout logic
    navigate("/login");
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground">
      {/* User */}
      <div className="flex flex-col items-center gap-2 p-6 relative">
        {/* Hidden input */}
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Avatar */}
        <div
          className="relative group cursor-pointer bg-red-700"
          onClick={() => fileRef.current.click()}
        >
          <Avatar className="h-20 w-20">
            <AvatarImage src={preview || ""} />
            <AvatarFallback>AA</AvatarFallback>
          </Avatar>

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 rounded-full
          flex items-center justify-center opacity-0
          group-hover:opacity-100 transition"
          >
            <Camera className="text-white w-4 h-4" />
          </div>
        </div>

        <p className="font-semibold">aaaa</p>
        <p className="text-sm text-muted-foreground">satyamb971@gmail.com</p>
      </div>

      <Separator />

      {/* Menu */}
      <div className="p-2 space-y-1 ">
        {menu.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end
            className={({ isActive }) =>
              `
              w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
              hover:bg-muted
              ${isActive ? "bg-muted font-medium text-primary" : ""}
            `
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                     text-destructive hover:bg-muted transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
