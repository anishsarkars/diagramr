
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
  apiKey: string = "AIzaSyA1zArEu4m9HzEh-CO2Y7oFw0z_E_cFPsg",
  searchId: string = "260090575ae504419"
): Promise<DiagramResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  console.log(`[SearchService] Searching for "${query}" (page ${page})`);
  
  // Always perform fresh search for accurate results - no caching
  console.log(`[SearchService] Fetching fresh results for "${query}" page ${page}`);
  
  try {
    // Improved query enhancement for better results
    let enhancedQuery = '';
    
    // First check if this is an architecture or system query
    if (query.toLowerCase().includes('architecture') || 
        query.toLowerCase().includes('system') ||
        query.toLowerCase().includes('design') ||
        query.toLowerCase().includes('structure')) {
      enhancedQuery = `${query} technical diagram professional illustration`;
    }
    // Special handling for data structure queries
    else if (query.toLowerCase().includes('data structure') || 
        query.toLowerCase().includes('algorithm') || 
        query.toLowerCase().includes('dsa')) {
      enhancedQuery = `${query} educational visualization diagram computer science tutorial`;
    } 
    // Flow diagrams
    else if (query.toLowerCase().includes('flow') ||
        query.toLowerCase().includes('process') ||
        query.toLowerCase().includes('workflow')) {
      enhancedQuery = `${query} flowchart process diagram professional`;
    }
    // UML and technical diagrams
    else if (query.toLowerCase().includes('uml') ||
        query.toLowerCase().includes('class diagram') ||
        query.toLowerCase().includes('sequence diagram')) {
      enhancedQuery = `${query} software engineering diagram professional`;
    }
    // Network diagrams
    else if (query.toLowerCase().includes('network') ||
        query.toLowerCase().includes('topology')) {
      enhancedQuery = `${query} network topology diagram professional`;
    }
    // Database diagrams
    else if (query.toLowerCase().includes('database') ||
        query.toLowerCase().includes('schema') ||
        query.toLowerCase().includes('er diagram') ||
        query.toLowerCase().includes('entity')) {
      enhancedQuery = `${query} database schema diagram erd professional`;
    }
    // General educational diagram enhancement
    else {
      enhancedQuery = `${query} professional diagram visualization high quality`;
    }
    
    console.log(`[SearchService] Enhanced query: "${enhancedQuery}"`);
    
    // Get search results with enhanced query
    let results = await searchGoogleImages(enhancedQuery, apiKey, searchId, page);
    
    // If no results, try with more specific diagram terms
    if (results.length === 0) {
      console.log('[SearchService] No results with enhanced query, trying with explicit diagram terms');
      const diagramQuery = `${query} diagram professional visualization high quality infographic`;
      results = await searchGoogleImages(diagramQuery, apiKey, searchId, page);
    }
    
    // Still no results, try with broader terms
    if (results.length === 0) {
      console.log('[SearchService] Still no results, trying with broader terms');
      const broadQuery = `${query} diagram chart visualization`;
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
    
    console.log(`[SearchService] Found ${enhancedResults.length} results for "${query}"`);
    return enhancedResults;
    
  } catch (error) {
    console.error(`[SearchService] Error searching for "${query}":`, error);
    toast.error("Search failed. Please try again.");
    return [];
  }
}

