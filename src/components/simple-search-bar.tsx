
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";
import { useAuth } from "@/components/auth-context";
import { SearchLimitIndicator } from "./search-limit-indicator";
import { SearchSuggestions } from "@/components/search-suggestions";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface SimpleSearchBarProps {
  onSearch: (query: string, mode: "search" | "generate") => void;
  isLoading?: boolean;
  className?: string;
}

export function SimpleSearchBar({ onSearch, isLoading, className }: SimpleSearchBarProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"search" | "generate">("search");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();
  
  const { 
    hasReachedLimit, 
    incrementCount, 
    requiresLogin,
    remainingSearches,
    hasReachedGenerationLimit,
    incrementGenerationCount,
    remainingGenerations
  } = useSearchLimit();
  
  const { profile } = useAuth();
  const isPremium = profile?.is_premium || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    if (mode === "generate") {
      if (hasReachedGenerationLimit) {
        setShowPremiumDialog(true);
        return;
      }
      
      const success = await incrementGenerationCount();
      if (!success) {
        setShowPremiumDialog(true);
        return;
      }
    } else {
      if (hasReachedLimit) {
        setShowPremiumDialog(true);
        return;
      }
      
      const success = await incrementCount();
      if (!success) {
        setShowPremiumDialog(true);
        return;
      }
    }
    
    onSearch(query, mode);
    setShowSuggestions(false);
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
      onSearch(suggestion, mode);
    }, 50);
  };
  
  const handleClearSearch = () => {
    setQuery("");
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
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={mode === "search" ? "Search for diagrams and visualizations..." : "Describe a diagram to generate..."}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(query.length > 0)}
              className={cn(
                "pl-10 py-6 text-base w-full shadow-sm",
                "focus-visible:ring-1 focus-visible:ring-primary/30",
                isDarkMode 
                  ? "bg-background/70 border-border/30" 
                  : "bg-background border-border/50"
              )}
              disabled={isLoading}
            />
            {mode === "search" ? (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            ) : (
              <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            )}
            
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={!query.trim() || isLoading}
            className="h-12 px-6"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === "search" ? (
                  <Search className="h-4 w-4 mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {mode === "search" ? "Search" : "Generate"}
              </>
            )}
          </Button>
          
          <Button
            type="button" 
            variant="outline"
            size="icon"
            className="h-12 w-12"
            onClick={() => setMode(mode === "search" ? "generate" : "search")}
            title={mode === "search" ? "Switch to Generate" : "Switch to Search"}
          >
            {mode === "search" ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Search suggestions */}
        <SearchSuggestions
          isVisible={showSuggestions && !isLoading}
          query={query}
          onSuggestionClick={handleSuggestionClick}
          className="top-full"
        />
      </form>
      
      <div className="mt-2 flex justify-between items-center">
        <SearchLimitIndicator compact={true} className="opacity-70 scale-90" />
        
        <div className="text-xs text-muted-foreground">
          {mode === "search" ? (
            <span>{remainingSearches} searches left{!isPremium && " today"}</span>
          ) : (
            <span>{remainingGenerations} generations left{!isPremium && " today"}</span>
          )}
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
