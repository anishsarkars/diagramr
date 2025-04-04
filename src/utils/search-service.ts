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

// Main search function with improved fallback strategies and educational focus
export async function searchDiagrams(
  query: string,
  page: number = 1
): Promise<DiagramResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  // Check cache first
  const cacheKey = `${query}:${page}`;
  if (searchCache.has(cacheKey)) {
    const cachedResult = searchCache.get(cacheKey);
    if (cachedResult && cachedResult.results.length > 0) {
      const cacheAge = Date.now() - cachedResult.timestamp;
      const CACHE_FRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutes
      
      if (cacheAge < CACHE_FRESH_THRESHOLD) {
        console.log(`[SearchService] Using cached results for "${query}" (page ${page}), age: ${Math.round(cacheAge/1000)}s`);
        // Return only first 10 results to help maintain 15-20 total result target
        return cachedResult.results.slice(0, 10);
      }
    }
  }
  
  console.log(`[SearchService] Searching for "${query}" (page ${page})`);
  
  try {
    // Educational search query enhancement
    // Add educational/research/professional context to the query for better results
    const enhancementTerms = ["diagram", "illustration", "schematic", "chart", "graphic", "visual"];
    const randomEnhancementTerm = enhancementTerms[Math.floor(Math.random() * enhancementTerms.length)];
    const enhancedQuery = query.includes("diagram") || query.includes("chart") ? query : `${query} ${randomEnhancementTerm}`;
    
    // Direct search with enhancement for better results
    console.log(`[SearchService] Fetching results for "${enhancedQuery}" page ${page}`);
    let results = await searchGoogleImages(enhancedQuery, undefined, undefined, page);
    
    // If no results, try a more specific query
    if (results.length === 0) {
      console.log('[SearchService] No results with primary query, trying with more specific terms');
      results = await searchGoogleImages(`${query} diagram`, undefined, undefined, page);
    }
    
    // If still no results, try another variation for visual content
    if (results.length === 0) {
      console.log('[SearchService] No results with specific terms, trying with visual terms');
      results = await searchGoogleImages(`${query} visualization infographic`, undefined, undefined, page);
    }
    
    if (results.length === 0) {
      console.warn(`[SearchService] No results found for "${query}"`);
      toast.warning("No results found. Try a different search term.");
      return [];
    }
    
    // Deduplicate results based on image URL
    const uniqueImageUrls = new Set<string>();
    const deduplicatedResults = results.filter(result => {
      const normalizedUrl = result.imageSrc.split('?')[0]; // Remove query parameters
      if (!uniqueImageUrls.has(normalizedUrl)) {
        uniqueImageUrls.add(normalizedUrl);
        return true;
      }
      return false;
    });
    
    // Prioritize results - boost all types of relevant diagrams
    const prioritizedResults = deduplicatedResults.sort((a, b) => {
      // First prioritize by diagram relevance
      const aDiagramRelevance = calculateDiagramRelevance(a, query);
      const bDiagramRelevance = calculateDiagramRelevance(b, query);
      
      if (aDiagramRelevance > bDiagramRelevance) return -1;
      if (aDiagramRelevance < bDiagramRelevance) return 1;
      
      // Then by content type - educational, professional, creative, etc.
      const aContentScore = getContentTypeScore(a);
      const bContentScore = getContentTypeScore(b);
      
      if (aContentScore > bContentScore) return -1;
      if (aContentScore < bContentScore) return 1;
      
      // Default to the original relevance score
      return (b.relevanceScore || 0) - (a.relevanceScore || 0);
    });
    
    // Limit to 10 results per page to help maintain the 15-20 total result target
    const limitedResults = prioritizedResults.slice(0, 10);
    
    console.log(`[SearchService] Found ${limitedResults.length} results for "${query}" (limited from ${prioritizedResults.length})`);
    
    // Cache successful results (store full results set)
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      results: prioritizedResults
    });
    
    return limitedResults;
    
  } catch (error) {
    console.error(`[SearchService] Error searching for "${query}":`, error);
    
    // More detailed error handling
    if (error.message) {
      if (error.message.includes('quota exceeded') || error.message.includes('API quota')) {
        console.log('[SearchService] API quota exceeded, trying with fallback approach');
        
        try {
          // Last attempt with a different query format that might work with a different key
          const fallbackResults = await searchGoogleImages(
            `${query} diagram`, 
            undefined, 
            undefined, 
            page,
            3 // Max retries already attempted
          );
          
          if (fallbackResults && fallbackResults.length > 0) {
            console.log(`[SearchService] Fallback search successful with ${fallbackResults.length} results`);
            
            // Deduplicate fallback results
            const uniqueImageUrls = new Set<string>();
            const deduplicatedResults = fallbackResults.filter(result => {
              const normalizedUrl = result.imageSrc.split('?')[0]; // Remove query parameters
              if (!uniqueImageUrls.has(normalizedUrl)) {
                uniqueImageUrls.add(normalizedUrl);
                return true;
              }
              return false;
            });
            
            // Cache successful results
            searchCache.set(cacheKey, {
              timestamp: Date.now(),
              results: deduplicatedResults
            });
            
            return deduplicatedResults;
          }
        } catch (fallbackError) {
          console.error('[SearchService] Fallback search also failed:', fallbackError);
        }
        
        toast.error("Search quota exceeded. The system will use alternative API keys for subsequent searches.", {
          duration: 5000,
          action: {
            label: "Home",
            onClick: () => window.location.href = "/"
          }
        });
      } else {
        toast.error("Search failed. Please try again.", {
          duration: 5000,
          action: {
            label: "Home",
            onClick: () => window.location.href = "/"
          }
        });
      }
    } else {
      toast.error("Search failed. Please try again.", {
        duration: 5000,
        action: {
          label: "Home",
          onClick: () => window.location.href = "/"
        }
      });
    }
    
    // Check if we have cached results, even if they're stale
    if (searchCache.has(cacheKey)) {
      const staleCache = searchCache.get(cacheKey);
      if (staleCache && staleCache.results.length > 0) {
        console.log(`[SearchService] Returning stale cached results for "${query}" after error`);
        toast.info("Showing cached results while search service recovers", {
          description: "These results may not be the latest.",
          duration: 3000
        });
        return staleCache.results;
      }
    }
    
    return [];
  }
}

