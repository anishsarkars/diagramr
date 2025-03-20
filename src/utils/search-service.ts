
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
    
    // Filter for diagram-type images only and sort results by relevance
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
    
    // Return empty results on error
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
  
  // Keywords for specific diagram types based on common searches
  const dataStructureKeywords = [
    'tree', 'graph', 'heap', 'stack', 'queue', 'linked list', 'array', 
    'hash table', 'binary', 'search', 'sorting', 'algorithm'
  ];
  
  const networkKeywords = [
    'network', 'topology', 'infrastructure', 'architecture', 'lan', 'wan',
    'cloud', 'server', 'router', 'switch', 'firewall', 'internet'
  ];
  
  const softwareKeywords = [
    'uml', 'class', 'sequence', 'activity', 'use case', 'component', 
    'deployment', 'object', 'software', 'development', 'architecture',
    'microservice', 'api', 'interface', 'code', 'module'
  ];
  
  // Combine relevant keywords based on query
  let relevantKeywords = [...diagramKeywords];
  
  if (query.toLowerCase().includes('data structure')) {
    relevantKeywords = [...relevantKeywords, ...dataStructureKeywords];
  }
  
  if (query.toLowerCase().includes('network')) {
    relevantKeywords = [...relevantKeywords, ...networkKeywords];
  }
  
  if (query.toLowerCase().includes('software') || 
      query.toLowerCase().includes('uml') || 
      query.toLowerCase().includes('class')) {
    relevantKeywords = [...relevantKeywords, ...softwareKeywords];
  }
  
  // Filter out images that don't have any diagram-related keywords in title or tags
  return results.filter(result => {
    const title = result.title.toLowerCase();
    const hasDiagramKeyword = relevantKeywords.some(keyword => title.includes(keyword));
    
    const hasDiagramInTags = result.tags ? 
      result.tags.some(tag => relevantKeywords.some(keyword => tag.toLowerCase().includes(keyword))) : 
      false;
    
    // Check image source for quality sources
    const isQualitySource = result.sourceUrl ? 
      isQualityDiagramSource(result.sourceUrl) : 
      false;
    
    // Higher threshold for data structure searches to ensure relevance
    if (query.toLowerCase().includes('data structure')) {
      return (hasDiagramKeyword || hasDiagramInTags) && 
        (dataStructureKeywords.some(kw => title.includes(kw)) || isQualitySource);
    }
    
    // Higher threshold for network searches
    if (query.toLowerCase().includes('network')) {
      return (hasDiagramKeyword || hasDiagramInTags) && 
        (networkKeywords.some(kw => title.includes(kw)) || isQualitySource);
    }
    
    // Higher threshold for software/UML searches
    if (query.toLowerCase().includes('software') || 
        query.toLowerCase().includes('uml') || 
        query.toLowerCase().includes('class')) {
      return (hasDiagramKeyword || hasDiagramInTags) && 
        (softwareKeywords.some(kw => title.includes(kw)) || isQualitySource);
    }
    
    // General diagram filtering
    return hasDiagramKeyword || hasDiagramInTags || isQualitySource;
  });
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
    'khanacademy', 'cs.stanford.edu', 'mit.edu', 'harvard.edu'
  ];
  
  return qualitySources.some(source => url.toLowerCase().includes(source));
}

