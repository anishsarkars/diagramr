
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchIcon, ClockIcon, TrendingUpIcon, BookmarkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { getSearchSuggestions } from "@/utils/search-service";

interface SearchSuggestionsProps {
  isVisible: boolean;
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

export function SearchSuggestions({ 
  isVisible, 
  query, 
  onSuggestionClick,
  className
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const { isDarkMode } = useTheme();
  
  // Set up trending searches for educational and research diagrams
  useEffect(() => {
    setTrendingSearches([
      "microservices architecture diagram",
      "data flow diagram",
      "neural network architecture",
      "entity relationship diagram",
      "system architecture diagram"
    ]);
  }, []);
  
  // Generate suggestions based on user query
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    
    // Get search suggestions
    const results = getSearchSuggestions(query);
    setSuggestions(results);
    
    // Load recent searches from localStorage
    try {
      const savedHistory = localStorage.getItem('diagramr-search-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const filteredHistory = history.filter((item: string) => 
          item.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        
        setRecentSearches(filteredHistory);
      }
    } catch (e) {
      console.error('Error loading search history:', e);
    }
  }, [query]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "absolute z-50 w-full bg-background border rounded-lg shadow-lg",
          "mt-1 overflow-hidden",
          isDarkMode ? "border-border/50" : "border-border",
          className
        )}
      >
        <div className="p-2">
          {(suggestions.length > 0 || recentSearches.length > 0) ? (
            <>
              {recentSearches.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <div 
                      key={`recent-${index}`}
                      className="px-3 py-2 hover:bg-muted rounded cursor-pointer flex items-center"
                      onClick={() => onSuggestionClick(search)}
                    >
                      <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{search}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {suggestions.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                    <SearchIcon className="h-3 w-3 mr-1" />
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={`suggestion-${index}`}
                      className="px-3 py-2 hover:bg-muted rounded cursor-pointer flex items-center"
                      onClick={() => onSuggestionClick(suggestion)}
                    >
                      <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : !query && trendingSearches.length > 0 ? (
            <div>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                Popular Searches
              </div>
              <div className="p-2 flex flex-wrap gap-2">
                {trendingSearches.map((trending, index) => (
                  <Badge 
                    key={`trending-${index}`}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => onSuggestionClick(trending)}
                  >
                    {trending}
                  </Badge>
                ))}
              </div>
            </div>
          ) : query ? (
            <div className="px-3 py-2 hover:bg-muted rounded cursor-pointer flex items-center" onClick={() => onSuggestionClick(query)}>
              <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Search for "{query}"</span>
            </div>
          ) : null}
          
          {query && (
            <div className="border-t mt-1 pt-1">
              <div 
                className="px-3 py-2 hover:bg-muted rounded cursor-pointer flex items-center text-primary"
                onClick={() => onSuggestionClick(query)}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                <span>Search for "{query}"</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