// Helper function to determine if content is likely educational
function isEducationalContent(result: DiagramResult): boolean {
  // Check title for educational keywords
  const educationalKeywords = [
    "diagram", "schematic", "educational", "academic", "lecture", "study", 
    "course", "lesson", "university", "college", "school", "research",
    "science", "scientific", "theory", "concept", "illustration", "textbook"
  ];
  
  // Check in title
  if (result.title) {
    for (const keyword of educationalKeywords) {
      if (result.title.toLowerCase().includes(keyword)) {
        return true;
      }
    }
  }
  
  // Check in tags
  if (result.tags && result.tags.length > 0) {
    for (const tag of result.tags) {
      for (const keyword of educationalKeywords) {
        if (tag.toLowerCase().includes(keyword)) {
          return true;
        }
      }
    }
  }
  
  // Check domain (if available) for .edu, academic, etc.
  if (result.sourceUrl) {
    const educationalDomains = [".edu", "academic", "university", "college", "school", "research"];
    for (const domain of educationalDomains) {
      if (result.sourceUrl.toLowerCase().includes(domain)) {
        return true;
      }
    }
  }
  
  return false;
}

// Helper function to determine diagram relevance score
function calculateDiagramRelevance(result: DiagramResult, query: string): number {
  let score = 0;
  const normalizedQuery = query.toLowerCase();
  
  // Check if title contains the query terms (highest importance)
  if (result.title && result.title.toLowerCase().includes(normalizedQuery)) {
    score += 5;
  }
  
  // Check for exact diagram type match in query
  const diagramTypes = [
    // Standard diagrams
    "flowchart", "process flow", "uml", "class diagram", "sequence diagram",
    "er diagram", "entity relationship", "mind map", "concept map", "org chart",
    "gantt chart", "architecture diagram", "network diagram", "data flow",
    "system diagram", "circuit diagram", "state diagram", "activity diagram",
    
    // Business & Strategy
    "swot analysis", "business model canvas", "value chain", "marketing funnel", 
    "customer journey", "stakeholder map", "porters five forces", "pest analysis",
    "decision tree", "process map", "value stream mapping", "kanban board",
    
    // Design & Creative
    "wireframe", "mockup", "design layout", "user flow", "sitemap", "storyboard",
    "mood board", "color palette", "typography scale", "interaction diagram",
    "user interface", "information architecture", "service blueprint",
    
    // Data & Analytics
    "bar chart", "pie chart", "line graph", "histogram", "scatter plot", 
    "area chart", "bubble chart", "waterfall chart", "heat map", "tree map",
    "radar chart", "sankey diagram", "funnel chart", "candlestick chart",
    
    // Science & Engineering
    "circuit schematic", "wiring diagram", "blueprint", "floor plan", "p&id",
    "mechanical drawing", "assembly diagram", "exploded view", "schematic",
    "hydraulic system", "pneumatic system", "molecular structure", "genetic map",
    
    // Math & Logic
    "venn diagram", "set diagram", "euler diagram", "logic circuit", 
    "truth table", "geometric diagram", "function graph", "number line",
    "coordinate system", "vector field", "probability tree", 
    
    // Computer & Technology
    "network topology", "database schema", "sitemap", "deployment diagram",
    "component diagram", "package diagram", "object diagram", "use case diagram",
    "api flow", "data model", "infrastructure diagram", "devops pipeline"
  ];
  
  for (const type of diagramTypes) {
    if (normalizedQuery.includes(type)) {
      // If the diagram has this type in title or tags
      if (result.title && result.title.toLowerCase().includes(type)) {
        score += 3;
      }
      
      if (result.tags && result.tags.some(tag => 
        tag.toLowerCase().includes(type) || 
        type.includes(tag.toLowerCase())
      )) {
        score += 2;
      }
    }
  }
  
  // Add points for high-quality sources
  if (result.sourceUrl) {
    const url = result.sourceUrl.toLowerCase();
    // Educational sources
    if (url.includes('.edu') || 
        url.includes('academic') || 
        url.includes('university') ||
        url.includes('school') ||
        url.includes('research')) {
      score += 2;
    }
    
    // Well-known diagram/documentation sites
    if (url.includes('lucidchart') ||
        url.includes('draw.io') ||
        url.includes('miro') ||
        url.includes('diagrams.net') ||
        url.includes('visio') ||
        url.includes('docs.')) {
      score += 2;
    }
    
    // Books and publications
    if (url.includes('book') ||
        url.includes('publication') ||
        url.includes('journal') ||
        url.includes('article') ||
        url.includes('paper')) {
      score += 1;
    }
  }
  
  // Boost for results with complete metadata
  if (result.title && result.author && result.tags && result.tags.length > 0) {
    score += 1;
  }
  
  return score;
}

