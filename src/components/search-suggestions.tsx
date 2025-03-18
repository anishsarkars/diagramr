
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, History, Lightbulb } from "lucide-react";

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
  const [history, setHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([
    "Network architecture diagram",
    "Database schema design",
    "Software development lifecycle",
    "Cloud infrastructure diagram",
    "UML class diagram",
    "Data flow diagram",
    "Entity relationship model",
    "Microservices architecture",
    "System context diagram"
  ]);

  useEffect(() => {
    // Load search history from local storage
    const savedHistory = localStorage.getItem('diagramr-search-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(Array.isArray(parsed) ? parsed.slice(0, 5) : []);
      } catch (e) {
        console.error('Error parsing search history:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Generate suggestions based on current query
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      
      // Filter popular searches and history that match the current query
      const matchingPopular = popularSearches.filter(item => 
        item.toLowerCase().includes(lowercaseQuery)
      );
      
      const matchingHistory = history.filter(item => 
        item.toLowerCase().includes(lowercaseQuery)
      );
      
      // Generate AI-enhanced suggestions
      const enhancedSuggestions = [
        `${query} flowchart`,
        `${query} architecture diagram`,
        `${query} process visualization`,
        `${query} system diagram`
      ];
      
      // Combine and deduplicate suggestions
      const combined = [...matchingHistory, ...matchingPopular, ...enhancedSuggestions];
      const uniqueSuggestions = Array.from(new Set(combined)).slice(0, 8);
      
      setSuggestions(uniqueSuggestions);
    } else {
      // Show popular searches and history when query is empty
      const combinedSuggestions = [...history, ...popularSearches];
      setSuggestions(Array.from(new Set(combinedSuggestions)).slice(0, 8));
    }
  }, [query, history, popularSearches]);

  const handleSuggestionClick = (suggestion: string) => {
    // Save to search history
    const newHistory = [suggestion, ...history.filter(item => item !== suggestion)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
    
    // Pass suggestion to parent component
    onSuggestionClick(suggestion);
  };

  return (
    <AnimatePresence>
      {isVisible && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "absolute left-0 right-0 z-50 mt-2 bg-background/95 backdrop-blur-sm",
            "border border-border/30 rounded-xl shadow-lg overflow-hidden",
            className
          )}
        >
          <div className="p-2">
            {suggestions.map((suggestion, index) => {
              // Determine icon based on suggestion source
              let icon = <Lightbulb className="h-4 w-4 text-primary/70" />;
              
              if (history.includes(suggestion)) {
                icon = <History className="h-4 w-4 text-muted-foreground" />;
              } else if (popularSearches.includes(suggestion)) {
                icon = <TrendingUp className="h-4 w-4 text-primary" />;
              } else if (suggestion.includes(query) && query.trim() !== suggestion) {
                icon = <Sparkles className="h-4 w-4 text-primary/70" />;
              }
              
              return (
                <motion.button
                  key={index}
                  whileHover={{ x: 3, backgroundColor: "rgba(0,0,0,0.05)" }}
                  className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {icon}
                  <span className="flex-1">{suggestion}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
