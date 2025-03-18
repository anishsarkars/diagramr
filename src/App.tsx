
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

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
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
    }, hasVisited ? 800 : 1500);
    
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
          <Sonner />
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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
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