// Helper function to determine content type score - gives weight to different content types
function getContentTypeScore(result: DiagramResult): number {
  let score = 0;
  
  // Check title and tags for content type indicators
  const contentTypes = {
    educational: ["educational", "academic", "lecture", "study", "university", "college", "school", "research", "textbook"],
    professional: ["business", "professional", "workflow", "process", "corporate", "enterprise", "project", "organization", "company"],
    technical: ["technical", "engineering", "architecture", "system", "protocol", "network", "code", "algorithm", "software"],
    creative: ["creative", "design", "art", "concept", "idea", "brainstorm", "mind map", "sketch", "visual", "infographic"],
    informational: ["information", "data", "statistics", "analytics", "comparison", "timeline", "chart", "graph"]
  };
  
  // Check title
  if (result.title) {
    const title = result.title.toLowerCase();
    
    for (const [type, keywords] of Object.entries(contentTypes)) {
      for (const keyword of keywords) {
        if (title.includes(keyword)) {
          score += 1;
          break; // Only count once per type
        }
      }
    }
  }
  
  // Check tags with higher weight
  if (result.tags && result.tags.length > 0) {
    for (const [type, keywords] of Object.entries(contentTypes)) {
      for (const tag of result.tags) {
        const tagLower = tag.toLowerCase();
        for (const keyword of keywords) {
          if (tagLower.includes(keyword) || keyword.includes(tagLower)) {
            score += 2; // Tags have higher weight than title
            break; // Only count once per tag
          }
        }
      }
    }
  }
  
  // Check source URL
  if (result.sourceUrl) {
    const url = result.sourceUrl.toLowerCase();
    
    // Quality diagram sites
    if (url.includes('diagram') || 
        url.includes('chart') || 
        url.includes('visual') ||
        url.includes('draw.io') ||
        url.includes('lucidchart') ||
        url.includes('miro') ||
        url.includes('figma') ||
        url.includes('canva')) {
      score += 3;
    }
    
    // Educational sources still get a boost
    if (url.includes('.edu') || 
        url.includes('academic') || 
        url.includes('university')) {
      score += 2;
    }
    
    // Professional/business sources
    if (url.includes('business') ||
        url.includes('enterprise') ||
        url.includes('company') ||
        url.includes('corporate') ||
        url.includes('professional')) {
      score += 2;
    }
  }
  
  // Quality indicators - diagrams with complete metadata are usually better
  if (result.title && result.tags && result.tags.length > 0) {
    score += 1;
  }
  
  return score;
}

