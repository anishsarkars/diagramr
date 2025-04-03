
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, History, TrendingUp, Sparkles, Lightbulb, BookOpen, Network, Database } from "lucide-react";
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
    "Neural network architecture",
    "Molecular biology diagrams",
    "Circuit design schematics"
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
        "schematic",
        "visualization"
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
        "system",
        "architecture",
        "network"
      ];
      
      const specificTerms = {
        biology: ["cell", "organism", "DNA", "protein", "system", "structure"],
        physics: ["force", "motion", "field", "wave", "particle", "circuit"],
        chemistry: ["reaction", "molecule", "bond", "compound", "structure", "element"],
        "computer science": ["algorithm", "flowchart", "data structure", "network", "architecture", "system"],
        engineering: ["circuit", "system", "process", "design", "structure", "blueprint"],
        mathematics: ["graph", "function", "set", "geometry", "probability", "statistics"]
      };
      
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
      
      // Check if query contains any domains
      const matchedDomain = domains.find(domain => lowerQuery.includes(domain.toLowerCase()));
      
      if (matchedDomain) {
        // If query contains a domain, add domain-specific suggestions
        const domainKey = matchedDomain as keyof typeof specificTerms;
        if (specificTerms[domainKey]) {
          specificTerms[domainKey].forEach(term => {
            if (!lowerQuery.includes(term.toLowerCase())) {
              querySuggestions.push(`${query} ${term}`);
            }
          });
        }
      } else {
        // If no domain, suggest adding domains
        domains.forEach((domain, index) => {
          if (index % 3 === 0) {  // Add some domains to avoid too many suggestions
            querySuggestions.push(`${query} ${domain}`);
          }
        });
      }
      
      // Add "explain" or "visualization" prefix for certain types of queries
      if (!lowerQuery.startsWith("explain") && 
          !lowerQuery.includes("how") && 
          !lowerQuery.includes("what") &&
          !lowerQuery.includes("diagram")) {
        querySuggestions.push(`${query} explanation diagram`);
        querySuggestions.push(`How ${query} works diagram`);
      }
      
      // Deduplicate and limit
      const uniqueSuggestions = Array.from(new Set(querySuggestions))
        .filter(suggestion => suggestion.toLowerCase() !== query.toLowerCase())
        .slice(0, 6);
      
      setSuggestions(uniqueSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  if (!isVisible || (!suggestions.length && !searchHistory.length && !topSearches.length)) {
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
          "border border-border/40 rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto",
          className
        )}
      >
        {/* AI-Powered search descriptions */}
        {!query && (
          <div className="p-3 border-b border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium">AI-Powered Search</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Search for educational diagrams using natural language. Try specific topics or concepts.
            </p>
          </div>
        )}

        {/* Search suggestions */}
        {query && suggestions.length > 0 && (
          <div className="p-2">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center">
              <Lightbulb className="w-3 h-3 mr-1 text-primary/70" />
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
                  <Search className="w-3.5 h-3.5 mr-2 text-primary/70" />
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
              Popular Topics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {topSearches.map((item, index) => {
                let icon;
                if (index % 3 === 0) icon = <BookOpen className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />;
                else if (index % 3 === 1) icon = <Network className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />;
                else icon = <Database className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />;
                
                return (
                  <Button
                    key={`top-${index}`}
                    variant="ghost"
                    className="w-full justify-start text-sm px-2 py-1.5 h-auto rounded-md font-normal"
                    onClick={() => onSuggestionClick(item)}
                  >
                    {icon}
                    <span className="truncate">{item}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
