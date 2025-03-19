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

// Main search function
export async function searchDiagrams(
  query: string,
  page: number = 1,
  apiKey: string = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4",
  searchId: string = "260090575ae504419"
): Promise<DiagramResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  console.log(`[SearchService] Searching for "${query}" (page ${page})`);
  
  // Check cache for first page results
  const cacheKey = `search:${query.toLowerCase()}:${page}`;
  if (searchCache.has(cacheKey)) {
    console.log(`[SearchService] Cache hit for "${query}" page ${page}`);
    return searchCache.get(cacheKey)!.results;
  }
  
  try {
    console.log(`[SearchService] Fetching results for "${query}" page ${page}`);
    
    // Get search results from Google Images 
    const results = await searchGoogleImages(query, apiKey, searchId, page);
    
    if (results.length === 0) {
      console.warn(`[SearchService] No results found for "${query}"`);
      toast.warning("No diagrams found. Try a different search term.");
      return [];
    }
    
    // Sort results by relevance
    const enhancedResults = enhanceSearchResults(results, query);
    
    // Cache the results
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      results: enhancedResults
    });
    
    console.log(`[SearchService] Found ${enhancedResults.length} results for "${query}"`);
    return enhancedResults;
  } catch (error) {
    console.error(`[SearchService] Error searching for "${query}":`, error);
    toast.error("Search failed. Please try again.");
    
    // Return empty results on error
    return [];
  }
}

// Function to enhance search results with better relevance sorting and tags
function enhanceSearchResults(results: DiagramResult[], query: string): DiagramResult[] {
  // Extract terms from the query for relevance scoring
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  // Score function for relevance
  const scoreResult = (result: DiagramResult): number => {
    let score = 0;
    const title = result.title.toLowerCase();
    
    // Title contains query terms
    for (const term of queryTerms) {
      if (title.includes(term)) score += 3;
    }
    
    // Tags contain query terms
    if (result.tags) {
      for (const term of queryTerms) {
        for (const tag of result.tags) {
          if (tag.includes(term)) score += 2;
        }
      }
    }
    
    // Boost diagrams and educational content
    const diagramKeywords = ['diagram', 'chart', 'flowchart', 'infographic', 'visualization'];
    const educationalKeywords = ['educational', 'learning', 'academic', 'textbook'];
    
    for (const keyword of diagramKeywords) {
      if (title.includes(keyword)) score += 5;
    }
    
    for (const keyword of educationalKeywords) {
      if (title.includes(keyword)) score += 3;
    }
    
    return score;
  };
  
  // Clone results to avoid mutating the original array
  const enhancedResults = [...results];
  
  // Sort results by relevance score
  enhancedResults.sort((a, b) => scoreResult(b) - scoreResult(a));
  
  return enhancedResults;
}

// Function to get search suggestions
export function getSearchSuggestions(query: string): string[] {
  if (!query.trim() || query.length < 2) {
    return [];
  }
  
  const lowercaseQuery = query.toLowerCase();
  
  // Common education and research-related diagram types
  const commonDiagramTypes = [
    "flowchart",
    "sequence diagram",
    "entity relationship diagram",
    "class diagram",
    "use case diagram",
    "state diagram",
    "activity diagram",
    "component diagram",
    "deployment diagram",
    "uml diagram",
    "mind map",
    "concept map",
    "process flow",
    "data flow diagram",
    "network diagram",
    "system architecture",
    "database schema"
  ];
  
  // Academic fields
  const academicFields = [
    "biology",
    "chemistry",
    "physics",
    "mathematics",
    "computer science",
    "engineering",
    "medicine",
    "psychology",
    "sociology",
    "economics",
    "business",
    "history",
    "geography",
    "linguistics",
    "education"
  ];
  
  // Suggestions based on diagram types
  const diagramSuggestions = commonDiagramTypes
    .filter(type => type.includes(lowercaseQuery))
    .map(type => type);
  
  // Suggestions based on academic fields + diagram
  const fieldSuggestions = academicFields
    .filter(field => field.includes(lowercaseQuery))
    .map(field => `${field} diagram`);
  
  // Combine and select the best suggestions
  const allSuggestions = [...diagramSuggestions, ...fieldSuggestions];
  
  // Sort by relevance (exact matches first, then starts with, then includes)
  return allSuggestions
    .sort((a, b) => {
      // Exact match
      if (a.toLowerCase() === lowercaseQuery) return -1;
      if (b.toLowerCase() === lowercaseQuery) return 1;
      
      // Starts with
      if (a.toLowerCase().startsWith(lowercaseQuery) && !b.toLowerCase().startsWith(lowercaseQuery)) return -1;
      if (!a.toLowerCase().startsWith(lowercaseQuery) && b.toLowerCase().startsWith(lowercaseQuery)) return 1;
      
      // Alphabetical
      return a.localeCompare(b);
    })
    .slice(0, 5);
}
