
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { SearchIcon, LightbulbIcon, ArrowRight, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchSuggestions } from "@/components/search-suggestions";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth-context";

interface AIInputProps {
  className?: string;
  onSubmit?: (prompt: string, mode: "search") => void;
  placeholder?: string;
  isLoading?: boolean;
  showTrialMessage?: boolean;
}

export function AIInput({ className, onSubmit, placeholder, isLoading, showTrialMessage = true }: AIInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  const [examples] = useState<string[]>([
    "Data structure visualization",
    "UML class diagram for banking system",
    "Network architecture diagram",
    "Human anatomy diagram",
    "Photosynthesis process",
    "Circuit diagram",
  ]);

  const handleSubmit = () => {
    if (onSubmit && prompt.trim()) {
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
      
      onSubmit(prompt, "search");
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

  const useExample = (example: string) => {
    setPrompt(example);
    if (inputRef.current) {
      inputRef.current.focus();
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      {showTrialMessage && !user && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl mx-auto mb-6"
        >
          <div className="flex flex-col items-center space-y-2 px-4">
            <div className="flex items-center gap-3 bg-card/30 backdrop-blur-sm border border-border/20 rounded-full px-4 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">3/3 guest searches left</span>
                <span className="text-xs text-muted-foreground/50">•</span>
                <span className="text-sm text-muted-foreground/80">Sign in for more</span>
              </div>
              <Button variant="default" size="sm" className="h-7 px-3 rounded-full text-sm font-medium">
                Sign in
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70 text-center max-w-md">
              Diagramr is in early stages and improving gradually. Some results may vary in quality.
            </p>
          </div>
        </motion.div>
      )}

      <motion.div 
        ref={wrapperRef}
        className={cn(
          "relative transition-all duration-300 w-full max-w-2xl mx-auto px-4",
          "flex flex-col",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Recent Search Tags */}
        <motion.div 
          className="flex flex-wrap gap-2 mb-4 w-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {(() => {
            const savedHistory = localStorage.getItem('diagramr-search-history');
            let history: string[] = [];
            if (savedHistory) {
              try {
                history = JSON.parse(savedHistory);
              } catch (e) {
                console.error('Error parsing search history:', e);
              }
            }
            return history.slice(0, 6).map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPrompt(item);
                  setTimeout(handleSubmit, 100);
                }}
              >
                <Badge 
                  variant="outline" 
                  className="cursor-pointer px-3 py-1.5 bg-card/30 hover:bg-card/40 backdrop-blur-sm transition-all duration-300 flex items-center gap-2 group border-border/30"
                >
                  <SearchIcon className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {item}
                  </span>
                </Badge>
              </motion.div>
            ));
          })()}
        </motion.div>

        <AnimatePresence>
          <motion.div
            className={cn(
              "flex items-center w-full rounded-2xl overflow-hidden mb-6",
              "border border-border/30",
              "bg-background/80 backdrop-blur-lg shadow-lg",
              isFocused ? "ring-2 ring-primary/20 shadow-xl border-primary/30" : "",
              isLoading ? "opacity-80" : ""
            )}
            whileTap={{ scale: 0.995 }}
          >
            <div className="flex-1 flex items-center relative">
              <div className="absolute left-6 text-muted-foreground/80">
                <SearchIcon className="h-6 w-6" />
              </div>
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder || "Search for diagrams..."}
                className="pl-16 pr-12 py-8 text-lg border-0 shadow-none focus-visible:ring-0 bg-transparent"
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
                  className="absolute right-4 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={handleClearSearch}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Enhanced Search suggestions dropdown */}
        <SearchSuggestions
          isVisible={showSuggestions && !isLoading}
          query={prompt}
          onSuggestionClick={handleSuggestionClick}
        />
        
        {isLoading && (
          <motion.div 
            className="absolute bottom-0 left-0 h-1 bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        )}

        {/* Example tags */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {examples.map((example, index) => (
            <motion.button
              key={index}
              className={cn(
                "text-sm px-4 py-2 rounded-full transition-colors",
                "bg-background/80 hover:bg-background",
                "border border-border/50 hover:border-primary/30",
                "text-muted-foreground hover:text-foreground",
                "shadow-sm hover:shadow",
                "backdrop-blur-sm"
              )}
              onClick={() => useExample(example)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {example}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