// Function to get search suggestions
export function getSearchSuggestions(query: string): string[] {
  if (!query.trim() || query.length < 2) {
    return getExampleSearches();
  }
  
  const lowercaseQuery = query.toLowerCase();
  
  // Comprehensive academic content types across various domains
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
    
    // Computer Science
    "data structure visualization", "algorithm flowchart", "sorting algorithm",
    "binary tree", "network diagram", "cpu architecture", "memory hierarchy",
    "operating system", "computer architecture", "compiler design", "database model",
    
    // Physics & Math
    "force diagram", "free body diagram", "wave interference", "projectile motion",
    "electric circuit", "electromagnetic field", "quantum mechanics", "relativity",
    "matrix transformation", "vector calculus", "differential equations", "probability distribution",
    
    // Biology & Medicine
    "cellular respiration", "protein synthesis", "genome mapping", "nervous system",
    "circulatory system", "immune response", "mitosis process", "meiosis stages",
    "plant anatomy", "animal taxonomy", "brain structure", "digestive system",
    
    // Chemistry
    "chemical bonding", "organic molecules", "reaction mechanism", "titration curve",
    "phase diagram", "crystal structure", "electron configuration", "carbon cycle",
    
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

// Diverse example searches for all types of diagrams
function getExampleSearches(): string[] {
  const categories = {
    technology: [
      "network topology diagram",
      "system architecture diagram",
      "database schema",
      "uml class diagram",
      "software deployment diagram"
    ],
    business: [
      "business process model",
      "organization chart",
      "swot analysis diagram",
      "marketing funnel",
      "customer journey map"
    ],
    design: [
      "wireframe diagram",
      "user flow diagram",
      "sitemap diagram",
      "interaction diagram",
      "service blueprint"
    ],
    science: [
      "circuit diagram",
      "molecular structure",
      "human anatomy diagram",
      "chemical reaction diagram",
      "cell structure diagram"
    ],
    engineering: [
      "mechanical assembly drawing",
      "blueprint drawing",
      "p&id diagram",
      "hydraulic system diagram",
      "electrical wiring diagram"
    ],
    math: [
      "venn diagram",
      "function graph",
      "geometric diagram",
      "statistical plot",
      "probability tree"
    ],
    dataViz: [
      "bar chart comparison",
      "trend line graph",
      "pie chart breakdown",
      "heat map visualization",
      "scatter plot correlation"
    ],
    planning: [
      "gantt chart project",
      "mind map brainstorm",
      "decision tree",
      "critical path diagram",
      "concept map"
    ]
  };
  
  // Select random examples from each category
  const examples: string[] = [];
  for (const category of Object.values(categories)) {
    // Pick 2-3 random items from each category
    const numToSelect = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const selectedIndices = new Set<number>();
    
    while (selectedIndices.size < numToSelect && selectedIndices.size < category.length) {
      const randomIndex = Math.floor(Math.random() * category.length);
      selectedIndices.add(randomIndex);
    }
    
    for (const index of selectedIndices) {
      examples.push(category[index]);
    }
  }
  
  // Shuffle the array to mix categories
  return examples.sort(() => Math.random() - 0.5).slice(0, 18);
}

// Function to find additional resources based on a search term
export function findAdditionalResources(searchTerm: string) {
  // This function would normally make an API call to get real resources
  // For now, we'll return static resources based on the search term category
  
  const searchTermLower = searchTerm.toLowerCase();
  
  // Determine the category of the search term
  let category = "";
  
  // Computer Science related terms
  if (searchTermLower.includes("algorithm") || 
      searchTermLower.includes("data structure") || 
      searchTermLower.includes("programming") ||
      searchTermLower.includes("database") ||
      searchTermLower.includes("network") ||
      searchTermLower.includes("software") ||
      searchTermLower.includes("uml") ||
      searchTermLower.includes("code") ||
      searchTermLower.includes("computer")) {
    category = "computer-science";
  } 
  // Physics related terms
  else if (searchTermLower.includes("physics") || 
           searchTermLower.includes("force") || 
           searchTermLower.includes("motion") ||
           searchTermLower.includes("energy") ||
           searchTermLower.includes("circuit") ||
           searchTermLower.includes("wave") ||
           searchTermLower.includes("quantum") ||
           searchTermLower.includes("relativity") ||
           searchTermLower.includes("electromagnetic")) {
    category = "physics";
  }
  // Biology related terms
  else if (searchTermLower.includes("biology") || 
           searchTermLower.includes("cell") || 
           searchTermLower.includes("dna") ||
           searchTermLower.includes("organism") ||
           searchTermLower.includes("plant") ||
           searchTermLower.includes("animal") ||
           searchTermLower.includes("organ") ||
           searchTermLower.includes("system") ||
           searchTermLower.includes("anatomy") ||
           searchTermLower.includes("physiology")) {
    category = "biology";
  }
  // Chemistry related terms
  else if (searchTermLower.includes("chemistry") || 
           searchTermLower.includes("chemical") || 
           searchTermLower.includes("molecule") ||
           searchTermLower.includes("atom") ||
           searchTermLower.includes("reaction") ||
           searchTermLower.includes("bond") ||
           searchTermLower.includes("organic") ||
           searchTermLower.includes("compound") ||
           searchTermLower.includes("periodic")) {
    category = "chemistry";
  }
  // Mathematics related terms
  else if (searchTermLower.includes("math") || 
           searchTermLower.includes("algebra") || 
           searchTermLower.includes("calculus") ||
           searchTermLower.includes("geometry") ||
           searchTermLower.includes("equation") ||
           searchTermLower.includes("function") ||
           searchTermLower.includes("statistics") ||
           searchTermLower.includes("probability") ||
           searchTermLower.includes("matrix")) {
    category = "mathematics";
  }
  // Business/Economics related terms
  else if (searchTermLower.includes("business") || 
           searchTermLower.includes("economics") || 
           searchTermLower.includes("finance") ||
           searchTermLower.includes("market") ||
           searchTermLower.includes("organization") ||
           searchTermLower.includes("management") ||
           searchTermLower.includes("process") ||
           searchTermLower.includes("model") ||
           searchTermLower.includes("flowchart")) {
    category = "business";
  }
  else {
    // Default category if no match found
    category = "general";
  }
  
  // Return resources based on the category
  switch(category) {
    case "computer-science":
      return [
        {
          title: "Data Structures & Algorithms",
          url: "https://www.geeksforgeeks.org/data-structures/",
          source: "GeeksforGeeks",
          type: "Course"
        },
        {
          title: "Computer Science Curriculum",
          url: "https://www.khanacademy.org/computing/computer-science",
          source: "Khan Academy",
          type: "Video Series"
        },
        {
          title: "UML Diagram Tutorial",
          url: "https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-uml/",
          source: "Visual Paradigm",
          type: "Tutorial"
        },
        {
          title: "Database Design",
          url: "https://www.lucidchart.com/pages/database-diagram/database-design",
          source: "Lucidchart",
          type: "Guide"
        }
      ];
    case "physics":
      return [
        {
          title: "Physics Courses",
          url: "https://www.khanacademy.org/science/physics",
          source: "Khan Academy",
          type: "Video Series"
        },
        {
          title: "Physics Classroom",
          url: "https://www.physicsclassroom.com/",
          source: "The Physics Classroom",
          type: "Tutorial"
        },
        {
          title: "MIT OpenCourseWare Physics",
          url: "https://ocw.mit.edu/courses/physics/",
          source: "MIT",
          type: "Course"
        },
        {
          title: "HyperPhysics Concepts",
          url: "http://hyperphysics.phy-astr.gsu.edu/hbase/index.html",
          source: "Georgia State University",
          type: "Reference"
        }
      ];
    case "biology":
      return [
        {
          title: "Biology Library",
          url: "https://www.khanacademy.org/science/biology",
          source: "Khan Academy",
          type: "Video Series"
        },
        {
          title: "Biology Courses",
          url: "https://www.coursera.org/browse/life-sciences/biology",
          source: "Coursera",
          type: "Course"
        },
        {
          title: "Interactive Biology",
          url: "https://www.cellsalive.com/",
          source: "Cells Alive",
          type: "Interactive"
        },
        {
          title: "Human Anatomy Atlas",
          url: "https://www.visiblebody.com/",
          source: "Visible Body",
          type: "Tool"
        }
      ];
    case "chemistry":
      return [
        {
          title: "Chemistry Library",
          url: "https://www.khanacademy.org/science/chemistry",
          source: "Khan Academy",
          type: "Video Series"
        },
        {
          title: "Chemistry Guides",
          url: "https://chem.libretexts.org/",
          source: "LibreTexts",
          type: "Textbook"
        },
        {
          title: "Chemistry Courses",
          url: "https://www.edx.org/learn/chemistry",
          source: "edX",
          type: "Course"
        },
        {
          title: "Organic Chemistry Animations",
          url: "https://www.chemtube3d.com/",
          source: "ChemTube3D",
          type: "Interactive"
        }
      ];
    case "mathematics":
      return [
        {
          title: "Mathematics Library",
          url: "https://www.khanacademy.org/math",
          source: "Khan Academy",
          type: "Video Series"
        },
        {
          title: "Interactive Mathematics",
          url: "https://www.desmos.com/",
          source: "Desmos",
          type: "Tool"
        },
        {
          title: "Mathematics Courses",
          url: "https://www.coursera.org/browse/math-and-logic",
          source: "Coursera",
          type: "Course"
        },
        {
          title: "Mathematics Reference",
          url: "https://mathworld.wolfram.com/",
          source: "Wolfram MathWorld",
          type: "Reference"
        }
      ];
    case "business":
      return [
        {
          title: "Business Process Modeling",
          url: "https://www.lucidchart.com/pages/business-process-modeling",
          source: "Lucidchart",
          type: "Guide"
        },
        {
          title: "Economics Courses",
          url: "https://www.khanacademy.org/economics-finance-domain",
          source: "Khan Academy",
          type: "Video Series"
        },
        {
          title: "Business Management",
          url: "https://www.coursera.org/browse/business/business-strategy",
          source: "Coursera",
          type: "Course"
        },
        {
          title: "Flowchart Maker",
          url: "https://www.diagrams.net/",
          source: "Diagrams.net",
          type: "Tool"
        }
      ];
    default:
      return [
        {
          title: "Academic Resources",
          url: "https://www.khanacademy.org/",
          source: "Khan Academy",
          type: "Video Series"
        },
        {
          title: "Free Online Courses",
          url: "https://www.coursera.org/",
          source: "Coursera",
          type: "Course"
        },
        {
          title: "Interactive Learning",
          url: "https://www.edx.org/",
          source: "edX",
          type: "Course"
        },
        {
          title: "Visual Learning Tools",
          url: "https://www.lucidchart.com/",
          source: "Lucidchart",
          type: "Tool"
        }
      ];
  }
}
