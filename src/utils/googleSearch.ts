
import { DiagramResult } from "@/hooks/use-infinite-search";

// Cache for search results
const searchCache = new Map<string, DiagramResult[]>();

// Fallback diagrams repository - especially for data structures
const diagramRepositories = {
  "uml": [
    {
      id: "uml-1",
      title: "UML Class Diagram Example",
      imageSrc: "/lovable-uploads/7950c6cb-34b4-4e5f-b4da-a9a7d68d9d1d.png",
      author: "Diagramr Team",
      authorUsername: "diagramr_official",
      tags: ["uml", "class diagram", "software engineering", "object oriented"],
      sourceUrl: "https://www.uml-diagrams.org/class-diagrams.html",
      isGenerated: false
    },
    // ... more UML diagrams
  ],
  "database": [
    {
      id: "db-1",
      title: "ER Diagram - Database Schema Design",
      imageSrc: "/lovable-uploads/4de5a600-5de6-4ff0-a535-1b409d5c2393.png",
      author: "Database Experts",
      authorUsername: "db_experts",
      tags: ["database", "er diagram", "schema", "relational"],
      sourceUrl: "https://www.lucidchart.com/pages/er-diagrams",
      isGenerated: false
    },
    // ... more database diagrams
  ],
  "data_structures": [
    {
      id: "ds-1",
      title: "Common Data Structures Visualization",
      imageSrc: "/lovable-uploads/6fded565-6442-486f-9eea-5259f0fe2811.png", 
      author: "CS Education Team",
      authorUsername: "cs_education",
      tags: ["data structures", "algorithms", "computer science", "education"],
      sourceUrl: "https://visualgo.net/en",
      isGenerated: false
    },
    {
      id: "ds-2",
      title: "Array vs Linked List Comparison Diagram",
      imageSrc: "/lovable-uploads/a837a9a5-a83f-42b8-835c-261565ed609f.png", 
      author: "Algorithm Visualizer",
      authorUsername: "algo_viz",
      tags: ["arrays", "linked lists", "data structures", "comparison"],
      sourceUrl: "https://www.geeksforgeeks.org/data-structures/",
      isGenerated: false
    },
    {
      id: "ds-3",
      title: "Binary Search Tree Operations Diagram",
      imageSrc: "/lovable-uploads/e0a024c4-b883-4cfa-a811-67a922e06849.png", 
      author: "CS Academy",
      authorUsername: "cs_academy",
      tags: ["binary tree", "bst", "tree traversal", "data structures"],
      sourceUrl: "https://www.programiz.com/dsa/binary-search-tree",
      isGenerated: false
    },
    {
      id: "ds-4",
      title: "Hash Table Implementation Visualization",
      imageSrc: "/lovable-uploads/ec798833-9785-43fd-9962-8c826d437f27.png", 
      author: "Algorithm Expert",
      authorUsername: "algo_expert",
      tags: ["hash table", "hashing", "data structures", "collision resolution"],
      sourceUrl: "https://www.hackerearth.com/practice/data-structures/hash-tables/basics-of-hash-tables/tutorial/",
      isGenerated: false
    },
    {
      id: "ds-5",
      title: "Sorting Algorithms Visualization",
      imageSrc: "/lovable-uploads/7950c6cb-34b4-4e5f-b4da-a9a7d68d9d1d.png",
      author: "Algorithm Academy",
      authorUsername: "algo_academy",
      tags: ["sorting", "algorithms", "comparison", "data structures", "educational"],
      sourceUrl: "https://www.geeksforgeeks.org/sorting-algorithms/",
      isGenerated: false
    },
    {
      id: "ds-6",
      title: "Graph Data Structure Representation",
      imageSrc: "/lovable-uploads/ade8aaaa-293a-4a73-bf2d-2490956a1578.png",
      author: "CS Visualizer",
      authorUsername: "cs_visualizer",
      tags: ["graph", "data structures", "adjacency list", "adjacency matrix", "educational"],
      sourceUrl: "https://www.programiz.com/dsa/graph",
      isGenerated: false
    }
  ],
  "network": [
    {
      id: "network-1",
      title: "Network Topology Diagram - Enterprise Infrastructure",
      imageSrc: "/lovable-uploads/00280548-0e69-4df9-9d87-4dfdca65bb09.png",
      author: "Network Professionals",
      authorUsername: "network_pro",
      tags: ["network", "topology", "infrastructure", "cisco"],
      sourceUrl: "https://www.cisco.com/c/en/us/products/cloud-systems-management/network-topology-services/index.html",
      isGenerated: false
    },
    // ... more network diagrams
  ],
  "architecture": [
    {
      id: "arch-1",
      title: "Microservices Architecture Diagram",
      imageSrc: "/lovable-uploads/ade8aaaa-293a-4a73-bf2d-2490956a1578.png",
      author: "Software Architects",
      authorUsername: "sw_architects",
      tags: ["architecture", "microservices", "system design", "cloud"],
      sourceUrl: "https://microservices.io/patterns/index.html",
      isGenerated: false
    },
    // ... more architecture diagrams
  ],
  "default": [
    {
      id: "default-1",
      title: "System Design Overview Diagram",
      imageSrc: "/lovable-uploads/6fded565-6442-486f-9eea-5259f0fe2811.png", 
      author: "Diagramr Team",
      authorUsername: "diagramr_official",
      tags: ["system design", "architecture", "overview", "diagram"],
      sourceUrl: "https://www.diagramr.com/samples",
      isGenerated: false
    },
    // ... more default diagrams
  ]
};

