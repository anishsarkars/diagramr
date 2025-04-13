import { DiagramResult } from "@/hooks/use-infinite-search";
import { searchGoogleImages } from "@/utils/googleSearch";
import { toast } from "sonner";
import { ResourceItem } from "@/components/recommendation-section";
import { generateRelatedResources } from "./gemini-ai";

const MAX_CACHE_SIZE = 200;

const searchCache = new Map<string, {
  timestamp: number;
  results: DiagramResult[];
}>();

function cleanCache() {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  for (const [key, entry] of searchCache.entries()) {
    if (now - entry.timestamp > ONE_HOUR) {
      searchCache.delete(key);
    }
  }
  
  if (searchCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(searchCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    for (const [key] of toRemove) {
      searchCache.delete(key);
    }
  }
}

setInterval(cleanCache, 5 * 60 * 1000);

export async function searchDiagrams(
  query: string,
  page: number = 1
): Promise<DiagramResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  const cacheKey = `${query}:${page}`;
  if (searchCache.has(cacheKey)) {
    const cachedResult = searchCache.get(cacheKey);
    if (cachedResult && cachedResult.results.length > 0) {
      const cacheAge = Date.now() - cachedResult.timestamp;
      const CACHE_FRESH_THRESHOLD = 10 * 60 * 1000;
      
      if (cacheAge < CACHE_FRESH_THRESHOLD) {
        console.log(`[SearchService] Using cached results for "${query}" (page ${page}), age: ${Math.round(cacheAge/1000)}s`);
        return cachedResult.results.slice(0, 10);
      }
    }
  }
  
  console.log(`[SearchService] Searching for "${query}" (page ${page})`);
  
  try {
    const enhancementTerms = ["diagram", "illustration", "schematic", "chart", "graphic", "visual"];
    const randomEnhancementTerm = enhancementTerms[Math.floor(Math.random() * enhancementTerms.length)];
    const enhancedQuery = query.includes("diagram") || query.includes("chart") ? query : `${query} ${randomEnhancementTerm}`;
    
    console.log(`[SearchService] Fetching results for "${enhancedQuery}" page ${page}`);
    let results = await searchGoogleImages(enhancedQuery, undefined, undefined, page);
    
    if (results.length === 0) {
      console.log('[SearchService] No results with primary query, trying with more specific terms');
      results = await searchGoogleImages(`${query} diagram`, undefined, undefined, page);
    }
    
    if (results.length === 0) {
      console.log('[SearchService] No results with specific terms, trying with visual terms');
      results = await searchGoogleImages(`${query} visualization infographic`, undefined, undefined, page);
    }
    
    if (results.length === 0) {
      console.warn(`[SearchService] No results found for "${query}"`);
      toast.warning("No results found. Try a different search term.");
      return [];
    }
    
    const uniqueImageUrls = new Set<string>();
    const deduplicatedResults = results.filter(result => {
      const normalizedUrl = result.imageSrc.split('?')[0];
      if (!uniqueImageUrls.has(normalizedUrl)) {
        uniqueImageUrls.add(normalizedUrl);
        return true;
      }
      return false;
    });
    
    const prioritizedResults = deduplicatedResults.sort((a, b) => {
      const aDiagramRelevance = calculateDiagramRelevance(a, query);
      const bDiagramRelevance = calculateDiagramRelevance(b, query);
      
      if (aDiagramRelevance > bDiagramRelevance) return -1;
      if (aDiagramRelevance < bDiagramRelevance) return 1;
      
      const aContentScore = getContentTypeScore(a);
      const bContentScore = getContentTypeScore(b);
      
      if (aContentScore > bContentScore) return -1;
      if (aContentScore < bContentScore) return 1;
      
      return (b.relevanceScore || 0) - (a.relevanceScore || 0);
    });
    
    const limitedResults = prioritizedResults.slice(0, 10);
    
    console.log(`[SearchService] Found ${limitedResults.length} results for "${query}" (limited from ${prioritizedResults.length})`);
    
    searchCache.set(cacheKey, {
      timestamp: Date.now(),
      results: prioritizedResults
    });
    
    return limitedResults;
    
  } catch (error) {
    console.error(`[SearchService] Error searching for "${query}":`, error);
    
    if (error.message) {
      if (error.message.includes('quota exceeded') || error.message.includes('API quota')) {
        console.log('[SearchService] API quota exceeded, trying with fallback approach');
        
        try {
          const fallbackResults = await searchGoogleImages(
            `${query} diagram`, 
            undefined, 
            undefined, 
            page,
            3
          );
          
          if (fallbackResults && fallbackResults.length > 0) {
            console.log(`[SearchService] Fallback search successful with ${fallbackResults.length} results`);
            
            const uniqueImageUrls = new Set<string>();
            const deduplicatedResults = fallbackResults.filter(result => {
              const normalizedUrl = result.imageSrc.split('?')[0];
              if (!uniqueImageUrls.has(normalizedUrl)) {
                uniqueImageUrls.add(normalizedUrl);
                return true;
              }
              return false;
            });
            
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

function isEducationalContent(result: DiagramResult): boolean {
  const educationalKeywords = [
    "diagram", "schematic", "educational", "academic", "lecture", "study", 
    "course", "lesson", "university", "college", "school", "research",
    "science", "scientific", "theory", "concept", "illustration", "textbook"
  ];
  
  if (result.title) {
    for (const keyword of educationalKeywords) {
      if (result.title.toLowerCase().includes(keyword)) {
        return true;
      }
    }
  }
  
  if (result.tags && result.tags.length > 0) {
    for (const tag of result.tags) {
      for (const keyword of educationalKeywords) {
        if (tag.toLowerCase().includes(keyword)) {
          return true;
        }
      }
    }
  }
  
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

function calculateDiagramRelevance(result: DiagramResult, query: string): number {
  let score = 0;
  const normalizedQuery = query.toLowerCase();
  
  if (result.title && result.title.toLowerCase().includes(normalizedQuery)) {
    score += 5;
  }
  
  const diagramTypes = [
    "flowchart", "process flow", "uml", "class diagram", "sequence diagram",
    "er diagram", "entity relationship", "mind map", "concept map", "org chart",
    "gantt chart", "architecture diagram", "network diagram", "data flow",
    "system diagram", "circuit diagram", "state diagram", "activity diagram",
    
    "swot analysis", "business model canvas", "value chain", "marketing funnel", 
    "customer journey", "stakeholder map", "porters five forces", "pest analysis",
    "decision tree", "process map", "value stream mapping", "kanban board",
    
    "wireframe", "mockup", "design layout", "user flow", "sitemap", "storyboard",
    "mood board", "color palette", "typography scale", "interaction diagram",
    "user interface", "information architecture", "service blueprint",
    
    "bar chart", "pie chart", "line graph", "histogram", "scatter plot", 
    "area chart", "bubble chart", "waterfall chart", "heat map", "tree map",
    "radar chart", "sankey diagram", "funnel chart", "candlestick chart",
    
    "circuit schematic", "wiring diagram", "blueprint", "floor plan", "p&id",
    "mechanical drawing", "assembly diagram", "exploded view", "schematic",
    "hydraulic system", "pneumatic system", "molecular structure", "genetic map",
    
    "venn diagram", "set diagram", "euler diagram", "logic circuit", 
    "truth table", "geometric diagram", "function graph", "number line",
    "coordinate system", "vector field", "probability tree"
  ];
  
  for (const type of diagramTypes) {
    if (normalizedQuery.includes(type)) {
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
  
  if (result.sourceUrl) {
    const url = result.sourceUrl.toLowerCase();
    
    if (url.includes('.edu') || 
        url.includes('academic') || 
        url.includes('university') ||
        url.includes('school') ||
        url.includes('research')) {
      score += 2;
    }
    
    if (url.includes('lucidchart') ||
        url.includes('draw.io') ||
        url.includes('miro') ||
        url.includes('diagrams.net') ||
        url.includes('visio') ||
        url.includes('docs.')) {
      score += 2;
    }
    
    if (url.includes('book') ||
        url.includes('publication') ||
        url.includes('journal') ||
        url.includes('article') ||
        url.includes('paper')) {
      score += 1;
    }
  }
  
  if (result.title && result.author && result.tags && result.tags.length > 0) {
    score += 1;
  }
  
  return score;
}

function getContentTypeScore(result: DiagramResult): number {
  let score = 0;
  
  const contentTypes = {
    educational: ["educational", "academic", "lecture", "study", "university", "college", "school", "research", "textbook"],
    professional: ["business", "professional", "workflow", "process", "corporate", "enterprise", "project", "organization", "company"],
    technical: ["technical", "engineering", "architecture", "system", "protocol", "network", "code", "algorithm", "software"],
    creative: ["creative", "design", "art", "concept", "idea", "brainstorm", "mind map", "sketch", "visual", "infographic"],
    informational: ["information", "data", "statistics", "analytics", "comparison", "timeline", "chart", "graph"]
  };
  
  if (result.title) {
    const title = result.title.toLowerCase();
    
    for (const [type, keywords] of Object.entries(contentTypes)) {
      for (const keyword of keywords) {
        if (title.includes(keyword)) {
          score += 1;
          break;
        }
      }
    }
  }
  
  if (result.tags && result.tags.length > 0) {
    for (const [type, keywords] of Object.entries(contentTypes)) {
      for (const tag of result.tags) {
        const tagLower = tag.toLowerCase();
        for (const keyword of keywords) {
          if (tagLower.includes(keyword) || keyword.includes(tagLower)) {
            score += 2;
            break;
          }
        }
      }
    }
  }
  
  if (result.sourceUrl) {
    const url = result.sourceUrl.toLowerCase();
    
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
    
    if (url.includes('.edu') || 
        url.includes('academic') || 
        url.includes('university')) {
      score += 2;
    }
    
    if (url.includes('business') ||
        url.includes('enterprise') ||
        url.includes('company') ||
        url.includes('corporate') ||
        url.includes('professional')) {
      score += 2;
    }
  }
  
  if (result.title && result.tags && result.tags.length > 0) {
    score += 1;
  }
  
  return score;
}

export function getSearchSuggestions(query: string): string[] {
  if (!query.trim() || query.length < 2) {
    return getExampleSearches();
  }
  
  const lowercaseQuery = query.toLowerCase();
  
  const contentTypes = [
    "circuit diagram", "network topology diagram", "UML class diagram", "system architecture",
    "database schema", "entity relationship diagram", "state machine diagram", 
    "flow chart", "sequence diagram", "activity diagram", "electrical wiring",
    "hydraulic system diagram", "pneumatic system diagram", "mechanical assembly drawing",
    "blueprint drawing", "p&id diagram", "API flow diagram",
    
    "cell structure diagram", "dna replication diagram", "photosynthesis process diagram", "human anatomy diagram",
    "molecular structure diagram", "chemical reaction diagram", "periodic table diagram", "geological formation diagram",
    "atomic structure diagram", "electromagnetic spectrum diagram", "orbital diagram diagram", "vector field diagram",
    "ecosystem diagram", "climate system diagram", "food web diagram", "phylogenetic tree diagram",
    
    "business process model diagram", "organization chart diagram", "swot analysis diagram", "marketing funnel diagram",
    "customer journey map diagram", "supply chain diagram", "decision tree diagram", "mind map diagram",
    "fishbone diagram", "concept map diagram", "process flow diagram", "data flow diagram",
    "service blueprint diagram", "value stream mapping diagram", "kanban board diagram",
    
    "data structure visualization diagram", "algorithm flowchart diagram", "sorting algorithm diagram",
    "binary tree diagram", "network diagram diagram", "cpu architecture diagram", "memory hierarchy diagram",
    "operating system diagram", "computer architecture diagram", "compiler design diagram", "database model diagram",
    
    "force diagram", "free body diagram", "wave interference diagram", "projectile motion diagram",
    "electric circuit diagram", "electromagnetic field diagram", "quantum mechanics diagram", "relativity diagram",
    "matrix transformation diagram", "vector calculus diagram", "differential equations diagram", "probability distribution diagram",
    
    "cellular respiration diagram", "protein synthesis diagram", "genome mapping diagram", "nervous system diagram",
    "circulatory system diagram", "immune response diagram", "mitosis process diagram", "meiosis stages diagram",
    "plant anatomy diagram", "animal taxonomy diagram", "brain structure diagram", "digestive system diagram",
    
    "chemical bonding diagram", "organic molecules diagram", "reaction mechanism diagram", "titration curve diagram",
    "phase diagram diagram", "crystal structure diagram", "electron configuration diagram", "carbon cycle diagram",
    
    "network diagram", "infrastructure architecture diagram", "plant layout diagram", "floor plan diagram",
    "city map diagram", "subway map diagram", "user flow diagram", "information architecture diagram",
    "genealogy tree diagram", "timeline diagram", "sankey diagram diagram", "voronoi diagram diagram",
    "treemap diagram", "heat map diagram", "choropleth map diagram", "venn diagram diagram"
  ];
  
  let matchingSuggestions = contentTypes.filter(term => 
    term.includes(lowercaseQuery) || 
    lowercaseQuery.includes(term.substring(0, Math.min(term.length, 5)))
  );
  
  if (matchingSuggestions.length < 3 && query.length >= 3) {
    const queryWords = lowercaseQuery.split(/\s+/);
    
    const relatedSuggestions = contentTypes.filter(term => {
      return queryWords.some(word => 
        word.length >= 3 && term.includes(word) && !matchingSuggestions.includes(term)
      );
    });
    
    matchingSuggestions = [...matchingSuggestions, ...relatedSuggestions];
  }
  
  const sortedSuggestions = matchingSuggestions
    .sort((a, b) => {
      if (a.toLowerCase() === lowercaseQuery) return -1;
      if (b.toLowerCase() === lowercaseQuery) return 1;
      
      if (a.toLowerCase().startsWith(lowercaseQuery) && !b.toLowerCase().startsWith(lowercaseQuery)) return -1;
      if (!a.toLowerCase().startsWith(lowercaseQuery) && b.toLowerCase().startsWith(lowercaseQuery)) return 1;
      
      const aContainsExact = a.toLowerCase().split(/\s+/).includes(lowercaseQuery);
      const bContainsExact = b.toLowerCase().split(/\s+/).includes(lowercaseQuery);
      if (aContainsExact && !bContainsExact) return -1;
      if (!aContainsExact && bContainsExact) return 1;
      
      const aRelevance = lowercaseQuery.length / a.length;
      const bRelevance = lowercaseQuery.length / b.length;
      if (aRelevance > bRelevance) return -1;
      if (aRelevance < bRelevance) return 1;
      
      return a.localeCompare(b);
    });
  
  return Array.from(new Set(sortedSuggestions)).slice(0, 10);
}

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
  
  const examples: string[] = [];
  for (const category of Object.values(categories)) {
    const numToSelect = Math.floor(Math.random() * 2) + 2;
    const selectedIndices = new Set<number>();
    
    while (selectedIndices.size < numToSelect && selectedIndices.size < category.length) {
      const randomIndex = Math.floor(Math.random() * category.length);
      selectedIndices.add(randomIndex);
    }
    
    for (const index of selectedIndices) {
      examples.push(category[index]);
    }
  }
  
  return examples.sort(() => Math.random() - 0.5).slice(0, 18);
}

/**
 * Fetches additional educational resources based on the search query
 */
export async function findAdditionalResources(query: string): Promise<ResourceItem[]> {
  console.log("Finding additional resources for:", query);
  
  try {
    // Use the Gemini AI to find relevant resources
    const resources = await generateRelatedResources(query);
    return resources;
  } catch (error) {
    console.error("Error finding additional resources:", error);
    return [];
  }
}

function generateRelatedResources(query: string): Promise<ResourceItem[]> {
  const searchTermLower = query.toLowerCase();
  
  let category = "";
  
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
    category = "general";
  }
  
  switch(category) {
    case "computer-science":
      return Promise.resolve([
        {
          title: "Data Structures & Algorithms",
          url: "https://www.geeksforgeeks.org/data-structures/",
          source: "GeeksforGeeks",
          type: "course"
        },
        {
          title: "Computer Science Curriculum",
          url: "https://www.khanacademy.org/computing/computer-science",
          source: "Khan Academy",
          type: "video"
        },
        {
          title: "UML Diagram Tutorial",
          url: "https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-uml/",
          source: "Visual Paradigm",
          type: "article"
        },
        {
          title: "Database Design",
          url: "https://www.lucidchart.com/pages/database-diagram/database-design",
          source: "Lucidchart",
          type: "resource"
        }
      ]);
    case "physics":
      return Promise.resolve([
        {
          title: "Physics Courses",
          url: "https://www.khanacademy.org/science/physics",
          source: "Khan Academy",
          type: "video"
        },
        {
          title: "Physics Classroom",
          url: "https://www.physicsclassroom.com/",
          source: "The Physics Classroom",
          type: "article"
        },
        {
          title: "MIT OpenCourseWare Physics",
          url: "https://ocw.mit.edu/courses/physics/",
          source: "MIT",
          type: "course"
        },
        {
          title: "HyperPhysics Concepts",
          url: "http://hyperphysics.phy-astr.gsu.edu/hbase/index.html",
          source: "Georgia State University",
          type: "resource"
        }
      ]);
    case "biology":
      return Promise.resolve([
        {
          title: "Biology Library",
          url: "https://www.khanacademy.org/science/biology",
          source: "Khan Academy",
          type: "video"
        },
        {
          title: "Biology Courses",
          url: "https://www.coursera.org/browse/life-sciences/biology",
          source: "Coursera",
          type: "course"
        },
        {
          title: "Interactive Biology",
          url: "https://www.cellsalive.com/",
          source: "Cells Alive",
          type: "resource"
        },
        {
          title: "Human Anatomy Atlas",
          url: "https://www.visiblebody.com/",
          source: "Visible Body",
          type: "resource"
        }
      ]);
    case "chemistry":
      return Promise.resolve([
        {
          title: "Chemistry Library",
          url: "https://www.khanacademy.org/science/chemistry",
          source: "Khan Academy",
          type: "video"
        },
        {
          title: "Chemistry Guides",
          url: "https://chem.libretexts.org/",
          source: "LibreTexts",
          type: "article"
        },
        {
          title: "Chemistry Courses",
          url: "https://www.edx.org/learn/chemistry",
          source: "edX",
          type: "course"
        },
        {
          title: "Organic Chemistry Animations",
          url: "https://www.chemtube3d.com/",
          source: "ChemTube3D",
          type: "resource"
        }
      ]);
    case "mathematics":
      return Promise.resolve([
        {
          title: "Mathematics Library",
          url: "https://www.khanacademy.org/math",
          source: "Khan Academy",
          type: "video"
        },
        {
          title: "Interactive Mathematics",
          url: "https://www.desmos.com/",
          source: "Desmos",
          type: "resource"
        },
        {
          title: "Mathematics Courses",
          url: "https://www.coursera.org/browse/math-and-logic",
          source: "Coursera",
          type: "course"
        },
        {
          title: "Mathematics Reference",
          url: "https://mathworld.wolfram.com/",
          source: "Wolfram MathWorld",
          type: "article"
        }
      ]);
    case "business":
      return Promise.resolve([
        {
          title: "Business Process Modeling",
          url: "https://www.lucidchart.com/pages/business-process-modeling",
          source: "Lucidchart",
          type: "article"
        },
        {
          title: "Economics Courses",
          url: "https://www.khanacademy.org/economics-finance-domain",
          source: "Khan Academy",
          type: "video"
        },
        {
          title: "Business Management",
          url: "https://www.coursera.org/browse/business/business-strategy",
          source: "Coursera",
          type: "course"
        },
        {
          title: "Flowchart Maker",
          url: "https://www.diagrams.net/",
          source: "Diagrams.net",
          type: "resource"
        }
      ]);
    default:
      return Promise.resolve([
        {
          title: "Academic Resources",
          url: "https://www.khanacademy.org/",
          source: "Khan Academy",
          type: "video"
        },
        {
          title: "Free Online Courses",
          url: "https://www.coursera.org/",
          source: "Coursera",
          type: "course"
        },
        {
          title: "Interactive Learning",
          url: "https://www.edx.org/",
          source: "edX",
          type: "course"
        },
        {
          title: "Visual Learning Tools",
          url: "https://www.lucidchart.com/",
          source: "Lucidchart",
          type: "resource"
        }
      ]);
  }
}
