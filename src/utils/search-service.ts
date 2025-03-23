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
  page: number = 1,
  apiKey: string = "AIzaSyBLb8xMhQIVk5G344igPWC3xEIPKjsbSn8",
  searchId: string = "260090575ae504419"
): Promise<DiagramResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  console.log(`[SearchService] Searching for "${query}" (page ${page})`);
  
  try {
    // First attempt with standard query
    console.log(`[SearchService] Fetching fresh results for "${query}" page ${page}`);
    let results = await searchGoogleImages(query, apiKey, searchId, page);
    
    // If no results, try with more specific diagram terms
    if (results.length === 0) {
      console.log('[SearchService] No results with primary query, trying with explicit diagram terms');
      const diagramQuery = `${query} diagram educational visualization high quality infographic`;
      results = await searchGoogleImages(diagramQuery, apiKey, searchId, page);
    }
    
    // Still no results, try with broader terms
    if (results.length === 0) {
      console.log('[SearchService] Still no results, trying with broader terms');
      const broadQuery = `${query} diagram chart visualization educational`;
      results = await searchGoogleImages(broadQuery, apiKey, searchId, page);
    }
    
    if (results.length === 0) {
      console.warn(`[SearchService] No results found for "${query}"`);
      toast.warning("No diagrams found. Try a different search term.");
      return [];
    }
    
    // Filter and enhance results
    const filteredResults = filterDiagramsOnly(results, query);
    
    console.log(`[SearchService] Found ${filteredResults.length} results for "${query}"`);
    return filteredResults;
    
  } catch (error) {
    console.error(`[SearchService] Error searching for "${query}":`, error);
    
    if (error.message === 'API quota exceeded') {
      throw error; // Rethrow quota errors to handle specifically
    }
    
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
    'visualization', 'concept', 'visual', 'technical', 'educational',
    'data structure', 'algorithm', 'tree', 'graph', 'array', 'linked list',
    'stack', 'queue', 'hash table', 'scientific', 'academic', 'research',
    'study', 'learning', 'teaching', 'course', 'lecture', 'textbook'
  ];
  
  // Education and research-focused sources
  const educationalSources = [
    'edu', 'ac.uk', 'ac.jp', 'university', 'college', 'school',
    'khan academy', 'coursera', 'edx', 'udemy', 'brilliant',
    'research gate', 'science direct', 'springer', 'ieee',
    'acm', 'journal', 'conference', 'proceedings',
    'lecture', 'textbook', 'tutorial', 'guide'
  ];
  
  // Check if image appears to be a diagram based on its aspects
  const isDiagramImage = (result: DiagramResult) => {
    const title = result.title.toLowerCase();
    const sourceUrl = (result.sourceUrl || '').toLowerCase();
    
    // Check title for diagram keywords
    const hasDiagramKeyword = diagramKeywords.some(keyword => title.includes(keyword));
    
    // Check if source is a reputable diagram site
    const isQualitySource = sourceUrl ? isQualityDiagramSource(sourceUrl) : false;
    
    // Check if from an educational source
    const isEducationalSource = educationalSources.some(source => 
      sourceUrl.includes(source) || title.includes(source)
    );
    
    // Exclude non-diagram images
    const excludeTerms = ['photo', 'picture', 'image of', 'photograph', 'stock image', 'portrait'];
    const isExcludedType = excludeTerms.some(term => title.includes(term));
    
    return (hasDiagramKeyword || isQualitySource || isEducationalSource) && !isExcludedType;
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
    
    // Academic and educational sites
    'geeksforgeeks', 'javatpoint', 'tutorialspoint', 'educative', 
    'programiz', 'w3schools', 'stackoverflow', 'github', 'leetcode',
    'khanacademy', 'coursera', 'edx', 'udemy', 'brilliant.org', 'study.com',
    'visualgo.net', 'openstax', 'oercommons', 'merlot',
    
    // Research and academic sites
    'researchgate', 'ieee', 'acm.org', 'sciencedirect', 'springer',
    'nature.com', 'wiley', 'elsevier', 'jstor', 'academia.edu',
    'core.ac.uk', 'arxiv.org', 'biorxiv.org', 'ssrn.com',
    
    // Technical writing and documentation
    'medium', 'towardsdatascience', 'dev.to', 'docs.microsoft', 
    'aws.amazon', 'cloud.google', 'azure', 'ibm', 'cisco', 'oracle', 
    'mongodb', 'mysql', 'postgresql',
    
    // Educational platforms
    'mcgraw-hill', 'pearson', 'wiley', 'cengage', 'slideshare',
    
    // Universities
    'edu', 'ac.uk', 'ac.jp', '.edu.', 'cs.stanford.edu', 'mit.edu', 
    'harvard.edu', 'berkeley.edu', 'ox.ac.uk', 'cam.ac.uk',
  ];
  
  return qualitySources.some(source => url.toLowerCase().includes(source));
}