// Helper function to get the most relevant diagram category for a query
function getDiagramCategory(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("data structure") || 
      lowerQuery.includes("algorithm") || 
      lowerQuery.includes("dsa") ||
      lowerQuery.includes("tree") ||
      lowerQuery.includes("graph") ||
      lowerQuery.includes("array") ||
      lowerQuery.includes("linked list") ||
      lowerQuery.includes("stack") ||
      lowerQuery.includes("queue") ||
      lowerQuery.includes("hash") ||
      lowerQuery.includes("sorting")) {
    return "data_structures";
  } else if (lowerQuery.includes("uml") || 
      lowerQuery.includes("class diagram") || 
      lowerQuery.includes("sequence diagram")) {
    return "uml";
  } else if (lowerQuery.includes("database") || 
             lowerQuery.includes("er diagram") || 
             lowerQuery.includes("entity relationship")) {
    return "database";
  } else if (lowerQuery.includes("network") || 
             lowerQuery.includes("topology") || 
             lowerQuery.includes("infrastructure")) {
    return "network";
  } else if (lowerQuery.includes("architecture") || 
             lowerQuery.includes("system design") || 
             lowerQuery.includes("microservices")) {
    return "architecture";
  } else {
    return "default";
  }
}

// Function to search Google Custom Search Engine for diagram images
export async function searchGoogleImages(
  query: string,
  apiKey: string = "AIzaSyA1zArEu4m9HzEh-CO2Y7oFw0z_E_cFPsg", // Updated API key
  searchId: string = "260090575ae504419",
  page: number = 1
): Promise<DiagramResult[]> {
  try {
    console.log('[GoogleSearch] Searching for', `"${query}"`, `(Page ${page})`);
    
    // Special enhancements for data structure queries
    let enhancedQuery = query;
    if (query.toLowerCase().includes('data structure') || 
        query.toLowerCase().includes('algorithm') || 
        query.toLowerCase().includes('dsa')) {
      enhancedQuery = `${query} computer science educational diagram visualization for students learning`;
    } else {
      // For regular queries, enhance for educational diagrams
      enhancedQuery = `${query} educational diagram visualization infographic for students learning`;
    }
    
    // Calculate start index (1-based for Google API)
    const startIndex = (page - 1) * 10 + 1;
    
    // Build request URL
    const params = new URLSearchParams({
      key: apiKey,
      cx: searchId,
      q: enhancedQuery,
      searchType: 'image',
      num: '10',
      start: startIndex.toString(),
      safe: 'active',
      imgSize: 'large',
      imgType: 'clipart', // Better for diagram results
      rights: 'cc_publicdomain,cc_attribute,cc_sharealike',
      fileType: 'jpg,png,svg',
      filter: '0' // Turn off duplicate content filter to get more results
    });
    
    const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
    console.log('[GoogleSearch] Sending request to Google CSE API:', url);
    
    const response = await fetch(url);
    console.log('[GoogleSearch] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[GoogleSearch] API error', `(${response.status})`, ':', errorData);
      throw new Error(`Google API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      console.warn('[GoogleSearch] No items returned from Google CSE API');
      // Fall back to repository
      console.log('[GoogleSearch] Falling back to diagram repository');
      return fallbackToDiagramRepository(query, page);
    }
    
    // Map API response to DiagramResult format
    const results: DiagramResult[] = data.items.map((item: any, index: number) => {
      const displayLink = item.displayLink || '';
      const authorMatch = item.title?.match(/by\s+([^-|,]+)/i);
      const domainParts = displayLink.split('.');
      const domain = domainParts.length > 1 ? 
                    domainParts[domainParts.length - 2] : displayLink;
      
      const author = authorMatch ? 
                    authorMatch[1].trim() : 
                    domain.charAt(0).toUpperCase() + domain.slice(1);
                  
      // Extract tags from title and query
      const queryTags = query.toLowerCase().split(/[\s-]+/)
                      .filter((word: string) => word.length > 3)
                      .map((word: string) => word.toLowerCase());
                      
      const titleTags = item.title?.split(/[\s-]+/)
                      .filter((word: string) => word.length > 3)
                      .map((word: string) => word.toLowerCase())
                      .slice(0, 5) || [];
                  
      // Combine and deduplicate tags
      const allTags = [...new Set([...queryTags, ...titleTags])];
      
      // Make sure we have educational and diagram-related tags
      const diagramTags = ['diagram', 'chart', 'visualization', 'architecture', 'model', 'schema'];
      const educationalTags = ['educational', 'learning', 'student', 'academic', 'study'];
      
      const hasDiagramTag = allTags.some(tag => 
        diagramTags.some(dTag => tag.includes(dTag))
      );
      
      if (!hasDiagramTag) {
        allTags.push('diagram');
      }
      
      // Add educational tag
      if (!allTags.some(tag => educationalTags.some(eTag => tag.includes(eTag)))) {
        allTags.push('educational');
      }
      
      // For data structure queries, add related tags
      if (query.toLowerCase().includes('data structure') || 
          query.toLowerCase().includes('algorithm') || 
          query.toLowerCase().includes('dsa')) {
        if (!allTags.includes('data structure')) {
          allTags.push('data structure');
        }
        if (!allTags.includes('computer science')) {
          allTags.push('computer science');
        }
      }
      
      return {
        id: `google-${page}-${index}-${Date.now()}`,
        title: item.title || `Educational ${query.charAt(0).toUpperCase() + query.slice(1)} Diagram`,
        imageSrc: item.link,
        sourceUrl: item.image?.contextLink || item.link,
        author: author || "Educational Resources",
        authorUsername: author ? author.toLowerCase().replace(/\s+/g, '_') : "educational_resources",
        tags: allTags.slice(0, 8), // Limit to 8 tags
        isGenerated: false
      };
    });
    
    // Filter for likely educational diagram images
    const filteredResults = results.filter(result => {
      // Eliminate images that are unlikely to be educational diagrams
      const nonDiagramKeywords = [
        'photo', 'picture', 'image of person', 'thumbnail', 'stock photo',
        'portrait', 'landscape', 'photograph'
      ];
      
      // Check if title suggests this is not a diagram
      const isLikelyNotDiagram = nonDiagramKeywords.some(keyword => 
        result.title.toLowerCase().includes(keyword)
      );
      
      if (isLikelyNotDiagram) {
        return false;
      }
      
      // It should be a diagram
      return true;
    });
    
    console.log(`[GoogleSearch] Found ${filteredResults.length} results for "${query}"`);
    
    if (filteredResults.length === 0) {
      // Fall back to diagram repository
      console.log('[GoogleSearch] No filtered results, falling back to diagram repository');
      return fallbackToDiagramRepository(query, page);
    }
    
    return filteredResults;
  } catch (error) {
    console.error('[GoogleSearch] Error:', error);
    
    // Fall back to diagram repository
    console.log('[GoogleSearch] Falling back to diagram repository');
    return fallbackToDiagramRepository(query, page);
  }
}

// Function to provide fallback diagram results when the API fails
function fallbackToDiagramRepository(query: string, page: number): DiagramResult[] {
  console.log('[DiagramRepository] Generating relevant diagrams for:', `"${query}"`, `(page ${page})`);
  
  // Determine the best diagrams to show based on the query
  const category = getDiagramCategory(query);
  console.log('[DiagramRepository] Selected', category, 'diagrams');
  
  // Get the base diagrams for this category
  const diagramsForCategory = diagramRepositories[category] || diagramRepositories.default;
  
  // Calculate which diagrams to return based on the page number (10 per page)
  const itemsPerPage = 10;
  const startIdx = (page - 1) * itemsPerPage % diagramsForCategory.length;
  
  // Get a slice of diagrams, potentially wrapping around the array
  let diagrams = [];
  for (let i = 0; i < itemsPerPage; i++) {
    const idx = (startIdx + i) % diagramsForCategory.length;
    diagrams.push({
      ...diagramsForCategory[idx],
      id: `${diagramsForCategory[idx].id}-${page}-${i}`
    });
  }
  
  // Further customize the returned diagrams based on the query
  diagrams = diagrams.map(diagram => {
    // Add the query terms as additional tags
    const queryTerms = query.toLowerCase().split(/\s+/)
      .filter(term => term.length > 3)
      .filter(term => !diagram.tags.includes(term));
    
    // Add educational tags
    const educationalTags = ['educational', 'learning', 'student'];
    const missingEduTags = educationalTags.filter(tag => !diagram.tags.includes(tag));
    
    return {
      ...diagram,
      tags: [...diagram.tags, ...queryTerms, ...missingEduTags].slice(0, 8)
    };
  });
  
  console.log('[DiagramRepository] Returning', diagrams.length, 'diagrams for page', page);
  return diagrams;
}
