import { motion, AnimatePresence } from "framer-motion";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { SearchLimitIndicator } from "./search-limit-indicator";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const descriptions = [
    "Find educational diagrams for your studies",
    "Visualize complex academic concepts",
    "Discover scientific illustrations & charts",
    "Enhance your learning with visual aids",
    "Access high-quality educational resources"
  ];

  const popularSearches = [
    "human anatomy diagrams",
    "molecular structure visualization",
    "physics force diagrams",
    "data structures and algorithms",
    "circuit design diagrams",
    "neural network architecture",
    "cell division process",
    "solar system model",
    "human brain anatomy",
    "DNA structure diagram"
  ];

  const suggestions = popularSearches.filter(search => 
    search.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);
  
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDescriptionIndex((prevIndex) => (prevIndex + 1) % descriptions.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [descriptions.length]);

  // Auto-scroll effect for popular searches
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const scrollInterval = setInterval(scroll, 30);
    return () => clearInterval(scrollInterval);
  }, []);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <motion.div 
      className="min-h-[80vh] md:min-h-[85vh] flex items-center justify-center bg-background py-4 md:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="container relative z-10 flex flex-col items-center justify-center px-4 md:px-6 max-w-5xl">
        {/* Removing the logo section */}
        
        <div className="relative">
          <motion.div
            className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 opacity-50 blur-2xl"
            animate={{
              opacity: [0.5, 0.3, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.h1 
            className="font-serif relative font-bold text-2xl md:text-4xl lg:text-5xl mb-3 md:mb-4 text-center leading-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            What's on your mind?
          </motion.h1>
        </div>
        
        {/* Animated description */}
        <motion.div
          className="mb-8 md:mb-12 h-6 md:h-8 overflow-hidden relative"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDescriptionIndex}
              className="text-base md:text-xl text-muted-foreground text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {descriptions[currentDescriptionIndex]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        {/* Search input with suggestions */}
        <motion.div 
          className="w-full max-w-2xl mx-auto mb-6 md:mb-8 relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            duration: 0.5, 
            delay: 0.6,
            scale: {
              delay: 1.5,
              duration: 0.8,
              repeat: 2,
              repeatType: "reverse"
            }
          }}
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="What diagrams are you looking for?"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-12 pr-20 py-6 md:py-7 text-base md:text-lg rounded-2xl border-primary/20 focus:border-primary shadow-md focus:ring-primary/30"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1 hover:bg-primary/5 rounded-full"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <Button
                type="submit"
                disabled={!searchQuery.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl px-4 md:px-5 py-5 md:py-6"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ) : (
                  <>
                    <span className="mr-1">Search</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Search suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden z-50"
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={cn(
                        "w-full px-4 py-3 text-left hover:bg-primary/5 flex items-center gap-3 transition-colors",
                        "text-sm md:text-base",
                        index !== suggestions.length - 1 && "border-b border-border/50"
                      )}
                      whileHover={{ x: 4 }}
                    >
                      <Search className="h-4 w-4 text-primary/60" />
                      {suggestion}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Popular searches scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="w-full max-w-2xl mx-auto mb-6 md:mb-8 relative"
        >
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-hidden whitespace-nowrap py-2"
          >
            {[...popularSearches, ...popularSearches].map((search, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-primary/20 hover:bg-primary/5 text-sm"
                  onClick={() => onSearch(search)}
                >
                  {search}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <SearchLimitIndicator />
      </div>
    </motion.div>
  );
}
