
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { SearchIcon, Sparkles, ArrowRight, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchSuggestions } from "@/components/search-suggestions";
import { useTheme } from "@/components/theme-provider";

interface EnhancedSearchBarProps {
  className?: string;
  onSearch?: (prompt: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  defaultValue?: string;
}

export function EnhancedSearchBar({ 
  className, 
  onSearch, 
  placeholder = "Search for educational diagrams...", 
  isLoading,
  defaultValue = ""
}: EnhancedSearchBarProps) {
  const [prompt, setPrompt] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleSubmit = () => {
    if (onSearch && prompt.trim()) {
      // Save to search history
      const savedHistory = localStorage.getItem('diagramr-search-history');
      let history: string[] = [];
      
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
        } catch (e) {
          console.error('Error parsing search history:', e);
        }
      }
      
      const newHistory = [prompt, ...history.filter(item => item !== prompt)].slice(0, 10);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
      
      onSearch(prompt);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      handleSubmit();
    }, 50);
  };
  
  const handleClearSearch = () => {
    setPrompt("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
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

  useEffect(() => {
    setPrompt(defaultValue);
  }, [defaultValue]);

  return (
    <motion.div 
      ref={wrapperRef}
      className={cn("relative w-full", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className={cn(
          "flex items-center w-full rounded-2xl overflow-hidden",
          "border border-primary/30",
          "bg-background/80 backdrop-blur-lg shadow-lg",
          isFocused ? "ring-2 ring-primary/20 shadow-xl border-primary/40" : "",
          isLoading ? "opacity-80" : ""
        )}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex-1 flex items-center relative">
          <div className="absolute left-4 text-primary">
            <SearchIcon className="h-5 w-5" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="pl-12 py-7 text-base md:text-lg border-0 shadow-none focus-visible:ring-0 bg-transparent"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(prompt.length > 0);
            }}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
          />
          
          {prompt && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 mr-3">
          <AnimatePresence>
            {prompt.trim() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  size="lg"
                  className="rounded-xl px-5 py-6 bg-primary hover:bg-primary/90 gap-2"
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">Search</span>
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Enhanced Search suggestions dropdown */}
      <SearchSuggestions
        isVisible={showSuggestions && !isLoading}
        query={prompt}
        onSuggestionClick={handleSuggestionClick}
      />
      
      {isLoading && (
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-primary/70"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}
