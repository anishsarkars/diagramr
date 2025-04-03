
import { ReactNode } from "react";
import { SidebarNavigation } from "./sidebar-navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-background/90 overflow-hidden">
      <SidebarNavigation />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "flex-1 overflow-auto",
          isMobile ? "w-full" : "ml-0",
          "pt-4 pb-16" // Add padding top and bottom
        )}
      >
        {children}
      </motion.main>
    </div>
  );
}
