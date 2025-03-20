
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

  // Try to fetch results with fallback mechanisms
  try {
    console.log(`[SearchService] Fetching results for "${query}" page ${page}`);
    
    // First attempt: Get search results with enhanced query
    let results = await searchGoogleImages(enhancedQuery, apiKey, searchId, page);
    
    // If no results, try with more specific diagram terms
    if (results.length === 0 && !enhancedQuery.includes('diagram')) {
      console.log('[SearchService] No results with enhanced query, trying with explicit diagram terms');
      const diagramQuery = `${query} diagram visualization high quality`;
      results = await searchGoogleImages(diagramQuery, apiKey, searchId, page);
    }
    
    // Still no results, try with broader terms
    if (results.length === 0) {
      console.log('[SearchService] Still no results, trying with broader terms');
      const broadQuery = `${query} visual explanation high quality diagram`;
      results = await searchGoogleImages(broadQuery, apiKey, searchId, page);
    }
    
    if (results.length === 0) {
      console.warn(`[SearchService] No results found for "${query}"`);
      toast.warning("No diagrams found. Try a different search term.");
      return [];
    }
    
    // Filter for diagram-type images only and enhance results
    const filteredResults = filterDiagramsOnly(results, query);
    const enhancedResults = enhanceSearchResults(filteredResults, query);
    
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
    return [];
  }
}

// Filter results to only include diagrams, charts, infographics
function filterDiagramsOnly(results: DiagramResult[], query: string): DiagramResult[] {
  // Keywords that indicate diagram-type content
  const diagramKeywords = [
    'diagram', 'flowchart', 'chart', 'infographic', 'schema', 'architecture',
    'uml', 'workflow', 'process', 'system', 'model', 'plan', 'structure',
    'hierarchy', 'network', 'topology', 'framework', 'mapping', 'flow',
    'sequence', 'class', 'entity', 'relationship', 'state', 'database'
  ];
  
  // Check if image appears to be a diagram based on its aspects
  const isDiagramImage = (result: DiagramResult) => {
    const title = result.title.toLowerCase();
    const sourceUrl = (result.sourceUrl || '').toLowerCase();
    
    // Check title for diagram keywords
    const hasDiagramKeyword = diagramKeywords.some(keyword => title.includes(keyword));
    
    // Check if source is a reputable diagram site
    const isQualitySource = sourceUrl ? isQualityDiagramSource(sourceUrl) : false;
    
    // Exclude non-diagram images
    const excludeTerms = ['photo', 'picture', 'image of', 'photograph', 'stock image'];
    const isExcludedType = excludeTerms.some(term => title.includes(term));
    
    return (hasDiagramKeyword || isQualitySource) && !isExcludedType;
  };
  
  // Apply filtering criteria
  return results.filter(isDiagramImage);
}

// Check if the source URL is from a reputable diagram/educational source
function isQualityDiagramSource(url: string): boolean {
  const qualitySources = [
    'lucidchart', 'draw.io', 'diagrams.net', 'creately', 'gliffy',
    'visual-paradigm', 'miro', 'figma', 'whimsical', 'cacoo',
    'edrawsoft', 'smartdraw', 'geeksforgeeks', 'javatpoint',
    'tutorialspoint', 'educative', 'programiz', 'sourcetree',
    'w3schools', 'wikipedia', 'stackoverflow', 'github',
    'medium', 'towardsdatascience', 'researchgate', 'ieee',
    'uml-diagrams.org', 'udemy', 'coursera', 'edx',
    'khanacademy', 'cs.stanford.edu', 'mit.edu', 'harvard.edu',
    'baeldung', 'dev.to', 'freecodecamp', 'digitalocean',
    'microsoft', 'google', 'aws', 'azure', 'ibm',
    'cisco', 'oracle', 'mongodb', 'mysql', 'postgresql'
  ];
  
  return qualitySources.some(source => url.toLowerCase().includes(source));
}

