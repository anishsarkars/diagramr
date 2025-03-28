
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
  GanttChartIcon,
  Beaker,
  Atom,
  Binary,
  BookOpen,
  BrainCircuit,
  FileDigit,
  FlaskConical,
  LineChart,
  MessagesSquare,
  PlusCircle
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
      "cell structure diagram",
      "data structure visualization",
      "entity relationship diagram",
      "force diagram physics",
      "periodic table elements",
      "cpu scheduling algorithm",
      "operating system process diagram",
      "network architecture diagram"
    ]);
    
    setCategorySearches({
      "Biology": [
        "cell structure",
        "photosynthesis diagram",
        "human anatomy", 
        "dna structure",
        "nervous system",
        "protein synthesis",
        "cellular respiration"
      ],
      "Computer Science": [
        "data structure visualization",
        "algorithm flowchart",
        "uml class diagram",
        "database schema",
        "system architecture",
        "binary tree visualization",
        "cpu scheduling algorithm"
      ],
      "Physics": [
        "force diagram",
        "circuit diagram",
        "wave interference",
        "energy transfer",
        "quantum mechanics",
        "electromagnetic spectrum",
        "light refraction"
      ],
      "Chemistry": [
        "molecular structure",
        "periodic table",
        "chemical reactions",
        "bonding diagram",
        "electron configuration",
        "organic chemistry structures",
        "titration curve"
      ],
      "Engineering": [
        "mechanical component diagram",
        "electrical wiring diagram",
        "system design blueprint", 
        "bridge structure",
        "hydraulic system",
        "control system diagram",
        "circuit design"
      ]
    });
  }, []);
  
  // Generate suggestions based on user query with improved relevance
  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const savedHistory = localStorage.getItem('diagramr-search-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const filteredHistory = history
          .slice(0, 5) // Show more recent searches
          .filter((item: string) => 
            !query || item.toLowerCase().includes(query.toLowerCase())
          );
        
        setRecentSearches(filteredHistory);
      }
    } catch (e) {
      console.error('Error loading search history:', e);
    }
    
    // Get improved search suggestions based on query
    const results = getSearchSuggestions(query);
    
    // Add some variations if query is specific enough
    if (query && query.length >= 3) {
      const enhancedResults = [...results];
      
      // Only add these if they're not already in results
      if (!results.includes(`${query} diagram`) && !query.includes('diagram')) {
        enhancedResults.push(`${query} diagram`);
      }
      
      if (!results.includes(`${query} visualization`) && !query.includes('visualization')) {
        enhancedResults.push(`${query} visualization`);
      }
      
      if (!results.includes(`${query} structure`) && !query.includes('structure')) {
        enhancedResults.push(`${query} structure`);
      }
      
      setSuggestions(enhancedResults.slice(0, 10)); // Limit to prevent overwhelming
    } else {
      setSuggestions(results);
    }
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

  // Get an icon for a category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "Biology":
        return <FlaskConical className="h-3 w-3 mr-1" />;
      case "Computer Science":
        return <Binary className="h-3 w-3 mr-1" />;
      case "Physics": 
        return <Atom className="h-3 w-3 mr-1" />;
      case "Chemistry":
        return <Beaker className="h-3 w-3 mr-1" />;
      case "Engineering":
        return <FileDigit className="h-3 w-3 mr-1" />;
      default:
        return <BookOpen className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "absolute z-50 w-full bg-background border rounded-xl shadow-lg",
          "mt-1 overflow-hidden max-h-[450px] overflow-y-auto scrollbar-thin",
          isDarkMode ? "border-border/50 shadow-xl" : "border-border shadow-lg",
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
                <motion.div 
                  key={`recent-${index}`}
                  className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center transition-colors"
                  onClick={() => onSuggestionClick(search)}
                  whileHover={{ x: 3 }}
                >
                  <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{search}</span>
                </motion.div>
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
                <motion.div 
                  key={`suggestion-${index}`}
                  className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center transition-colors"
                  onClick={() => onSuggestionClick(suggestion)}
                  whileHover={{ x: 3 }}
                >
                  <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{suggestion}</span>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Trending Searches */}
          {showTrending && trendingSearches.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                Trending Academic Searches
              </div>
              <div className="p-2 flex flex-wrap gap-2">
                {trendingSearches.map((trending, index) => (
                  <motion.div
                    key={`trending-${index}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge 
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => onSuggestionClick(trending)}
                    >
                      <TrendingUpIcon className="h-3 w-3 mr-1" />
                      {trending}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Category-based Suggestions */}
          {showCategories && (
            <div className="mb-2">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center">
                <ZapIcon className="h-3 w-3 mr-1" />
                Academic Categories
              </div>
              <div className="p-2 space-y-3">
                {Object.entries(getRelevantCategorySuggestions()).map(([category, searches], categoryIndex) => (
                  <div key={`category-${categoryIndex}`} className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground flex items-center mb-1">
                      {getCategoryIcon(category)}
                      {category}
                    </div>
                    <div className="flex flex-wrap gap-2 pl-1">
                      {searches.slice(0, 5).map((search, searchIndex) => (
                        <motion.div
                          key={`category-${categoryIndex}-search-${searchIndex}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge 
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary/40 transition-colors"
                            onClick={() => onSuggestionClick(search)}
                          >
                            {getCategoryIcon(category)}
                            {search}
                          </Badge>
                        </motion.div>
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
              <motion.div 
                className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center text-primary transition-colors"
                onClick={() => onSuggestionClick(query)}
                whileHover={{ x: 3 }}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                <span>Search for "{query}"</span>
              </motion.div>
              
              {/* Add variations of the search */}
              {query.length > 2 && (
                <div className="p-2 flex flex-wrap gap-2">
                  {!query.includes('diagram') && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Badge 
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => onSuggestionClick(`${query} diagram`)}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        {query} diagram
                      </Badge>
                    </motion.div>
                  )}
                  {!query.includes('visualization') && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Badge 
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => onSuggestionClick(`${query} visualization`)}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        {query} visualization
                      </Badge>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