// Filter results to only include professional diagrams, charts, infographics
function filterDiagramsOnly(results: DiagramResult[], query: string): DiagramResult[] {
  // Keywords that indicate diagram-type content
  const diagramKeywords = [
    'diagram', 'flowchart', 'chart', 'infographic', 'schema', 'architecture',
    'uml', 'workflow', 'process', 'system', 'model', 'plan', 'structure',
    'hierarchy', 'network', 'topology', 'framework', 'mapping', 'flow',
    'sequence', 'class', 'entity', 'relationship', 'state', 'database',
    'visualization', 'concept', 'visual', 'technical', 'professional',
    'data structure', 'algorithm', 'tree', 'graph', 'array', 'linked list',
    'stack', 'queue', 'hash table'
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

// Check if the source URL is from a reputable diagram source
function isQualityDiagramSource(url: string): boolean {
  const qualitySources = [
    // Professional diagram tools
    'lucidchart', 'draw.io', 'diagrams.net', 'creately', 'gliffy',
    'visual-paradigm', 'miro', 'figma', 'whimsical', 'cacoo',
    'edrawsoft', 'smartdraw', 'lucid.app', 'plantuml', 'dbdiagram.io',
    
    // Technical sites
    'geeksforgeeks', 'javatpoint', 'tutorialspoint', 'educative', 
    'programiz', 'w3schools', 'stackoverflow', 'github', 'leetcode',
    'medium', 'towardsdatascience', 'researchgate', 'ieee',
    'uml-diagrams.org', 'prepbytes.com', 'scaler.com',
    
    // Technical documentation sites
    'docs.microsoft', 'aws.amazon', 'cloud.google', 'azure', 'ibm',
    'cisco', 'oracle', 'mongodb', 'mysql', 'postgresql',
    
    // Educational platforms
    'khanacademy', 'coursera', 'edx', 'udemy', 'brilliant.org', 'study.com',
    'mcgraw-hill', 'pearson', 'wiley', 'cengage', 'slideshare',
    
    // Universities
    'edu', 'ac.uk', 'ac.jp', '.edu.', 'cs.stanford.edu', 'mit.edu', 
    'harvard.edu', 'berkeley.edu', 'ox.ac.uk', 'cam.ac.uk',
  ];
  
  return qualitySources.some(source => url.toLowerCase().includes(source));
}

// Function to enhance search results with better relevance sorting and tags
function enhanceSearchResults(results: DiagramResult[], query: string): DiagramResult[] {
  // Extract terms from the query for relevance scoring
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  // Score function for diagram relevance
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
    
    // Boost diagram keywords based on query type
    if (query.toLowerCase().includes('architecture') || query.toLowerCase().includes('system')) {
      const archKeywords = ['architecture', 'system', 'design', 'structure', 'diagram', 'enterprise'];
      for (const keyword of archKeywords) {
        if (title.includes(keyword)) score += 30;
      }
    }
    
    // Boost UML diagram keywords
    if (query.toLowerCase().includes('uml') || 
        query.toLowerCase().includes('class') || 
        query.toLowerCase().includes('sequence')) {
      const umlKeywords = ['uml', 'class diagram', 'sequence diagram', 'object diagram'];
      for (const keyword of umlKeywords) {
        if (title.includes(keyword)) score += 30;
      }
    }
    
    // Boost network diagram keywords
    if (query.toLowerCase().includes('network') || query.toLowerCase().includes('topology')) {
      const networkKeywords = ['network', 'topology', 'infrastructure'];
      for (const keyword of networkKeywords) {
        if (title.includes(keyword)) score += 30;
      }
    }
    
    // Boost database diagram keywords
    if (query.toLowerCase().includes('database') || 
        query.toLowerCase().includes('er') || 
        query.toLowerCase().includes('entity')) {
      const dbKeywords = ['database', 'schema', 'er diagram', 'entity relationship'];
      for (const keyword of dbKeywords) {
        if (title.includes(keyword)) score += 30;
      }
    }
    
    // Boost data structure keywords
    if (query.toLowerCase().includes('data structure') || 
        query.toLowerCase().includes('algorithm')) {
      const dsKeywords = ['data structure', 'algorithm', 'tree', 'graph', 'array', 'linked list'];
      for (const keyword of dsKeywords) {
        if (title.includes(keyword)) score += 30;
      }
    }
    
    // Boost diagram quality keywords
    const qualityKeywords = [
      'professional', 'high-quality', 'detailed', 'technical', 'official'
    ];
    
    for (const keyword of qualityKeywords) {
      if (title.includes(keyword)) score += 10;
    }
    
    // Boost diagrams from reputable sources
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
      
      // Add professional tags
      const proTags = ['professional', 'technical', 'diagram'];
      for (const tag of proTags) {
        if (!enhancedTags.includes(tag)) {
          enhancedTags.push(tag);
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
  
  // Common professional diagram types
  const professionalDiagramTypes = [
    "system architecture diagram",
    "network topology diagram",
    "uml class diagram",
    "entity relationship diagram",
    "data flow diagram",
    "sequence diagram",
    "process flow diagram",
    "component diagram",
    "infrastructure diagram",
    "use case diagram",
    "database schema",
    "state machine diagram",
    "activity diagram",
    "deployment diagram",
    "business process model",
    "organizational chart",
    "cloud architecture diagram",
    "api architecture diagram",
    "microservices architecture",
    "circuit diagram",
    "wireframe diagram",
    "flowchart diagram",
    "server architecture",
    "security architecture"
  ];
  
  // Find matching suggestions
  const matchingSuggestions = professionalDiagramTypes
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

// Example searches to show when no query is entered - professional focused
function getExampleSearches(): string[] {
  return [
    "system architecture diagram",
    "network topology diagram",
    "uml class diagram",
    "entity relationship diagram",
    "data flow diagram",
    "sequence diagram",
    "process flow diagram",
    "business process model",
    "cloud architecture diagram",
    "api architecture diagram",
    "microservices architecture"
  ];
}
