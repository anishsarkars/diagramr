
import { useEffect, useState } from "react";
import { RecommendationSection } from "./recommendation-section";

interface RecommendationsConnectorProps {
  searchQuery: string;
  enabled?: boolean;
}

export function RecommendationsConnector({ 
  searchQuery, 
  enabled = true 
}: RecommendationsConnectorProps) {
  const [activeQuery, setActiveQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Debounce search query to avoid too many searches
  useEffect(() => {
    if (!enabled || !searchQuery) return;
    
    const timer = setTimeout(() => {
      setActiveQuery(searchQuery);
      setIsVisible(true);
    }, 800); // Slightly longer delay to let main search results load first
    
    return () => clearTimeout(timer);
  }, [searchQuery, enabled]);
  
  // If recommendations are disabled or no search query, don't render
  if (!enabled || !activeQuery || !isVisible) return null;

  return (
    <RecommendationSection 
      searchQuery={activeQuery} 
    />
  );
}
