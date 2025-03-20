
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
    // Create a more specific query for educational diagrams
    let enhancedQuery = '';
    
    // Special handling for data structure queries
    if (query.toLowerCase().includes('data structure') || 
        query.toLowerCase().includes('algorithm') || 
        query.toLowerCase().includes('dsa')) {
      enhancedQuery = `${query} educational visualization diagram computer science tutorial`;
    } else {
      // General educational diagram enhancement
      enhancedQuery = `${query} educational diagram visualization for students learning high quality`;
    }
    
    console.log(`[SearchService] Enhanced query: "${enhancedQuery}"`);
    
    // Get search results with enhanced educational query
    let results = await searchGoogleImages(enhancedQuery, apiKey, searchId, page);
    
    // If no results, try with more specific educational diagram terms
    if (results.length === 0) {
      console.log('[SearchService] No results with enhanced query, trying with explicit educational diagram terms');
      const diagramQuery = `${query} diagram educational visualization for students high quality infographic`;
      results = await searchGoogleImages(diagramQuery, apiKey, searchId, page);
    }
    
    // Still no results, try with broader educational terms
    if (results.length === 0) {
      console.log('[SearchService] Still no results, trying with broader educational terms');
      const broadQuery = `${query} educational diagram explanation study material`;
      results = await searchGoogleImages(broadQuery, apiKey, searchId, page);
    }
    
    if (results.length === 0) {
      console.warn(`[SearchService] No results found for "${query}"`);
      toast.warning("No diagrams found. Try a different search term.");
      return [];
    }
    
    // Filter for educational diagram-type images only and enhance results
    const filteredResults = filterEducationalDiagramsOnly(results, query);
    const enhancedResults = enhanceSearchResults(filteredResults, query);
    
    console.log(`[SearchService] Found ${enhancedResults.length} results for "${query}"`);
    return enhancedResults;
    
  } catch (error) {
    console.error(`[SearchService] Error searching for "${query}":`, error);
    toast.error("Search failed. Please try again.");
    return [];
  }
}

// Filter results to only include educational diagrams, charts, infographics
function filterEducationalDiagramsOnly(results: DiagramResult[], query: string): DiagramResult[] {
  // Keywords that indicate educational diagram-type content
  const diagramKeywords = [
    'diagram', 'flowchart', 'chart', 'infographic', 'schema', 'architecture',
    'uml', 'workflow', 'process', 'system', 'model', 'plan', 'structure',
    'hierarchy', 'network', 'topology', 'framework', 'mapping', 'flow',
    'sequence', 'class', 'entity', 'relationship', 'state', 'database',
    'educational', 'learning', 'explanation', 'concept', 'study', 'visual',
    'educational diagram', 'teaching', 'academic', 'classroom', 'lecture',
    'data structure', 'algorithm', 'tree', 'graph', 'array', 'linked list',
    'stack', 'queue', 'hash table'
  ];
  
  // Check if image appears to be an educational diagram based on its aspects
  const isEducationalDiagramImage = (result: DiagramResult) => {
    const title = result.title.toLowerCase();
    const sourceUrl = (result.sourceUrl || '').toLowerCase();
    
    // Check title for diagram keywords
    const hasDiagramKeyword = diagramKeywords.some(keyword => title.includes(keyword));
    
    // Check if source is a reputable educational diagram site
    const isQualitySource = sourceUrl ? isQualityEducationalDiagramSource(sourceUrl) : false;
    
    // Exclude non-diagram images
    const excludeTerms = ['photo', 'picture', 'image of', 'photograph', 'stock image'];
    const isExcludedType = excludeTerms.some(term => title.includes(term));
    
    return (hasDiagramKeyword || isQualitySource) && !isExcludedType;
  };
  
  // Apply filtering criteria
  return results.filter(isEducationalDiagramImage);
}

