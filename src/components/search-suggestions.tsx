
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchIcon, ClockIcon, TrendingUpIcon, BookmarkIcon, ZapIcon, CodeIcon, DatabaseIcon, NetworkIcon, FlowChartIcon } from "lucide-react";
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
  const [exampleSearches, setExampleSearches] = useState<string[]>([]);
  const { isDarkMode } = useTheme();
  
  // Set up example searches for educational and professional diagrams
  useEffect(() => {
    setExampleSearches([
      "data structure diagram",
      "software architecture diagram",
      "UML class diagram",
      "flowchart",
      "ER diagram",
      "network topology diagram",
      "system design diagram",
      "algorithm flowchart",
      "database schema diagram",
      "state machine diagram"
    ]);
  }, []);
  
  // Generate suggestions based on user query
  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const savedHistory = localStorage.getItem('diagramr-search-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const filteredHistory = history
          .slice(0, 3)
          .filter((item: string) => 
            !query || item.toLowerCase().includes(query.toLowerCase())
          );
        
        setRecentSearches(filteredHistory);
      }
    } catch (e) {
      console.error('Error loading search history:', e);
    }
    
    // Get search suggestions based on query
    const results = getSearchSuggestions(query);
    setSuggestions(results);
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
          "mt-1 overflow-hidden max-h-[400px] overflow-y-auto",
          isDarkMode ? "border-border/50" : "border-border",
          className
        )}
      >
        <div className="p-2">
          {/* Recent Searches */}
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
          
          {/* Suggestions based on query */}
          {suggestions.length > 0 && (
            <div className="mb-2">
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
          
          {/* Example Searches (shown when no query or suggestions) */}
          {(!query || (!suggestions.length || suggestions.length < 2)) && (
            <div className="mb-2">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                <ZapIcon className="h-3 w-3 mr-1" />
                Popular Diagram Searches
              </div>
              <div className="p-2 flex flex-wrap gap-2">
                {exampleSearches.map((example, index) => (
                  <Badge 
                    key={`example-${index}`}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => onSuggestionClick(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Direct search action */}
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
