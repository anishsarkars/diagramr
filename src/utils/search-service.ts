
import { DiagramResult } from "@/hooks/use-infinite-search";
import { searchGoogleImages } from "@/utils/googleSearch";
import { toast } from "sonner";

// Maximum number of search results to cache
const MAX_CACHE_SIZE = 200;

// Cache for search results
const searchCache = new Map<string, {
  timestamp: number;
  results: DiagramResult[];
}>();

// Clean old cache entries periodically
function cleanCache() {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  // Remove entries older than 1 hour
  for (const [key, entry] of searchCache.entries()) {
    if (now - entry.timestamp > ONE_HOUR) {
      searchCache.delete(key);
    }
  }
  
  // If still too many entries, remove oldest ones
  if (searchCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(searchCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    for (const [key] of toRemove) {
      searchCache.delete(key);
    }
  }
}

// Run cache cleanup every 5 minutes
setInterval(cleanCache, 5 * 60 * 1000);

// Main search function with improved fallback strategies
export async function searchDiagrams(
  query: string,
  page: number = 1
): Promise<DiagramResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  console.log(`[SearchService] Searching for "${query}" (page ${page})`);
  
  try {
    // Direct search without filtering or modifying the query
    console.log(`[SearchService] Fetching results for "${query}" page ${page}`);
    let results = await searchGoogleImages(query);
    
    // If no results, try a more generic query
    if (results.length === 0) {
      console.log('[SearchService] No results with primary query, trying with more generic terms');
      results = await searchGoogleImages(`${query} image`);
    }
    
    if (results.length === 0) {
      console.warn(`[SearchService] No results found for "${query}"`);
      toast.warning("No results found. Try a different search term.");
      return [];
    }
    
    console.log(`[SearchService] Found ${results.length} results for "${query}"`);
    return results;
    
  } catch (error) {
    console.error(`[SearchService] Error searching for "${query}":`, error);
    
    if (error.message.includes('quota exceeded')) {
      throw error; // Rethrow quota errors to handle specifically
    }
    
    toast.error("Search failed. Please try again.");
    return [];
  }
}

// Function to get search suggestions
export function getSearchSuggestions(query: string): string[] {
  if (!query.trim() || query.length < 2) {
    return getExampleSearches();
  }
  
  const lowercaseQuery = query.toLowerCase();
  
  // Comprehensive content types across various domains
  const contentTypes = [
    // Technical & Engineering
    "circuit diagram", "network topology", "UML class diagram", "system architecture",
    "database schema", "entity relationship diagram", "state machine diagram", 
    "flow chart", "sequence diagram", "activity diagram", "electrical wiring",
    "hydraulic system", "pneumatic system", "mechanical assembly", "API flow diagram",
    
    // Science & Math
    "cell structure", "dna replication", "photosynthesis process", "human anatomy",
    "molecular structure", "chemical reaction", "periodic table", "geological formation",
    "atomic structure", "electromagnetic spectrum", "orbital diagram", "vector field",
    "ecosystem diagram", "climate system", "food web", "phylogenetic tree",
    
    // Business & Process
    "business process model", "value chain", "organization chart", "SWOT analysis",
    "gantt chart", "customer journey map", "marketing funnel", "supply chain",
    "decision tree", "mind map", "fishbone diagram", "concept map",
    "process flow", "data flow diagram", "service blueprint", "value stream mapping",
    
    // Other Domains
    "network diagram", "infrastructure architecture", "plant layout", "floor plan",
    "city map", "subway map", "user flow", "information architecture",
    "genealogy tree", "timeline diagram", "sankey diagram", "voronoi diagram",
    "treemap", "heat map", "choropleth map", "venn diagram",
    
    // Common content searches
    "infographic", "chart", "graph", "illustration", "tutorial", "cheatsheet",
    "reference guide", "comparison chart", "roadmap", "timeline", "workflow"
  ];
  
  // Find matching suggestions
  let matchingSuggestions = contentTypes.filter(term => 
    term.includes(lowercaseQuery) || 
    lowercaseQuery.includes(term.substring(0, Math.min(term.length, 5)))
  );
  
  // Generate related suggestions based on partial matches
  if (matchingSuggestions.length < 3 && query.length >= 3) {
    const queryWords = lowercaseQuery.split(/\s+/);
    
    // Add related suggestions based on individual words in query
    const relatedSuggestions = contentTypes.filter(term => {
      return queryWords.some(word => 
        word.length >= 3 && term.includes(word) && !matchingSuggestions.includes(term)
      );
    });
    
    matchingSuggestions = [...matchingSuggestions, ...relatedSuggestions];
  }
  
  // Sort by relevance (exact matches first, then starts with, then includes)
  const sortedSuggestions = matchingSuggestions
    .sort((a, b) => {
      // Exact match
      if (a.toLowerCase() === lowercaseQuery) return -1;
      if (b.toLowerCase() === lowercaseQuery) return 1;
      
      // Starts with
      if (a.toLowerCase().startsWith(lowercaseQuery) && !b.toLowerCase().startsWith(lowercaseQuery)) return -1;
      if (!a.toLowerCase().startsWith(lowercaseQuery) && b.toLowerCase().startsWith(lowercaseQuery)) return 1;
      
      // Contains word exactly
      const aContainsExact = a.toLowerCase().split(/\s+/).includes(lowercaseQuery);
      const bContainsExact = b.toLowerCase().split(/\s+/).includes(lowercaseQuery);
      if (aContainsExact && !bContainsExact) return -1;
      if (!aContainsExact && bContainsExact) return 1;
      
      // Relevance by closeness to query
      const aRelevance = lowercaseQuery.length / a.length;
      const bRelevance = lowercaseQuery.length / b.length;
      if (aRelevance > bRelevance) return -1;
      if (aRelevance < bRelevance) return 1;
      
      return a.localeCompare(b);
    });
  
  // Remove duplicate suggestions and return top results
  return Array.from(new Set(sortedSuggestions)).slice(0, 10);
}

// Diverse example searches
function getExampleSearches(): string[] {
  return [
    "circuit diagram",
    "human anatomy",
    "photosynthesis process",
    "UML class diagram",
    "network topology",
    "solar system",
    "business process model",
    "entity relationship diagram",
    "molecular structure",
    "decision tree",
    "climate system",
    "data flow diagram",
    "mechanical assembly",
    "organization chart",
    "architectural blueprint"
  ];
}
