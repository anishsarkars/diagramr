
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-context";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/auth";
import Favorites from "./pages/Favorites";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import { BuiltByBadge } from "./components/built-by-badge";
import { SiteLoader } from "./components/site-loader";
import { lazy, Suspense } from "react";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Lazy load the premium plan dialog to improve initial load time
const PremiumPlanDialog = lazy(() => import("./components/premium-plan-dialog").then(module => ({ 
  default: module.PremiumPlanDialog 
})));

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user has already visited
    const hasVisited = localStorage.getItem("hasVisited");
    
    // Simulate loading time for first-time visitors
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!hasVisited) {
        localStorage.setItem("hasVisited", "true");
      }
    }, hasVisited ? 800 : 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <TooltipProvider>
            {isLoading ? (
              <SiteLoader />
            ) : (
              <>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/pricing" element={<Pricing />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
                <BuiltByBadge position="fixed" />
                <Suspense fallback={null}>
                  <PremiumPlanDialog open={false} onClose={() => {}} />
                </Suspense>
              </>
            )}
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
