
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { SearchIcon, LightbulbIcon, ArrowRight, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchSuggestions } from "@/components/search-suggestions";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";

interface AIInputProps {
  className?: string;
  onSubmit?: (prompt: string, mode: "search") => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function AIInput({ className, onSubmit, placeholder, isLoading }: AIInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();
  
  const [examples, setExamples] = useState<string[]>([
    "Data structure visualization",
    "UML class diagram for banking system",
    "Network architecture diagram",
    "Human anatomy diagram",
    "Photosynthesis process visualization",
    "Circuit diagram for Arduino",
    "Database schema for social media",
    "Chemical bonding illustration",
    "Force diagram in physics",
    "Protein synthesis process"
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
    <motion.div 
      ref={wrapperRef}
      className={cn("relative transition-all duration-300 w-full max-w-3xl", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AnimatePresence>
        <motion.div
          className={cn(
            "flex items-center w-full rounded-2xl overflow-hidden",
            "border border-border/30",
            "bg-background/80 backdrop-blur-lg shadow-lg",
            isFocused ? "ring-2 ring-primary/20 shadow-xl border-primary/30" : "",
            isLoading ? "opacity-80" : ""
          )}
          whileTap={{ scale: 0.995 }}
        >
          <div className="flex-1 flex items-center relative">
            <div className="absolute left-4 text-muted-foreground/80">
              <SearchIcon className="h-5 w-5" />
            </div>
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder || "Search for educational diagrams (e.g., 'network architecture')..."}
              className="pl-12 py-8 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent"
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
                    size="sm"
                    className="rounded-xl px-4 py-2.5 bg-primary/90 hover:bg-primary"
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
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

      {/* Example prompts */}
      {isFocused && !isLoading && !prompt && (
        <motion.div 
          className={cn(
            "mt-4 rounded-xl p-4 shadow-lg",
            isDarkMode 
              ? "bg-background/60 backdrop-blur-sm border border-border/20" 
              : "bg-background/80 backdrop-blur-sm border border-border/30"
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <LightbulbIcon className="h-4 w-4 text-primary" />
            <span>Try these examples</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examples.map((example, index) => (
              <motion.button
                key={index}
                className="text-left text-sm py-2 px-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2"
                onClick={() => useExample(example)}
                whileHover={{ x: 3 }}
              >
                <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
                {example}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
