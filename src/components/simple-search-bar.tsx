
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";
import { useAuth } from "@/components/auth-context";
import { SearchSuggestions } from "@/components/search-suggestions";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

interface SimpleSearchBarProps {
  onSearch: (query: string, mode: "search" | "generate") => void;
  isLoading?: boolean;
  className?: string;
}

export function SimpleSearchBar({ onSearch, isLoading, className }: SimpleSearchBarProps) {
  const [query, setQuery] = useState("");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();
  
  const { 
    hasReachedLimit, 
    incrementCount, 
    requiresLogin,
    remainingSearches,
  } = useSearchLimit();
  
  const { profile } = useAuth();
  const isPremium = profile?.is_premium || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setSearchError(null);
    
    try {
      if (hasReachedLimit) {
        setShowPremiumDialog(true);
        return;
      }
      
      const success = await incrementCount();
      if (!success) {
        setShowPremiumDialog(true);
        return;
      }
      
      // Add to search history
      const savedHistory = localStorage.getItem('diagramr-search-history');
      let history: string[] = [];
      
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
        } catch (e) {
          console.error('Error parsing search history:', e);
        }
      }
      
      const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 10);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
      
      onSearch(query, "search");
      setShowSuggestions(false);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to process search. Please try again.");
      toast.error("Search failed. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      onSearch(suggestion, "search");
      
      // Add to search history
      const savedHistory = localStorage.getItem('diagramr-search-history');
      let history: string[] = [];
      
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
        } catch (e) {
          console.error('Error parsing search history:', e);
        }
      }
      
      const newHistory = [suggestion, ...history.filter(item => item !== suggestion)].slice(0, 10);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
    }, 50);
  };
  
  const handleClearSearch = () => {
    setQuery("");
    setSearchError(null);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.div 
      ref={wrapperRef}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for educational diagrams & visualizations..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
                setSearchError(null);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(query.length > 0)}
              className={cn(
                "pl-9 md:pl-10 py-5 md:py-6 text-sm md:text-base w-full shadow-sm",
                "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60",
                "rounded-full border-2", 
                isDarkMode 
                  ? "bg-background/70 border-border/30 backdrop-blur-sm" 
                  : "bg-background border-border/50",
                searchError ? "border-red-500 focus-visible:ring-red-500/30" : "",
                "transition-all duration-200"
              )}
              disabled={isLoading}
            />
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 md:h-8 md:w-8 text-muted-foreground hover:text-foreground"
                onClick={handleClearSearch}
              >
                <X className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={!query.trim() || isLoading}
            className="h-10 md:h-12 px-4 md:px-6 rounded-full shadow-sm hover:shadow transition-all duration-200"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <BookOpen className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                <span className="text-xs md:text-sm">Find Diagrams</span>
              </>
            )}
          </Button>
        </div>
        
        {searchError && (
          <div className="mt-2 text-xs md:text-sm text-red-500">
            {searchError}
          </div>
        )}
        
        {/* Search suggestions */}
        <SearchSuggestions
          isVisible={showSuggestions && !isLoading}
          query={query}
          onSuggestionClick={handleSuggestionClick}
          className="top-full"
        />
      </form>
      
      <div className="mt-1 md:mt-2 flex justify-end items-center">
        <div className="text-xs text-muted-foreground">
          <span>{remainingSearches} academic searches left{!isPremium && " today"}</span>
        </div>
      </div>
      
      <PremiumPlanDialog
        open={showPremiumDialog}
        onClose={() => setShowPremiumDialog(false)}
        showLogin={requiresLogin}
      />
    </motion.div>
  );
}
