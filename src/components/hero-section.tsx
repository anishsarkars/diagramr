import { motion, AnimatePresence } from "framer-motion";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { SearchLimitIndicator } from "./search-limit-indicator";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Search, X, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth-context";
import { Input } from "@/components/ui/input";
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
  const [remainingSearches, setRemainingSearches] = useState<number | undefined>(3);
  const [showTips, setShowTips] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [typingSuggestions, setTypingSuggestions] = useState<string[]>([]);
  const [showTypingSuggestions, setShowTypingSuggestions] = useState(false);
  const [popularSearches, setPopularSearches] = useState<string[]>([
    "UML diagram",
    "Flowchart",
    "Entity-relationship diagram",
    "System architecture",
    "Network diagram",
    "Mind map",
    "Database schema",
    "Class diagram",
    "Sequence diagram"
  ]);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const descriptions = [
    "Find diagrams at the speed of thought.",
    "Visualize complex concepts instantly.",
    "Discover perfect illustrations quickly.",
    "Enhance your projects with visuals.",
    "Access high-quality diagrams effortlessly."
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

  // Auto-scroll effect with slowed down speed
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 0.5; // Reduced speed
      }
    };

    // Increased interval timing for slower animation
    const scrollInterval = setInterval(scroll, 50);
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

  const handleInputFocus = () => {
    if (searchQuery.trim().length > 1) {
      setShowTypingSuggestions(true);
    }
  };
  
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowTypingSuggestions(false);
    }, 200);
  };

  return (
    <motion.div 
      className="min-h-[80vh] md:min-h-[85vh] flex items-center justify-center bg-background py-4 md:py-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Subtle hero section gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none"></div>
      
      <div className="container relative z-10 flex flex-col items-center justify-center px-4 md:px-6 max-w-5xl">
        {/* Removing the logo section */}
        
        <div className="relative">
          <motion.div
            className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 opacity-30 blur-3xl"
            animate={{
              opacity: [0.3, 0.2, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.h1 
            className="font-serif relative font-medium text-2xl md:text-4xl lg:text-5xl mb-3 md:mb-4 text-center leading-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/90"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Find diagrams at the speed of thought.
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
          className="w-full max-w-2xl mx-auto mb-6 md:mb-8 relative hidden md:block"
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
        
        {/* Mobile search button */}
        <motion.div
          className="md:hidden w-full max-w-xs mx-auto mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            onClick={() => onSearch('')}
            className="w-full py-6 text-base rounded-2xl"
          >
            <Search className="h-5 w-5 mr-2" />
            <span>Search Diagrams</span>
          </Button>
        </motion.div>
        
        {/* Single row scrolling suggestions with slower speed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="relative overflow-hidden py-2">
            <div
              ref={scrollContainerRef}
              className="flex space-x-3 pb-3 overflow-x-auto scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Double the array to create the loop effect */}
              {[...popularSearches, ...popularSearches].map((search, index) => (
                <button
                  key={`${search}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionClick(search)}
                  className="flex-shrink-0 bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-foreground px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
