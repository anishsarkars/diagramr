
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
  
  // Enhance query for better diagram results
  const enhancedQuery = enhanceSearchQuery(query);
  
  // Check cache for first page results
  const cacheKey = `search:${query.toLowerCase()}:${page}`;
  if (searchCache.has(cacheKey)) {
    console.log(`[SearchService] Cache hit for "${query}" page ${page}`);
    return searchCache.get(cacheKey)!.results;
  }
  
  try {
    console.log(`[SearchService] Fetching results for "${query}" page ${page}`);
    
    // Get search results from Google Images 
    const results = await searchGoogleImages(enhancedQuery, apiKey, searchId, page);
    
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

// Function to enhance the search query to find better diagrams
function enhanceSearchQuery(query: string): string {
  // Check if the query already contains diagram-related terms
  const diagramTerms = ['diagram', 'chart', 'flowchart', 'visualization', 'graph', 'schema'];
  const hasAnyDiagramTerm = diagramTerms.some(term => query.toLowerCase().includes(term));
  
  // If query doesn't already specify diagram, add it
  if (!hasAnyDiagramTerm) {
    return `${query} diagram`;
  }
  
  return query;
}

// Function to enhance search results with better relevance sorting and tags
function enhanceSearchResults(results: DiagramResult[], query: string): DiagramResult[] {
  // Extract terms from the query for relevance scoring
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  // Score function for relevance
  const scoreResult = (result: DiagramResult): number => {
    let score = 0;
    const title = result.title.toLowerCase();
    
    // Title contains exact query
    if (title.includes(query.toLowerCase())) score += 10;
    
    // Title contains query terms
    for (const term of queryTerms) {
      if (title.includes(term)) score += 5;
    }
    
    // Tags contain query terms
    if (result.tags) {
      for (const term of queryTerms) {
        for (const tag of result.tags) {
          if (tag.includes(term)) score += 3;
        }
      }
    }
    
    // Boost educational and diagram content
    const diagramKeywords = ['diagram', 'chart', 'flowchart', 'infographic', 'visualization', 'schema', 'architecture'];
    const educationalKeywords = ['educational', 'learning', 'academic', 'textbook', 'study', 'research', 'concept'];
    
    for (const keyword of diagramKeywords) {
      if (title.includes(keyword)) score += 8;
    }
    
    for (const keyword of educationalKeywords) {
      if (title.includes(keyword)) score += 4;
    }
    
    // Boost professional-looking diagrams from reputable sources
    if (result.imageSrc.includes('lucidchart') || 
        result.imageSrc.includes('draw.io') || 
        result.imageSrc.includes('diagrams.net') ||
        result.imageSrc.includes('geeksforgeeks') ||
        result.imageSrc.includes('javatpoint') ||
        result.imageSrc.includes('tutorialspoint')) {
      score += 10;
    }
    
    return score;
  };
  
  // Clone results to avoid mutating the original array
  const enhancedResults = [...results];
  
  // Filter out low-quality or irrelevant results
  const filteredResults = enhancedResults.filter(result => {
    // Filter out results that don't have proper titles or are clearly not diagrams
    if (!result.title || result.title.length < 5) return false;
    
    // Remove results that explicitly mention they are not diagrams
    if (result.title.toLowerCase().includes('not a diagram')) return false;
    
    return true;
  });
  
  // Sort results by relevance score
  filteredResults.sort((a, b) => scoreResult(b) - scoreResult(a));
  
  // Add relevant tags if missing
  return filteredResults.map(result => {
    if (!result.tags || result.tags.length === 0) {
      // Generate tags from the title
      const titleWords = result.title.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['and', 'the', 'for', 'with'].includes(word))
        .slice(0, 5);
        
      // Add common diagram types if detected in title
      const diagramTypes = ['flowchart', 'sequence', 'entity', 'class', 'use case', 'state', 'activity'];
      for (const type of diagramTypes) {
        if (result.title.toLowerCase().includes(type) && !titleWords.includes(type)) {
          titleWords.push(type);
        }
      }
      
      // Add query terms as tags if not already included
      for (const term of queryTerms) {
        if (!titleWords.includes(term)) {
          titleWords.push(term);
        }
      }
      
      return { ...result, tags: titleWords };
    }
    return result;
  });
}

// Function to get search suggestions
export function getSearchSuggestions(query: string): string[] {
  if (!query.trim() || query.length < 2) {
    return getExampleSearches();
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
    "database schema",
    "business process diagram",
    "organization chart",
    "venn diagram",
    "gantt chart",
    "timeline diagram"
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
    "education",
    "neuroscience",
    "biochemistry",
    "microbiology",
    "astronomy",
    "geology"
  ];
  
  // Popular CS and Programming topics
  const csProgrammingTopics = [
    "data structure",
    "algorithm",
    "linked list",
    "binary tree",
    "hash table",
    "sorting algorithm",
    "recursion",
    "binary search",
    "graph theory",
    "dynamic programming",
    "stack and queue",
    "database design",
    "software architecture",
    "design patterns",
    "agile methodology",
    "web architecture",
    "microservices",
    "cloud infrastructure",
    "CI/CD pipeline"
  ];
  
  // Suggestions based on all categories
  const allPossibleTerms = [...commonDiagramTypes, ...academicFields, ...csProgrammingTopics];
  
  // Find matching suggestions
  const matchingSuggestions = allPossibleTerms
    .filter(term => term.includes(lowercaseQuery))
    .map(term => {
      // Ensure 'diagram' is added for more relevant results if not already present
      if (!term.includes("diagram") && !commonDiagramTypes.includes(term)) {
        return `${term} diagram`;
      }
      return term;
    });
  
  // Sort by relevance (exact matches first, then starts with, then includes)
  return matchingSuggestions
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

// Example searches to show when no query is entered
function getExampleSearches(): string[] {
  return [
    "data structure diagram",
    "software architecture",
    "machine learning workflow",
    "database schema design",
    "network topology",
    "UML class diagram",
    "system design",
    "entity relationship model",
    "microservices architecture"
  ];
}