// Function to enhance the search query to find better diagrams
function enhanceSearchQuery(query: string): string {
  // Add terms to enhance diagram search
  const diagramTerms = ['diagram', 'chart', 'flowchart', 'visualization', 'graph', 'schema'];
  
  // Already has diagram term?
  const hasAnyDiagramTerm = diagramTerms.some(term => query.toLowerCase().includes(term));
  
  // If query doesn't already specify diagram, add it
  if (!hasAnyDiagramTerm) {
    return `${query} diagram high quality`;
  }
  
  return `${query} high quality`;
}

// Function to enhance search results with better relevance sorting and tags
function enhanceSearchResults(results: DiagramResult[], query: string): DiagramResult[] {
  // Extract terms from the query for relevance scoring
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  // Score function for relevance
  const scoreResult = (result: DiagramResult): number => {
    let score = 0;
    const title = result.title?.toLowerCase() || '';
    
    // Title contains exact query (highest relevance)
    if (title.includes(query.toLowerCase())) score += 25;
    
    // Title contains multiple query terms (high relevance)
    for (const term of queryTerms) {
      if (title.includes(term)) {
        score += 5;
      }
    }
    
    // Boost diagram keywords
    const diagramKeywords = [
      'diagram', 'chart', 'flowchart', 'infographic', 'visualization', 
      'schema', 'architecture', 'model', 'blueprint'
    ];
    
    for (const keyword of diagramKeywords) {
      if (title.includes(keyword)) score += 12;
    }
    
    // Boost professional-looking diagrams from reputable sources
    if (result.sourceUrl && isQualityDiagramSource(result.sourceUrl)) {
      score += 20;
    }
    
    return score;
  };
  
  // Clone results to avoid mutating the original array
  const enhancedResults = [...results];
  
  // Filter out low-quality or irrelevant results
  const filteredResults = enhancedResults.filter(result => {
    // Filter out results that don't have proper titles
    if (!result.title || result.title.length < 5) return false;
    
    // Remove results that explicitly mention they are not diagrams
    if (result.title.toLowerCase().includes('not a diagram')) return false;
    
    // Exclude photos and stock imagery
    const isPhoto = ['photo', 'photograph', 'picture of', 'image of', 'stock photo']
      .some(term => result.title.toLowerCase().includes(term));
    
    if (isPhoto) return false;
    
    return true;
  });
  
  // Sort results by relevance score
  filteredResults.sort((a, b) => scoreResult(b) - scoreResult(a));
  
  // Generate or enhance tags if missing
  return filteredResults.map(result => {
    // Generate tags from the title if missing
    let enhancedTags = result.tags || [];
    if (!enhancedTags.length) {
      enhancedTags = result.title.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['and', 'the', 'for', 'with', 'this', 'that'].includes(word))
        .slice(0, 5);
        
      // Add query terms as tags if not already included
      for (const term of queryTerms) {
        if (term.length > 3 && !enhancedTags.includes(term)) {
          enhancedTags.push(term);
        }
      }
    }
    
    return { 
      ...result, 
      tags: enhancedTags
    };
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
    "flowchart diagram",
    "sequence diagram",
    "entity relationship diagram",
    "class diagram",
    "use case diagram",
    "network diagram",
    "system architecture diagram",
    "database schema diagram"
  ];
  
  // Find matching suggestions
  const matchingSuggestions = commonDiagramTypes
    .filter(term => term.includes(lowercaseQuery));
  
  // Sort by relevance (exact matches first, then starts with, then includes)
  return matchingSuggestions
    .sort((a, b) => {
      // Exact match
      if (a.toLowerCase() === lowercaseQuery) return -1;
      if (b.toLowerCase() === lowercaseQuery) return 1;
      
      // Starts with
      if (a.toLowerCase().startsWith(lowercaseQuery) && !b.toLowerCase().startsWith(lowercaseQuery)) return -1;
      if (!a.toLowerCase().startsWith(lowercaseQuery) && b.toLowerCase().startsWith(lowercaseQuery)) return 1;
      
      return a.localeCompare(b);
    })
    .slice(0, 8); // Show more suggestions
}

// Example searches to show when no query is entered
function getExampleSearches(): string[] {
  return [
    "data structure diagram",
    "software architecture diagram",
    "database schema design",
    "network topology diagram",
    "UML class diagram",
    "system design diagram",
    "entity relationship model"
  ];
}
