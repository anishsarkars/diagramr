
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  SearchIcon, 
  ClockIcon, 
  TrendingUpIcon, 
  BookmarkIcon, 
  ZapIcon, 
  CodeIcon, 
  DatabaseIcon, 
  NetworkIcon, 
  ActivityIcon,
  BarChartIcon,
  GitBranchIcon,
  ServerIcon,
  GanttChartIcon
} from "lucide-react";
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
  const [categorySearches, setCategorySearches] = useState<{[key: string]: string[]}>({}); 
  const { isDarkMode } = useTheme();
  
  // Set up trending searches and category-based search suggestions
  useEffect(() => {
    setTrendingSearches([
      "system architecture diagram",
      "UML class diagram",
      "data structure visualization",
      "entity relationship diagram",
      "network topology"
    ]);
    
    setCategorySearches({
      "Software Engineering": [
        "class diagram",
        "sequence diagram",
        "uml diagram", 
        "microservices architecture",
        "api architecture"
      ],
      "Computer Science": [
        "linked list visualization",
        "binary tree diagram",
        "sorting algorithm visualization",
        "hash table structure",
        "data structure diagram"
      ],
      "Network": [
        "network topology diagram",
        "cloud infrastructure",
        "server architecture",
        "network security diagram",
        "vpc diagram"
      ],
      "Database": [
        "ER diagram",
        "database schema",
        "data warehouse architecture",
        "nosql database model",
        "database relationship diagram"
      ]
    });
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

  // Determine if we should show category suggestions
  const showCategories = !query || query.length < 3;
  
  // Determine if we should show trending searches
  const showTrending = !query || query.length < 2;
  
  // Get relevant category suggestions based on query
  const getRelevantCategorySuggestions = () => {
    if (!query) return categorySearches;
    
    const filteredCategories: {[key: string]: string[]} = {};
    
    Object.entries(categorySearches).forEach(([category, searches]) => {
      const filteredSearches = searches.filter(search => 
        search.toLowerCase().includes(query.toLowerCase()) || 
        category.toLowerCase().includes(query.toLowerCase())
      );
      
      if (filteredSearches.length > 0) {
        filteredCategories[category] = filteredSearches;
      }
    });
    
    return filteredCategories;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "absolute z-50 w-full bg-background border rounded-xl shadow-lg",
          "mt-1 overflow-hidden max-h-[450px] overflow-y-auto",
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
                  className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center transition-colors"
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
                  className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center transition-colors"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Trending Searches */}
          {showTrending && trendingSearches.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                Trending Searches
              </div>
              <div className="p-2 flex flex-wrap gap-2">
                {trendingSearches.map((trending, index) => (
                  <Badge 
                    key={`trending-${index}`}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => onSuggestionClick(trending)}
                  >
                    <TrendingUpIcon className="h-3 w-3 mr-1" />
                    {trending}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Category-based Suggestions */}
          {showCategories && (
            <div className="mb-2">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                <ZapIcon className="h-3 w-3 mr-1" />
                Popular Categories
              </div>
              <div className="p-2 space-y-3">
                {Object.entries(getRelevantCategorySuggestions()).map(([category, searches], categoryIndex) => (
                  <div key={`category-${categoryIndex}`} className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground flex items-center mb-1">
                      {category === "Software Engineering" && <CodeIcon className="h-3 w-3 mr-1" />}
                      {category === "Computer Science" && <GitBranchIcon className="h-3 w-3 mr-1" />}
                      {category === "Network" && <NetworkIcon className="h-3 w-3 mr-1" />}
                      {category === "Database" && <DatabaseIcon className="h-3 w-3 mr-1" />}
                      {category}
                    </div>
                    <div className="flex flex-wrap gap-2 pl-1">
                      {searches.slice(0, 5).map((search, searchIndex) => (
                        <Badge 
                          key={`category-${categoryIndex}-search-${searchIndex}`}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary/40 transition-colors"
                          onClick={() => onSuggestionClick(search)}
                        >
                          {category === "Software Engineering" && <CodeIcon className="h-3 w-3 mr-1" />}
                          {category === "Computer Science" && <GitBranchIcon className="h-3 w-3 mr-1" />}
                          {category === "Network" && <NetworkIcon className="h-3 w-3 mr-1" />}
                          {category === "Database" && <DatabaseIcon className="h-3 w-3 mr-1" />}
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Direct search action */}
          {query && (
            <div className="border-t mt-1 pt-1">
              <div 
                className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center text-primary transition-colors"
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