// Function to enhance the search query to find better diagrams
function enhanceSearchQuery(query: string): string {
  // Remove any existing diagram terms to avoid duplication
  const diagramTerms = ['diagram', 'chart', 'flowchart', 'visualization', 'graph', 'schema'];
  let cleanQuery = query;
  
  // Already has diagram term?
  const hasAnyDiagramTerm = diagramTerms.some(term => query.toLowerCase().includes(term));
  
  // Specialized enhancements for specific technical searches
  if (query.toLowerCase().includes('data structure')) {
    return hasAnyDiagramTerm ? 
      `${query} educational visualization high quality` : 
      `${query} diagram visualization educational high quality`;
  }
  
  if (query.toLowerCase().includes('algorithm')) {
    return hasAnyDiagramTerm ? 
      `${query} computer science educational high quality` : 
      `${query} flowchart diagram educational high quality`;
  }
  
  if (query.toLowerCase().includes('network')) {
    return hasAnyDiagramTerm ? 
      `${query} topology technical high quality` : 
      `${query} topology diagram technical high quality`;
  }
  
  if (query.toLowerCase().includes('uml') || query.toLowerCase().includes('class diagram')) {
    return `${query} software engineering technical high quality`;
  }
  
  if (query.toLowerCase().includes('architecture') || query.toLowerCase().includes('system')) {
    return hasAnyDiagramTerm ? 
      `${query} technical design high quality` : 
      `${query} diagram technical design high quality`;
  }
  
  if (query.toLowerCase().includes('flowchart') || query.toLowerCase().includes('flow chart')) {
    return `${query} process workflow technical high quality`;
  }
  
  if (query.toLowerCase().includes('er') || query.toLowerCase().includes('entity relationship')) {
    return hasAnyDiagramTerm ? 
      `${query} database schema high quality` : 
      `${query} diagram database schema high quality`;
  }
  
  // For very specific technical topics, add diagram explicitly
  const technicalTopics = [
    'data structure', 'algorithm', 'network', 'architecture', 
    'process', 'workflow', 'microservice', 'infrastructure'
  ];
  
  const isTechnicalTopic = technicalTopics.some(topic => query.toLowerCase().includes(topic));
  
  // If query doesn't already specify diagram and is a technical topic, add "diagram" explicitly
  if (!hasAnyDiagramTerm && isTechnicalTopic) {
    return `${query} diagram visualization high quality technical educational`;
  }
  
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
    if (title.includes(query.toLowerCase())) score += 20;
    
    // Title contains multiple query terms (high relevance)
    let termMatches = 0;
    for (const term of queryTerms) {
      if (title.includes(term)) {
        score += 5;
        termMatches++;
      }
    }
    
    // Bonus for matching multiple terms
    if (termMatches > 1) score += termMatches * 3;
    
    // Title starts with query terms (high relevance)
    for (const term of queryTerms) {
      if (title.startsWith(term)) score += 8;
    }
    
    // Tags contain query terms
    if (result.tags && result.tags.length > 0) {
      for (const term of queryTerms) {
        for (const tag of result.tags) {
          if (tag.toLowerCase().includes(term)) score += 4;
        }
      }
    }
    
    // Boost for exact term match in URL (likely more relevant source)
    if (result.sourceUrl && result.sourceUrl.toLowerCase().includes(query.toLowerCase())) {
      score += 10;
    }
    
    // Special scoring for data structure searches
    if (query.toLowerCase().includes('data structure')) {
      const dataStructureTerms = [
        'tree', 'graph', 'hash', 'linked list', 'stack', 
        'queue', 'array', 'heap', 'sorting', 'algorithm'
      ];
      
      for (const term of dataStructureTerms) {
        if (title.includes(term)) score += 15;
      }
    }
    
    // Specialized scoring for network diagrams
    if (query.toLowerCase().includes('network')) {
      const networkTerms = [
        'topology', 'infrastructure', 'lan', 'wan', 'internet',
        'router', 'switch', 'firewall', 'server', 'cloud'
      ];
      
      for (const term of networkTerms) {
        if (title.includes(term)) score += 15;
      }
    }
    
    // Specialized scoring for UML and software diagrams
    if (query.toLowerCase().includes('uml') || 
        query.toLowerCase().includes('class diagram')) {
      const umlTerms = [
        'class', 'sequence', 'activity', 'use case', 'component',
        'deployment', 'state', 'object', 'interface'
      ];
      
      for (const term of umlTerms) {
        if (title.includes(term)) score += 15;
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
    
    // Boost educational content
    const educationalKeywords = [
      'educational', 'learning', 'academic', 'textbook', 'study', 
      'research', 'concept', 'university', 'college', 'course'
    ];
    
    for (const keyword of educationalKeywords) {
      if (title.includes(keyword)) score += 6;
    }
    
    // Boost professional-looking diagrams from reputable sources
    if (result.sourceUrl && isQualityDiagramSource(result.sourceUrl)) {
      score += 15;
    }
    
    // Boost high quality images
    if (result.imageSrc && (
      result.imageSrc.includes('high-quality') ||
      result.imageSrc.includes('hq') ||
      result.imageSrc.includes('large') ||
      result.imageSrc.includes('detailed')
    )) {
      score += 5;
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
    
    // More sophisticated filtering for specific query types
    if (query.toLowerCase().includes('data structure')) {
      const hasDataStructureContent = ['data structure', 'algorithm', 'tree', 'graph', 
        'hash', 'linked list', 'stack', 'queue', 'array']
        .some(term => result.title.toLowerCase().includes(term));
      
      const hasDiagramIndicator = ['diagram', 'visualization', 'chart', 'structure']
        .some(term => result.title.toLowerCase().includes(term));
        
      return hasDataStructureContent && hasDiagramIndicator;
    }
    
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
      const diagramTypes = [
        'flowchart', 'sequence', 'entity', 'class', 'use case', 
        'state', 'activity', 'network', 'architecture'
      ];
      
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
    "flowchart diagram",
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
    "process flow diagram",
    "data flow diagram",
    "network diagram",
    "system architecture diagram",
    "database schema diagram",
    "business process diagram",
    "organization chart",
    "venn diagram",
    "gantt chart",
    "timeline diagram"
  ];
  
  // Popular CS and Programming topics
  const csProgrammingTopics = [
    "data structure diagram",
    "algorithm flowchart",
    "linked list visualization",
    "binary tree diagram",
    "hash table structure",
    "sorting algorithm visualization",
    "recursion diagram",
    "binary search tree",
    "graph theory diagram",
    "dynamic programming",
    "stack and queue visualization",
    "database design diagram",
    "software architecture diagram",
    "design patterns diagram",
    "agile methodology diagram",
    "web architecture diagram",
    "microservices architecture",
    "cloud infrastructure diagram",
    "CI/CD pipeline diagram"
  ];
  
  // Suggestions based on all categories
  const allPossibleTerms = [...commonDiagramTypes, ...csProgrammingTopics];
  
  // Find matching suggestions
  const matchingSuggestions = allPossibleTerms
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
      
      // Alphabetical
      return a.localeCompare(b);
    })
    .slice(0, 6);
}

// Example searches to show when no query is entered
function getExampleSearches(): string[] {
  return [
    "data structure diagram",
    "software architecture diagram",
    "machine learning workflow",
    "database schema design",
    "network topology diagram",
    "UML class diagram",
    "system design diagram",
    "entity relationship model",
    "microservices architecture",
    "binary tree visualization",
    "sorting algorithms comparison",
    "distributed systems architecture"
  ];
}