// Function to get search suggestions
export function getSearchSuggestions(query: string): string[] {
  if (!query.trim() || query.length < 2) {
    return getExampleSearches();
  }
  
  const lowercaseQuery = query.toLowerCase();
  
  // Expanded educational and research diagram types for comprehensive suggestions
  const academicDiagramTypes = [
    // Biology
    "cell structure diagram", "photosynthesis process diagram", "dna structure visualization",
    "human anatomy diagram", "plant anatomy illustration", "cell division stages",
    "digestive system diagram", "circulatory system diagram", "nervous system illustration",
    "enzyme action diagram", "evolution diagram", "animal classification chart",
    "mitosis stages diagram", "ecosystem diagram", "protein synthesis diagram",
    
    // Chemistry
    "periodic table of elements", "molecular structure visualization", "chemical reaction diagram",
    "bonding types diagram", "organic chemistry structures", "electron configuration diagram",
    "titration curve diagram", "chemical equilibrium diagram", "redox reaction diagram",
    "atomic structure model", "crystal lattice structure", "orbital diagram",
    "thermodynamic cycle diagram", "ph scale diagram", "buffer solution diagram",
    
    // Physics
    "force diagram", "circuit schematic", "wave interference pattern", 
    "electromagnetic spectrum diagram", "quantum mechanics visualization", "simple harmonic motion",
    "projectile motion diagram", "light refraction diagram", "lens diagram",
    "electric field visualization", "magnetic field lines", "energy transfer diagram",
    "vector field visualization", "optics ray diagram", "relativity diagram",
    
    // Mathematics
    "geometric proof diagram", "trigonometry unit circle", "vector space diagram",
    "set theory venn diagram", "calculus function visualization", "probability distribution",
    "number line diagram", "coordinate system diagram", "statistical distribution",
    "matrix transformation visualization", "function graph", "geometric series diagram",
    "differential equation solution", "topology diagram", "group theory visualization",
    
    // Computer Science
    "data structure visualization", "algorithm flow diagram", "UML class diagram",
    "system architecture diagram", "network topology illustration", "entity relationship diagram",
    "database schema diagram", "state machine diagram", "memory allocation diagram",
    "binary tree visualization", "hash table structure", "linked list representation",
    "sorting algorithm visualization", "tcp/ip stack diagram", "compiler structure diagram",
    "software development lifecycle", "microservice architecture", "api gateway diagram",
    "cloud infrastructure diagram", "service mesh diagram", "kubernetes architecture",
    "devops pipeline visualization", "git workflow diagram", "web application architecture",
    
    // Engineering
    "circuit design blueprint", "mechanical component diagram", "civil engineering structure",
    "control system diagram", "bridge structure visualization", "hydraulic system diagram",
    "electrical wiring diagram", "building blueprint", "mechanical linkage diagram",
    "heat exchanger diagram", "plc ladder logic", "pneumatic system diagram",
    "foundation design diagram", "reinforcement detail", "structural analysis diagram",
    
    // Academic and Research
    "research methodology diagram", "literature review map", "conceptual framework visualization",
    "theoretical model diagram", "study design flowchart", "data analysis process",
    "research framework diagram", "systematic review process", "methodology flowchart",
    "thesis structure diagram", "evaluation framework", "empirical research model"
  ];
  
  // Find matching suggestions and common misspellings/variations
  let matchingSuggestions = academicDiagramTypes.filter(term => 
    term.includes(lowercaseQuery) || 
    lowercaseQuery.includes(term.substring(0, Math.min(term.length, 5)))
  );
  
  // Generate related suggestions based on partial matches
  if (matchingSuggestions.length < 3 && query.length >= 3) {
    const queryWords = lowercaseQuery.split(/\s+/);
    
    // Add related suggestions based on individual words in query
    const relatedSuggestions = academicDiagramTypes.filter(term => {
      return queryWords.some(word => 
        word.length >= 3 && term.includes(word) && !matchingSuggestions.includes(term)
      );
    });
    
    matchingSuggestions = [...matchingSuggestions, ...relatedSuggestions];
  }
  
  // Add popular subject-specific suggestions
  if (lowercaseQuery.includes('computer') || lowercaseQuery.includes('programming')) {
    matchingSuggestions.push(
      "algorithm visualization", 
      "data structure diagram",
      "software architecture diagram",
      "class diagram",
      "sequence diagram"
    );
  }
  
  if (lowercaseQuery.includes('bio') || lowercaseQuery.includes('life')) {
    matchingSuggestions.push(
      "cell diagram",
      "dna structure",
      "human anatomy diagram", 
      "protein synthesis"
    );
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

// Example searches to show when no query is entered - educational and research focused
function getExampleSearches(): string[] {
  return [
    "cell structure diagram",
    "data structure visualization",
    "circuit diagram",
    "human anatomy diagram",
    "chemical reaction diagram",
    "UML class diagram",
    "entity relationship diagram",
    "force diagram physics",
    "system architecture diagram",
    "research methodology diagram",
    "network topology diagram",
    "database schema diagram",
    "CPU scheduling algorithm",
    "software development lifecycle",
    "project management flowchart"
  ];
}
