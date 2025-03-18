
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SearchIcon, Sparkles, ClockIcon, TrendingUpIcon } from "lucide-react";
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
  
  // Popular diagram searches that would be useful suggestions
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
    "component diagram",
    "deployment diagram",
    "microservices architecture",
    "infrastructure diagram",
    "aws architecture"
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
    
    // Set some trending searches (in a real app, this would come from an API)
    setTrendingSearches([
      "microservices architecture",
      "data flow diagram",
      "cloud infrastructure",
      "MERN stack architecture",
      "devops pipeline"
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
    
    // Database related
    if (lowerQuery.includes('data') || lowerQuery.includes('database') || 
        lowerQuery.includes('sql') || lowerQuery.includes('schema')) {
      domainSpecificSuggestions.push(
        "database schema diagram",
        "data warehouse architecture",
        "SQL query execution plan",
        "NoSQL data model"
      );
    }
    
    // Cloud/infrastructure related
    if (lowerQuery.includes('cloud') || lowerQuery.includes('aws') || 
        lowerQuery.includes('azure') || lowerQuery.includes('infrastructure')) {
      domainSpecificSuggestions.push(
        "AWS architecture diagram",
        "Azure infrastructure diagram",
        "cloud migration strategy",
        "hybrid cloud architecture"
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
    
    setSuggestions(allSuggestions.slice(0, 8));
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

          {query.length > 2 && (
            <div className="px-2 py-1.5 border-t border-border/20">
              <div
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded-md cursor-pointer"
                onClick={() => onSuggestionClick(`Generate diagram for ${query}`)}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm">Generate diagram for <span className="font-medium">{query}</span></span>
              </div>
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
                <p className="text-xs text-muted-foreground font-medium px-2 mb-1.5">Trending</p>
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
