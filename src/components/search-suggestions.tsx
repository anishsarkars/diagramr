
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchIcon, ClockIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";

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
  
  // Popular diagram searches that would be useful for students and researchers
  const popularDiagramTypes = [
    "data flow diagram",
    "entity relationship diagram",
    "uml class diagram",
    "network architecture",
    "system architecture",
    "process flow diagram",
    "sequence diagram",
    "flowchart",
    "mind map",
    "organization chart",
    "database schema",
    "use case diagram",
    "state diagram",
    "activity diagram",
    "cloud architecture",
    "biochemical pathway",
    "neural network architecture",
    "circuit diagram",
    "molecular structure",
    "physics force diagram",
    "mathematical graph",
    "statistical distribution",
    "genetic pathway",
    "anatomical diagram",
    "ecosystem diagram",
    "geological formation"
  ];
  
  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const savedHistory = localStorage.getItem('diagramr-search-history');
      if (savedHistory) {
        setRecentSearches(JSON.parse(savedHistory).slice(0, 5));
      }
    } catch (e) {
      console.error('Error loading search history:', e);
    }
    
    // Set some trending searches for educational and research diagrams
    setTrendingSearches([
      "microservices architecture",
      "dna transcription diagram",
      "climate system diagram",
      "neural network architecture",
      "database schema design"
    ]);
    
  }, []);
  
  // Generate suggestions based on user query
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    // Filter popular diagram types that match the query
    const matchingSuggestions = popularDiagramTypes
      .filter(type => type.toLowerCase().includes(lowerQuery))
      .slice(0, 7);
    
    // Add domain-specific suggestions based on query terms
    const domainSpecificSuggestions: string[] = [];
    
    // Programming/development related
    if (lowerQuery.includes('code') || lowerQuery.includes('program') || 
        lowerQuery.includes('software') || lowerQuery.includes('develop')) {
      domainSpecificSuggestions.push(
        "software development lifecycle",
        "git workflow diagram",
        "agile scrum process",
        "CI/CD pipeline diagram"
      );
    }
    
    // Science related
    if (lowerQuery.includes('science') || lowerQuery.includes('biology') || 
        lowerQuery.includes('chemistry') || lowerQuery.includes('physics')) {
      domainSpecificSuggestions.push(
        "cell structure diagram",
        "atomic structure",
        "physics force diagram",
        "periodic table",
        "molecular structure"
      );
    }
    
    // Math related
    if (lowerQuery.includes('math') || lowerQuery.includes('algorithm') || 
        lowerQuery.includes('calculus') || lowerQuery.includes('statistics')) {
      domainSpecificSuggestions.push(
        "algorithm flowchart",
        "mathematical graph",
        "statistical distribution diagram",
        "calculus concept map"
      );
    }
    
    // Combine and deduplicate suggestions
    const filteredDomainSuggestions = domainSpecificSuggestions
      .filter(s => s.toLowerCase().includes(lowerQuery))
      .filter(s => !matchingSuggestions.includes(s));
    
    const allSuggestions = [...matchingSuggestions, ...filteredDomainSuggestions];
    
    // Add the exact query with a prefix if it's not already in the list
    if (query.length > 3 && !allSuggestions.some(s => s.toLowerCase() === lowerQuery)) {
      if (lowerQuery.includes('diagram') || lowerQuery.includes('chart') || 
          lowerQuery.includes('graph') || lowerQuery.includes('flow')) {
        allSuggestions.unshift(query);
      } else {
        allSuggestions.unshift(`${query} diagram`);
      }
    }
    
    setSuggestions(allSuggestions.slice(0, 7));
  }, [query]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "absolute z-50 mt-1 w-full rounded-lg border shadow-md",
          isDarkMode ? "bg-background/95 backdrop-blur-md border-border/50" : "bg-background border-border/30",
          className
        )}
      >
        <div className="py-2">
          {query && suggestions.length > 0 && (
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground font-medium px-2 mb-1.5">Suggestions</p>
              {suggestions.map((suggestion, index) => (
                <div
                  key={`suggestion-${index}`}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded-md cursor-pointer"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          )}

          {!query && (
            <>
              {recentSearches.length > 0 && (
                <div className="px-2 py-1.5">
                  <p className="text-xs text-muted-foreground font-medium px-2 mb-1.5">Recent Searches</p>
                  {recentSearches.map((search, index) => (
                    <div
                      key={`recent-${index}`}
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 rounded-md cursor-pointer"
                      onClick={() => onSuggestionClick(search)}
                    >
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{search}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-2 py-1.5 border-t border-border/20">
                <p className="text-xs text-muted-foreground font-medium px-2 mb-1.5">Popular Educational Diagrams</p>
                {trendingSearches.map((search, index) => (
                  <div
                    key={`trend-${index}`}
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 rounded-md cursor-pointer"
                    onClick={() => onSuggestionClick(search)}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm">{search}</span>
                    </div>
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
