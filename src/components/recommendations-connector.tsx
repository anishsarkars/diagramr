
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

  // Reset state when the search query changes
  useEffect(() => {
    if (!enabled || !searchQuery) {
      setIsVisible(false);
      return;
    }
    
    // Clear previous state
    setIsVisible(false);
    
    // Debounce search query to avoid too many searches
    const timer = setTimeout(() => {
      console.log("Setting active query for recommendations:", searchQuery);
      setActiveQuery(searchQuery);
      setIsVisible(true);
    }, 800); // Slightly longer delay to let main search results load first
    
    return () => clearTimeout(timer);
  }, [searchQuery, enabled]);
  
  // For debugging
  useEffect(() => {
    console.log("RecommendationsConnector state:", { 
      enabled, 
      searchQuery, 
      activeQuery, 
      isVisible 
    });
  }, [enabled, searchQuery, activeQuery, isVisible]);
  
  // If recommendations are disabled or no search query, don't render
  if (!enabled || !activeQuery || !isVisible) {
    console.log("RecommendationsConnector not rendering", { enabled, activeQuery, isVisible });
    return null;
  }

  console.log("Rendering RecommendationSection with query:", activeQuery);
  return (
    <RecommendationSection 
      searchQuery={activeQuery} 
    />
  );
}
