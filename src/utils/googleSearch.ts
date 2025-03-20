import { DiagramResult } from "@/hooks/use-infinite-search";

// Cache for search results
const searchCache = new Map<string, DiagramResult[]>();

// Fallback diagrams repository
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
  
  if (lowerQuery.includes("uml") || 
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
  apiKey: string = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4",
  searchId: string = "260090575ae504419",
  page: number = 1
): Promise<DiagramResult[]> {
  // Check cache first
  const cacheKey = `${query}:page-${page}`;
  if (searchCache.has(cacheKey)) {
    console.log('Using cached search results for:', query, 'page', page);
    return searchCache.get(cacheKey) || [];
  }

  try {
    console.log('[GoogleSearch] Searching for', `"${query}"`, `(Page ${page})`);
    
    // Enhance query for better diagram results
    const enhancedQuery = `${query} diagram visualization infographic schema high quality professional educational`;
    
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
      imgType: 'clipart', // Updated to fix the API error
      rights: 'cc_publicdomain,cc_attribute,cc_sharealike',
      fileType: 'jpg,png,svg'
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
                  
      // Extract tags from title
      const tags = item.title?.split(/[\s-]+/)
                  .filter((word: string) => word.length > 3)
                  .map((word: string) => word.toLowerCase())
                  .slice(0, 5) || [];
                  
      // Make sure we have diagram-related tags
      const diagramTags = ['diagram', 'chart', 'visualization', 'architecture', 'model', 'schema'];
      const hasDiagramTag = tags.some(tag => 
        diagramTags.some(dTag => tag.includes(dTag))
      );
      
      if (!hasDiagramTag && diagramTags.some(dt => 
        item.title?.toLowerCase().includes(dt))) {
        tags.push('diagram');
      }
      
      return {
        id: `google-${page}-${index}-${Date.now()}`,
        title: item.title || "Untitled Diagram",
        imageSrc: item.link,
        sourceUrl: item.image?.contextLink || item.link,
        author: author || "Unknown",
        authorUsername: author ? author.toLowerCase().replace(/\s+/g, '_') : "unknown",
        tags,
        isGenerated: false
      };
    });
    
    // Filter for likely diagram images
    const filteredResults = results.filter(result => {
      // Eliminate images that are unlikely to be diagrams
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
    
    // Cache the results
    searchCache.set(cacheKey, filteredResults);
    
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
  
  // Calculate which diagrams to return based on the page number (7 per page)
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
    
    return {
      ...diagram,
      tags: [...diagram.tags, ...queryTerms]
    };
  });
  
  // Cache these results too
  const cacheKey = `${query}:page-${page}`;
  searchCache.set(cacheKey, diagrams);
  
  console.log('[DiagramRepository] Returning', diagrams.length, 'diagrams for page', page);
  return diagrams;
}
