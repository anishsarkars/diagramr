
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

  // Debounce search query to avoid too many searches
  useEffect(() => {
    if (!enabled || !searchQuery) return;
    
    const timer = setTimeout(() => {
      setActiveQuery(searchQuery);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [searchQuery, enabled]);
  
  // If recommendations are disabled or no search query, don't render
  if (!enabled || !activeQuery) return null;

  return <RecommendationSection searchQuery={activeQuery} />;
}
