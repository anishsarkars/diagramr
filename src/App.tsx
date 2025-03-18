import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/components/auth-context";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/auth";
import Liked from "./pages/Liked";
import Account from "./pages/Account";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import { BuiltByBadge } from "./components/built-by-badge";
import { SiteLoader } from "./components/site-loader";
import { lazy, Suspense } from "react";

// Create a query client with better retry settings for failed API requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// App content separated to use router hooks
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Enhanced loading timeout for better UX
  useEffect(() => {
    // Check if user has already visited
    const hasVisited = localStorage.getItem("hasVisited");
    
    // Simulate loading time for first-time visitors
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!hasVisited) {
        localStorage.setItem("hasVisited", "true");
      }
    }, hasVisited ? 500 : 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Protected route handler
  useEffect(() => {
    const protectedRoutes = ['/account', '/liked'];
    if (protectedRoutes.includes(location.pathname) && !user) {
      navigate('/auth', { state: { returnTo: location.pathname } });
    }
  }, [location.pathname, user, navigate]);

  const handleLoginClick = () => {
    navigate('/auth', { 
      state: { returnTo: location.pathname !== '/auth' ? location.pathname : '/' } 
    });
  };
  
  // Lazy load components for better performance
  const PremiumPlanDialog = lazy(() => import("./components/premium-plan-dialog").then(module => ({ 
    default: module.PremiumPlanDialog 
  })));
  
  return (
    <>
      {isLoading ? (
        <SiteLoader />
      ) : (
        <>
          <Toaster />
          <Sonner closeButton position="top-right" />
          <Routes>
            <Route path="/" element={<Index onLoginClick={handleLoginClick} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/liked" element={<Liked />} />
            <Route path="/account" element={<Account />} />
            <Route path="/pricing" element={<Pricing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BuiltByBadge position="fixed-left" />
          <Suspense fallback={null}>
            <PremiumPlanDialog open={false} onClose={() => {}} onLoginClick={handleLoginClick} />
          </Suspense>
        </>
      )}
    </>
  );
}

const App = () => {
  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("diagramr-theme");
  
  // Fixed: Ensure savedTheme is cast to a valid Theme type
  const defaultTheme = (savedTheme as "light" | "dark" | "system") || (prefersDarkMode ? "dark" : "light");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={defaultTheme} storageKey="diagramr-theme">
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
