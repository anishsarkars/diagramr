
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  Search,
  BookOpen,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Download,
  Moon,
  Sun,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTheme } from "@/components/theme-provider";

interface NavItem {
  icon: typeof Search;
  label: string;
  active?: boolean;
  href?: string;
  color?: string;
}

export function SidebarNav() {
  const { theme, setTheme } = useTheme();
  const [activeItem, setActiveItem] = useState("find");
  
  const navItems: NavItem[] = useMemo(
    () => [
      {
        icon: BookOpen,
        label: "Find Diagrams",
        active: activeItem === "find",
        href: "#",
      },
      {
        icon: Search,
        label: "Search",
        active: activeItem === "search",
        href: "#search",
      },
      {
        icon: Users,
        label: "Manage Subscription",
        active: activeItem === "subscription",
        href: "#subscription",
      },
      {
        icon: Download,
        label: "Updates & FAQ",
        active: activeItem === "updates",
        href: "#updates",
      },
      {
        icon: Settings,
        label: "Settings",
        active: activeItem === "settings",
        href: "#settings",
      },
    ],
    [activeItem]
  );

  return (
    <div className="flex h-full min-h-screen w-64 flex-col border-r border-border bg-card p-4">
      <div className="mb-6 px-2">
        <Logo />
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3",
              item.active && "bg-accent font-medium"
            )}
            onClick={() => setActiveItem(item.label.toLowerCase().split(" ")[0])}
          >
            <item.icon
              className={cn(
                "h-4 w-4",
                item.active ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className={item.active ? "text-foreground" : "text-muted-foreground"}>
              {item.label}
            </span>
          </Button>
        ))}
      </nav>
      
      <div className="mt-auto space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="ml-2">{theme === "dark" ? "Light" : "Dark"}</span>
          </Button>
          <Button className="w-full justify-center">Upgrade</Button>
        </div>
      </div>
    </div>
  );
}
