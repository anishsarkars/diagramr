
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, History, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

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
  className,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [topSearches, setTopSearches] = useState<string[]>([
    "Human anatomy diagrams",
    "Cell structure visualization",
    "Physics force diagrams",
    "Chemical reactions illustrated",
    "Data structure flowcharts",
  ]);

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem("diagramr-search-history");
    
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setSearchHistory(
          Array.isArray(parsedHistory) ? parsedHistory.slice(0, 5) : []
        );
      } catch (e) {
        console.error("Error parsing search history:", e);
      }
    }
    
    // Generate smart suggestions based on the query
    if (query) {
      const baseTerms = [
        "diagram",
        "chart",
        "visual",
        "illustration",
        "schematic"
      ];
      
      const domains = [
        "biology",
        "physics",
        "chemistry",
        "computer science",
        "engineering",
        "mathematics",
        "medical",
        "anatomy",
        "process",
        "system"
      ];
      
      // Generate context-sensitive suggestions
      const querySuggestions: string[] = [];
      
      // Add exact query + generic terms suggestions
      baseTerms.forEach(term => {
        if (!query.toLowerCase().includes(term)) {
          querySuggestions.push(`${query} ${term}`);
        }
      });
      
      // Add domain-specific suggestions based on query
      const lowerQuery = query.toLowerCase();
      if (domains.some(domain => lowerQuery.includes(domain))) {
        // If query already contains a domain, suggest specific subtopics
        if (lowerQuery.includes("biology")) {
          querySuggestions.push(
            `${query} cell structure`,
            `${query} organ system`,
            `${query} process flow`
          );
        } else if (lowerQuery.includes("physics")) {
          querySuggestions.push(
            `${query} force diagram`,
            `${query} circuit diagram`,
            `${query} vector field`
          );
        } else if (lowerQuery.includes("computer science") || lowerQuery.includes("programming")) {
          querySuggestions.push(
            `${query} flowchart`,
            `${query} algorithm`,
            `${query} data structure`
          );
        }
      } else {
        // If no domain, suggest adding domains
        domains.forEach(domain => {
          if (Math.random() > 0.7) {  // Randomly select some domains to avoid too many suggestions
            querySuggestions.push(`${query} ${domain}`);
          }
        });
      }
      
      // Deduplicate and limit
      const uniqueSuggestions = Array.from(new Set(querySuggestions)).slice(0, 5);
      setSuggestions(uniqueSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  if (!isVisible || (!suggestions.length && !searchHistory.length)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "absolute top-full left-0 right-0 mt-1 z-50 bg-card/95 backdrop-blur-md",
          "border border-border/40 rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto",
          className
        )}
      >
        {/* Search suggestions */}
        {query && suggestions.length > 0 && (
          <div className="p-2">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-primary/70" />
              Suggestions
            </h3>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={`suggestion-${index}`}
                  variant="ghost"
                  className="w-full justify-start text-sm px-2 py-1.5 h-auto rounded-md font-normal"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <Search className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  <span className="truncate">{suggestion}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Search history */}
        {searchHistory.length > 0 && (
          <div className="p-2 border-t border-border/30">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center">
              <History className="w-3 h-3 mr-1 text-muted-foreground" />
              Recent Searches
            </h3>
            <div className="space-y-1">
              {searchHistory.map((item, index) => (
                <Button
                  key={`history-${index}`}
                  variant="ghost"
                  className="w-full justify-start text-sm px-2 py-1.5 h-auto rounded-md font-normal"
                  onClick={() => onSuggestionClick(item)}
                >
                  <History className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />
                  <span className="truncate">{item}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Trending/popular searches */}
        {!query && (
          <div className="p-2 border-t border-border/30">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-primary/70" />
              Popular Searches
            </h3>
            <div className="space-y-1">
              {topSearches.map((item, index) => (
                <Button
                  key={`top-${index}`}
                  variant="ghost"
                  className="w-full justify-start text-sm px-2 py-1.5 h-auto rounded-md font-normal"
                  onClick={() => onSuggestionClick(item)}
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />
                  <span className="truncate">{item}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
