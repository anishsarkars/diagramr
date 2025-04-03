
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateSuggestions } from "@/utils/gemini-ai";
import { Loader2, CornerDownLeft, Sparkles } from "lucide-react";

interface SearchSuggestionsProps {
  isVisible: boolean;
  query: string;
  onSuggestionClick: (suggestion: string) => void;
}

export function SearchSuggestions({ isVisible, query, onSuggestionClick }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [hasAIResults, setHasAIResults] = useState(false);

  useEffect(() => {
    if (!isVisible || !query.trim() || query.length < 3) {
      return;
    }

    const debouncedFetch = setTimeout(async () => {
      if (query === lastQuery) return;
      
      setIsLoading(true);
      setLastQuery(query);

      try {
        // Get suggestions from search history first
        const searchHistoryStr = localStorage.getItem('diagramr-search-history');
        let historySuggestions: string[] = [];
        
        if (searchHistoryStr) {
          try {
            const history: string[] = JSON.parse(searchHistoryStr);
            historySuggestions = history.filter(item => 
              item.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 2);
          } catch (e) {
            console.error('Error parsing search history:', e);
          }
        }
        
        // Add AI-generated suggestions
        const aiResponse = await generateSuggestions(query);
        
        if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
          setHasAIResults(true);
          
          // Combine history and AI suggestions
          const combinedSuggestions = [
            ...historySuggestions,
            ...aiResponse.suggestions.filter(suggestion => 
              !historySuggestions.includes(suggestion)
            )
          ].slice(0, 6);
          
          setSuggestions(combinedSuggestions);
        } else {
          // Fallback to basic suggestions
          setHasAIResults(false);
          const basicSuggestions = [
            `${query} diagram`,
            `${query} flowchart`,
            `${query} process`,
            `${query} architecture`,
          ].filter(s => s !== query);
          
          setSuggestions([...historySuggestions, ...basicSuggestions].slice(0, 6));
        }
      } catch (error) {
        console.error("Error generating suggestions:", error);
        
        // Fallback suggestions
        setSuggestions([
          `${query} diagram`,
          `${query} flowchart`,
          `${query} chart`,
        ]);
        
        setHasAIResults(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debouncedFetch);
  }, [query, isVisible, lastQuery]);

  if (!isVisible || !query || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute left-0 right-0 top-full mt-1 rounded-lg border bg-card shadow-lg z-50 overflow-hidden"
      >
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Generating suggestions...</span>
            </div>
          ) : (
            <div className="space-y-0.5">
              {hasAIResults && (
                <div className="px-2 pt-1 pb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground">AI-powered suggestions</span>
                </div>
              )}
              
              {suggestions.map((suggestion, i) => (
                <motion.div
                  key={suggestion}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: i * 0.05 }
                  }}
                  whileHover={{ backgroundColor: "hsl(var(--accent))" }}
                  className="flex items-center justify-between cursor-pointer px-3 py-1.5 text-sm rounded-md"
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  <span>{suggestion}</span>
                  <CornerDownLeft className="h-3 w-3 text-muted-foreground opacity-70" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
