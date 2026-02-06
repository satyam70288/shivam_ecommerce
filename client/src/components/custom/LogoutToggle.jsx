import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { persistor } from "../../redux/store"; // Adjust path as needed
// import { emptyCart } from "@/redux/slices/cartSlice";
import { clearWishlist } from "@/redux/slices/wishlistSlice";

const LogoutToggle = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    //console.log("Starting logout...");
    
    // 1. Clear Redux Persist storage FIRST
    //console.log("Clearing persist storage...");
    await persistor.purge(); // This clears persisted data
    //console.log("Persist storage cleared");
    
    // 2. Then dispatch logout action
    //console.log("Dispatching logoutUser...");
    const result = await dispatch(logoutUser());
    //console.log("Logout result:", result);
    
    // 3. Clear cart
    //console.log("Clearing cart...");
    // dispatch(emptyCart());
    dispatch(clearWishlist());
    
    // 4. Navigate to login
    //console.log("Navigating to login...");
    navigate("/login", { replace: true });
    
    // 5. Force reload to ensure clean state
    // setTimeout(() => {
    //   window.location.reload();
    // }, 100);
    
  } catch (error) {
    console.error("❌ Logout error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Even if there's an error, still try to clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Force navigation
    window.location.href = "/login";
  }
};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
          <AvatarImage src={user?.avatar} />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuLabel className="text-center">
          {user?.name || "User"}
        </DropdownMenuLabel>
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          {user?.email || ""}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link to="/account" className="w-full">
          <DropdownMenuItem className="cursor-pointer">
            My Account
          </DropdownMenuItem>
        </Link>
        
        <Link to="/orders" className="w-full">
          <DropdownMenuItem className="cursor-pointer">
            My Orders
          </DropdownMenuItem>
        </Link>
        
        <Link to="/account/wishlist" className="w-full">
          <DropdownMenuItem className="cursor-pointer">
            Wishlist
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LogoutToggle;