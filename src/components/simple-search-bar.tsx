
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";
import { useAuth } from "@/components/auth-context";

interface SimpleSearchBarProps {
  onSearch: (query: string, mode: "search" | "generate") => void;
  isLoading?: boolean;
  className?: string;
}

export function SimpleSearchBar({ onSearch, isLoading, className }: SimpleSearchBarProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"search" | "generate">("search");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  
  const { hasReachedLimit, incrementCount, requiresLogin } = useSearchLimit();
  const { profile } = useAuth();
  const isPremium = profile?.is_premium || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    if (mode === "generate" && !isPremium) {
      setShowPremiumDialog(true);
      return;
    }
    
    if (hasReachedLimit) {
      setShowPremiumDialog(true);
      return;
    }
    
    if (mode === "search") {
      const success = await incrementCount();
      if (!success) {
        setShowPremiumDialog(true);
        return;
      }
    }
    
    onSearch(query, mode);
  };

  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for diagrams or describe what you need..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 py-6 text-base w-full bg-background/90 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/30"
              disabled={isLoading}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button"
              variant={mode === "search" ? "default" : "outline"}
              onClick={() => setMode("search")}
              disabled={isLoading}
              className="gap-2 py-6"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
            
            <Button 
              type="button"
              variant={mode === "generate" ? "default" : "outline"}
              onClick={() => setMode("generate")}
              disabled={isLoading}
              className="gap-2 py-6"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate</span>
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {query.trim() && (
            <motion.div 
              className="mt-3 flex justify-end"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Button 
                type="submit" 
                disabled={!query.trim() || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "search" ? <Search className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    <span>{mode === "search" ? "Search Now" : "Generate Now"}</span>
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      
      <PremiumPlanDialog
        open={showPremiumDialog}
        onClose={() => setShowPremiumDialog(false)}
        showLogin={requiresLogin}
      />
    </motion.div>
  );
}
