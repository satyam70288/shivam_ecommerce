import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/provider/theme-provider";

export function ModeToggle({ iconSize = 20 }) { // Add iconSize prop with default value
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" // Changed from "outline" to "ghost" for consistency
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 p-0" // Add fixed size classes
        >
          <Sun 
            size={iconSize} // Use iconSize prop instead of fixed size
            className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" 
          />
          <Moon 
            size={iconSize} // Use iconSize prop instead of fixed size
            className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" 
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}