// Check if the source URL is from a reputable educational diagram source
function isQualityEducationalDiagramSource(url: string): boolean {
  const qualityEducationalSources = [
    // Educational platforms
    'khanacademy', 'coursera', 'edx', 'udemy', 'brilliant.org', 'study.com',
    'educational-resources', 'teacherspayteachers', 'quizlet', 'brainly',
    'chegg', 'mcgraw-hill', 'pearson', 'wiley', 'cengage', 'slideshare',
    
    // Diagram tools & resources
    'lucidchart', 'draw.io', 'diagrams.net', 'creately', 'gliffy',
    'visual-paradigm', 'miro', 'figma', 'whimsical', 'cacoo',
    'edrawsoft', 'smartdraw',
    
    // Tech education
    'geeksforgeeks', 'javatpoint', 'tutorialspoint', 'educative', 
    'programiz', 'w3schools', 'stackoverflow', 'github', 'leetcode',
    'medium', 'towardsdatascience', 'researchgate', 'ieee',
    'uml-diagrams.org', 'prepbytes.com', 'scaler.com',
    
    // Universities
    'edu', 'ac.uk', 'ac.jp', '.edu.', 'cs.stanford.edu', 'mit.edu', 
    'harvard.edu', 'berkeley.edu', 'ox.ac.uk', 'cam.ac.uk',
    
    // Technical blogs
    'baeldung', 'dev.to', 'freecodecamp', 'digitalocean',
    
    // Tech companies with educational content
    'microsoft', 'google', 'aws', 'azure', 'ibm',
    'cisco', 'oracle', 'mongodb', 'mysql', 'postgresql'
  ];
  
  return qualityEducationalSources.some(source => url.toLowerCase().includes(source));
}

// Function to enhance search results with better relevance sorting and tags
function enhanceSearchResults(results: DiagramResult[], query: string): DiagramResult[] {
  // Extract terms from the query for relevance scoring
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  // Special handling for data structure queries
  const isDataStructureQuery = query.toLowerCase().includes('data structure') || 
                             query.toLowerCase().includes('algorithm') ||
                             query.toLowerCase().includes('dsa');
  
  // Score function for educational relevance
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
    
    // Boost educational diagram keywords
    const educationalKeywords = [
      'educational', 'learning', 'concept', 'classroom', 'lecture', 'study',
      'academic', 'visual learning', 'textbook', 'curriculum', 'course', 
      'educational diagram', 'teaching', 'explanation'
    ];
    
    const diagramKeywords = [
      'diagram', 'chart', 'flowchart', 'infographic', 'visualization', 
      'schema', 'architecture', 'model', 'blueprint'
    ];
    
    for (const keyword of educationalKeywords) {
      if (title.includes(keyword)) score += 15;
    }
    
    for (const keyword of diagramKeywords) {
      if (title.includes(keyword)) score += 12;
    }
    
    // If this is a data structure query, boost data structure content
    if (isDataStructureQuery) {
      const dsKeywords = ['data structure', 'algorithm', 'tree', 'graph', 'array', 
                        'linked list', 'stack', 'queue', 'hash table'];
      for (const keyword of dsKeywords) {
        if (title.includes(keyword)) score += 40;  // High priority for data structure content
      }
    }
    
    // Boost professional-looking diagrams from reputable educational sources
    if (result.sourceUrl && isQualityEducationalDiagramSource(result.sourceUrl)) {
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
  
  // Sort results by educational relevance score
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
      
      // Add educational tags
      const eduTags = ['educational', 'learning', 'study'];
      for (const tag of eduTags) {
        if (!enhancedTags.includes(tag)) {
          enhancedTags.push(tag);
        }
      }
      
      // For data structure queries, add related tags
      if (isDataStructureQuery) {
        const dsTags = ['data structure', 'computer science', 'algorithm'];
        for (const tag of dsTags) {
          if (!enhancedTags.includes(tag)) {
            enhancedTags.push(tag);
          }
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
  
  // Common educational diagram types for students and researchers
  const educationalDiagramTypes = [
    "data structure visualization",
    "algorithm flowchart",
    "binary tree diagram",
    "graph data structure visualization",
    "linked list implementation",
    "stack and queue visualization",
    "hash table diagram",
    "sorting algorithm visualization",
    "biology cell diagram",
    "chemistry periodic table",
    "physics force diagram",
    "mathematics graph visualization",
    "molecular structure diagram",
    "neural network diagram",
    "UML class diagram",
    "entity relationship diagram",
    "sequence diagram",
    "flowchart diagram",
    "system architecture",
    "circuit diagram",
    "human anatomy diagram",
    "geographical map visualization",
    "data flow diagram"
  ];
  
  // Find matching suggestions
  const matchingSuggestions = educationalDiagramTypes
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

// Example searches to show when no query is entered - education focused
function getExampleSearches(): string[] {
  return [
    "data structure visualization",
    "algorithm flowchart",
    "binary search tree diagram",
    "cell structure diagram",
    "quantum mechanics visualization",
    "DNA double helix structure",
    "human nervous system diagram",
    "solar system model",
    "machine learning algorithm diagram",
    "database schema for educational system",
    "chemical reaction pathway"
  ];
}
