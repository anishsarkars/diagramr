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
      const diagramQuery = `${query} diagram visualization`;
      results = await searchGoogleImages(diagramQuery, apiKey, searchId, page);
    }
    
    // Still no results, try with broader terms
    if (results.length === 0) {
      console.log('[SearchService] Still no results, trying with broader terms');
      const broadQuery = `${query} visual explanation high quality`;
      results = await searchGoogleImages(broadQuery, apiKey, searchId, page);
    }
    
    if (results.length === 0) {
      console.warn(`[SearchService] No results found for "${query}"`);
      toast.warning("No diagrams found. Try a different search term.");
      return [];
    }
    
    // Filter for diagram-type images only and sort results by relevance
    const filteredResults = filterDiagramsOnly(results, query);
    
    // If too few results after filtering, try to fetch more general results
    if (filteredResults.length < 3 && page === 1) {
      console.log('[SearchService] Too few results after filtering, getting more general results');
      const generalResults = await searchGoogleImages(`${query} visual high quality`, apiKey, searchId, page);
      // Add any new results that weren't in the original set
      const originalUrls = new Set(filteredResults.map(r => r.imageSrc));
      const additionalResults = generalResults.filter(r => !originalUrls.has(r.imageSrc));
      
      // Combine and filter again, but with lower threshold
      const combinedResults = [...filteredResults, ...additionalResults];
      const enhancedResults = enhanceSearchResults(combinedResults, query, true);
      
      // Cache the results
      searchCache.set(cacheKey, {
        timestamp: Date.now(),
        results: enhancedResults
      });
      
      console.log(`[SearchService] Found ${enhancedResults.length} results for "${query}" after merging`);
      return enhancedResults;
    }
    
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
    
    // Try to load from a broader cache if available
    try {
      // Look for any cached results that might be relevant
      const similarQueries = Array.from(searchCache.keys())
        .filter(key => key.includes(query.toLowerCase()) || query.toLowerCase().includes(key.split(':')[1]));
      
      if (similarQueries.length > 0) {
        console.log('[SearchService] Using cached similar results as fallback');
        const fallbackResults = searchCache.get(similarQueries[0])!.results;
        return fallbackResults.slice(0, 12); // Limit to avoid confusion
      }
    } catch (fallbackError) {
      console.error('[SearchService] Error in fallback mechanism:', fallbackError);
    }
    
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
    'hash table', 'binary', 'search', 'sorting', 'algorithm', 'visualization'
  ];
  
  const networkKeywords = [
    'network', 'topology', 'infrastructure', 'architecture', 'lan', 'wan',
    'cloud', 'server', 'router', 'switch', 'firewall', 'internet', 'protocol'
  ];
  
  const softwareKeywords = [
    'uml', 'class', 'sequence', 'activity', 'use case', 'component', 
    'deployment', 'object', 'software', 'development', 'architecture',
    'microservice', 'api', 'interface', 'code', 'module', 'pattern'
  ];
  
  const databaseKeywords = [
    'database', 'schema', 'er', 'entity', 'relationship', 'table', 'sql',
    'model', 'relational', 'nosql', 'data warehouse', 'data model'
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
      query.toLowerCase().includes('class') ||
      query.toLowerCase().includes('design pattern')) {
    relevantKeywords = [...relevantKeywords, ...softwareKeywords];
  }
  
  if (query.toLowerCase().includes('database') ||
      query.toLowerCase().includes('schema') ||
      query.toLowerCase().includes('er diagram')) {
    relevantKeywords = [...relevantKeywords, ...databaseKeywords];
  }
  
  // Check if image appears to be a diagram based on its aspects
  const isDiagramImage = (result: DiagramResult) => {
    const title = result.title.toLowerCase();
    const sourceUrl = (result.sourceUrl || '').toLowerCase();
    
    // Check title for diagram keywords
    const hasDiagramKeyword = relevantKeywords.some(keyword => title.includes(keyword));
    
    // Check title for educational terms that often indicate diagrams
    const hasEducationalTerms = ['tutorial', 'learn', 'guide', 'course', 'education', 'concept']
      .some(term => title.includes(term));
    
    // Check tags for diagram keywords
    const hasDiagramInTags = result.tags ? 
      result.tags.some(tag => relevantKeywords.some(keyword => tag.toLowerCase().includes(keyword))) : 
      false;
    
    // Check if source is a reputable diagram site
    const isQualitySource = sourceUrl ? isQualityDiagramSource(sourceUrl) : false;
    
    // Exclude non-diagram images
    const excludeTerms = ['photo', 'picture', 'image of', 'photograph', 'stock image'];
    const isExcludedType = excludeTerms.some(term => title.includes(term));
    
    return (hasDiagramKeyword || hasDiagramInTags || hasEducationalTerms || isQualitySource) && !isExcludedType;
  };
  
  // Apply domain-specific filtering criteria
  const applyDomainSpecificCriteria = (result: DiagramResult) => {
    const title = result.title.toLowerCase();
    
    // Higher threshold for data structure searches
    if (query.toLowerCase().includes('data structure')) {
      return dataStructureKeywords.some(kw => title.includes(kw)) || 
             isDiagramImage(result);
    }
    
    // Higher threshold for network searches
    if (query.toLowerCase().includes('network')) {
      return networkKeywords.some(kw => title.includes(kw)) || 
             isDiagramImage(result);
    }
    
    // Higher threshold for software/UML searches
    if (query.toLowerCase().includes('software') || 
        query.toLowerCase().includes('uml') || 
        query.toLowerCase().includes('class')) {
      return softwareKeywords.some(kw => title.includes(kw)) || 
             isDiagramImage(result);
    }
    
    // Higher threshold for database diagrams
    if (query.toLowerCase().includes('database') ||
        query.toLowerCase().includes('schema') ||
        query.toLowerCase().includes('er diagram')) {
      return databaseKeywords.some(kw => title.includes(kw)) || 
             isDiagramImage(result);
    }
    
    // Default case - use general diagram detection
    return isDiagramImage(result);
  };
  
  // Filter the results
  return results.filter(applyDomainSpecificCriteria);
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
  // Remove any existing diagram terms to avoid duplication
  const diagramTerms = ['diagram', 'chart', 'flowchart', 'visualization', 'graph', 'schema'];
  let cleanQuery = query;
  
  // Already has diagram term?
  const hasAnyDiagramTerm = diagramTerms.some(term => query.toLowerCase().includes(term));
  
  // Specialized enhancements for specific technical searches
  
  // Data structures
  if (query.toLowerCase().includes('data structure')) {
    return hasAnyDiagramTerm ? 
      `${query} computer science educational visualization high quality` : 
      `${query} diagram visualization computer science educational high quality`;
  }
  
  // Algorithms
  if (query.toLowerCase().includes('algorithm')) {
    return hasAnyDiagramTerm ? 
      `${query} computer science educational high quality` : 
      `${query} flowchart diagram educational high quality`;
  }
  
  // Networks
  if (query.toLowerCase().includes('network')) {
    return hasAnyDiagramTerm ? 
      `${query} topology technical high quality` : 
      `${query} topology diagram technical high quality`;
  }
  
  // UML diagrams
  if (query.toLowerCase().includes('uml') || query.toLowerCase().includes('class diagram')) {
    return `${query} software engineering technical high quality`;
  }
  
  // System/software architecture
  if (query.toLowerCase().includes('architecture') || query.toLowerCase().includes('system')) {
    return hasAnyDiagramTerm ? 
      `${query} technical design high quality` : 
      `${query} diagram technical design high quality`;
  }
  
  // Flowcharts
  if (query.toLowerCase().includes('flowchart') || query.toLowerCase().includes('flow chart')) {
    return `${query} process workflow technical high quality`;
  }
  
  // Entity-relationship diagrams
  if (query.toLowerCase().includes('er') || query.toLowerCase().includes('entity relationship')) {
    return hasAnyDiagramTerm ? 
      `${query} database schema high quality` : 
      `${query} diagram database schema high quality`;
  }
  
  // Database schemas
  if (query.toLowerCase().includes('database') || query.toLowerCase().includes('schema')) {
    return hasAnyDiagramTerm ?
      `${query} technical database diagram high quality` :
      `${query} database schema diagram technical high quality`;
  }
  
  // For very specific technical topics, add diagram explicitly
  const technicalTopics = [
    'data structure', 'algorithm', 'network', 'architecture', 
    'process', 'workflow', 'microservice', 'infrastructure',
    'backend', 'frontend', 'full stack', 'programming', 'code'
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
function enhanceSearchResults(results: DiagramResult[], query: string, relaxedFiltering: boolean = false): DiagramResult[] {
  // Extract terms from the query for relevance scoring
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  // Score function for relevance
  const scoreResult = (result: DiagramResult): number => {
    let score = 0;
    const title = result.title?.toLowerCase() || '';
    
    // Title contains exact query (highest relevance)
    if (title.includes(query.toLowerCase())) score += 25;
    
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
      if (title.startsWith(term)) score += 10;
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
      score += 15;
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
    
    // Specialized scoring for database diagrams
    if (query.toLowerCase().includes('database') ||
        query.toLowerCase().includes('schema') ||
        query.toLowerCase().includes('er diagram')) {
      const dbTerms = [
        'schema', 'entity', 'relationship', 'table', 'model',
        'database', 'relational', 'sql', 'er'
      ];
      
      for (const term of dbTerms) {
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
      score += 20;
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
    // Always keep results when we're using relaxed filtering
    if (relaxedFiltering) return true;
    
    // Filter out results that don't have proper titles
    if (!result.title || result.title.length < 5) return false;
    
    // Remove results that explicitly mention they are not diagrams
    if (result.title.toLowerCase().includes('not a diagram')) return false;
    
    // Exclude photos and stock imagery
    const isPhoto = ['photo', 'photograph', 'picture of', 'image of', 'stock image', 'stock photo']
      .some(term => result.title.toLowerCase().includes(term));
    
    if (isPhoto) return false;
    
    // More sophisticated filtering for specific query types
    if (query.toLowerCase().includes('data structure')) {
      const hasDataStructureContent = ['data structure', 'algorithm', 'tree', 'graph', 
        'hash', 'linked list', 'stack', 'queue', 'array']
        .some(term => result.title.toLowerCase().includes(term));
      
      const hasDiagramIndicator = ['diagram', 'visualization', 'chart', 'structure', 'model']
        .some(term => result.title.toLowerCase().includes(term));
        
      return hasDataStructureContent || hasDiagramIndicator;
    }
    
    if (query.toLowerCase().includes('network')) {
      const hasNetworkContent = ['network', 'topology', 'infrastructure', 'cloud', 
        'server', 'router', 'protocol', 'lan', 'wan', 'internet']
        .some(term => result.title.toLowerCase().includes(term));
      
      const hasDiagramIndicator = ['diagram', 'visualization', 'chart', 'architecture', 'model']
        .some(term => result.title.toLowerCase().includes(term));
        
      return hasNetworkContent || hasDiagramIndicator;
    }
    
    return true;
  });
  
  // Sort results by relevance score
  filteredResults.sort((a, b) => scoreResult(b) - scoreResult(a));
  
  // Add relevant tags if missing and enhance titles
  return filteredResults.map(result => {
    // Ensure title ends with "diagram" or equivalent term if not present
    let enhancedTitle = result.title;
    const diagramTerms = ['diagram', 'chart', 'flowchart', 'visualization', 'architecture'];
    const hasDiagramTerm = diagramTerms.some(term => 
      enhancedTitle.toLowerCase().includes(term)
    );
    
    // Generate or enhance tags
    let enhancedTags = result.tags || [];
    if (!enhancedTags.length) {
      // Generate tags from the title
      enhancedTags = result.title.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['and', 'the', 'for', 'with', 'this', 'that'].includes(word))
        .slice(0, 5);
        
      // Add common diagram types if detected in title
      const diagramTypes = [
        'flowchart', 'sequence', 'entity', 'class', 'use case', 
        'state', 'activity', 'network', 'architecture'
      ];
      
      for (const type of diagramTypes) {
        if (result.title.toLowerCase().includes(type) && !enhancedTags.includes(type)) {
          enhancedTags.push(type);
        }
      }
      
      // Add query terms as tags if not already included
      for (const term of queryTerms) {
        if (term.length > 3 && !enhancedTags.includes(term)) {
          enhancedTags.push(term);
        }
      }
    }
    
    return { 
      ...result, 
      title: enhancedTitle,
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
  
  // Domain-specific diagrams
  const specializeDiagrams = [
    "neural network diagram",
    "machine learning pipeline",
    "kubernetes architecture",
    "aws infrastructure diagram",
    "docker container diagram",
    "devops workflow diagram",
    "api gateway architecture",
    "event sourcing diagram",
    "cqrs pattern diagram",
    "serverless architecture diagram"
  ];
  
  // Suggestions based on all categories
  const allPossibleTerms = [...commonDiagramTypes, ...csProgrammingTopics, ...specializeDiagrams];
  
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
      
      // Contains term at word boundary
      const aContainsAtBoundary = a.toLowerCase().split(' ').some(word => word === lowercaseQuery);
      const bContainsAtBoundary = b.toLowerCase().split(' ').some(word => word === lowercaseQuery);
      
      if (aContainsAtBoundary && !bContainsAtBoundary) return -1;
      if (!aContainsAtBoundary && bContainsAtBoundary) return 1;
      
      // Alphabetical
      return a.localeCompare(b);
    })
    .slice(0, 8); // Show more suggestions
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
    "distributed systems architecture",
    "AWS cloud architecture",
    "kubernetes deployment diagram",
    "event-driven architecture"
  ];
}
