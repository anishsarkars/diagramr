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
      results = await searchGoogleImages(`${query} diagram image`);
    }
    
    // If still no results, try another variation
    if (results.length === 0) {
      console.log('[SearchService] No results with generic terms, trying with visualization');
      results = await searchGoogleImages(`${query} visualization`);
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
    
    if (error.message && error.message.includes('quota exceeded')) {
      toast.error("Search quota exceeded. Please try again later.");
    } else {
      toast.error("Search failed. Please try again.");
    }
    
    return [];
  }
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

// Diverse example searches for educational diagrams
function getExampleSearches(): string[] {
  return [
    "circuit diagram",
    "human anatomy",
    "photosynthesis process",
    "UML class diagram",
    "network topology",
    "data structure visualization",
    "business process model",
    "entity relationship diagram",
    "molecular structure",
    "decision tree",
    "climate system",
    "data flow diagram",
    "mechanical assembly",
    "organization chart",
    "free body diagram",
    "cpu architecture",
    "protein synthesis",
    "organic chemistry"
  ];
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
