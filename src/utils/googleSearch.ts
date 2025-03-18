
import { DiagramResult } from "@/hooks/use-infinite-search";

export async function searchGoogleImages(
  query: string,
  apiKey = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4",
  searchEngineId = "260090575ae504419",
  page = 1
): Promise<DiagramResult[]> {
  try {
    console.log(`Fetching diagrams for: "${query}" (Page ${page})`);
    
    // Add diagram-specific terms to improve search quality
    const enhancedQuery = `${query} diagram visualization infographic schema`;
    
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(enhancedQuery)}&searchType=image&num=10&start=${startIndex}&safe=active&imgSize=large`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Google API error: ${response.status} - ${await response.text()}`);
      throw new Error(`Failed to fetch from Google API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Fallback to sample data if the API has no items (useful for development or if API quota is exhausted)
    if (!data.items || data.items.length === 0) {
      console.log("No results found from API, using alternative search");
      return getAlternativeSearchResults(query, page);
    }
    
    return data.items.map((item: any, index: number) => ({
      id: `${new Date().getTime()}-${page}-${index}`,
      title: item.title || `${query} diagram ${page}.${index + 1}`,
      imageSrc: item.link,
      author: item.displayLink || "",
      authorUsername: "",
      tags: generateTags(item.title, query),
      sourceUrl: item.image?.contextLink || "",
      isGenerated: false
    }));
  } catch (error) {
    console.error("Error searching Google Images:", error);
    
    // If API fails, still show some results by using the alternative function
    console.log("Performing alternative search for:", query);
    return getAlternativeSearchResults(query, page);
  }
}

// Helper function to generate relevant tags from the title and query
function generateTags(title: string, query: string): string[] {
  const tags: string[] = [];
  
  // Add query terms as tags
  const queryTerms = query.toLowerCase().split(' ')
    .filter(term => term.length > 3)
    .slice(0, 3);
  
  tags.push(...queryTerms);
  
  // Extract potential tags from title
  const titleWords = title?.toLowerCase()
    ?.replace(/[^\w\s]/g, '')
    ?.split(' ')
    ?.filter(word => word.length > 3 && !queryTerms.includes(word))
    ?.slice(0, 5) || [];
  
  tags.push(...titleWords);
  
  // Add common diagram type tags if they appear in title
  const diagramTypes = ['flowchart', 'sequence', 'entity', 'class', 'uml', 'er', 'data', 'process', 'network', 'architecture'];
  
  if (title) {
    diagramTypes.forEach(type => {
      if (title.toLowerCase().includes(type) && !tags.includes(type)) {
        tags.push(type);
      }
    });
  }
  
  // Return unique tags
  return Array.from(new Set(tags)).slice(0, 8);
}

// Function to generate alternative search results when the API fails or has no results
function getAlternativeSearchResults(query: string, page: number): DiagramResult[] {
  // Sample diagram images to use when the API is not available
  const sampleDiagrams = [
    "/lovable-uploads/a837a9a5-a83f-42b8-835c-261565ed609f.png",
    "/lovable-uploads/e0a024c4-b883-4cfa-a811-67a922e06849.png",
    "/lovable-uploads/5aa6a42f-771c-4e89-a3ba-e58ff53c701e.png",
    "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/examples/networkdiagram.svg",
    "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/discovery-page/UML-class-diagram/UML-class-diagram-example.png",
    "https://www.edrawsoft.com/templates/images/bank-system-class-diagram.png",
    "https://www.edrawsoft.com/templates/images/software-engineering-uml.png",
    "https://www.edrawsoft.com/templates/images/erd-examples.png",
    "https://www.edrawsoft.com/templates/images/database-design-diagram.png",
    "https://www.conceptdraw.com/solution-park/resource/images/solutions/entity-relationship-diagram/Entity-Relationship-Diagram-Entity-Relationship-Diagram-IDEF1X.png"
  ];
  
  // Generate mock results
  return Array(10).fill(null).map((_, index) => {
    const id = `alt-${new Date().getTime()}-${page}-${index}`;
    const imageIndex = (index + ((page - 1) * 10)) % sampleDiagrams.length;
    const tags = generateTags(`${query} diagram visualization chart`, query);
    
    return {
      id,
      title: `${query.charAt(0).toUpperCase() + query.slice(1)} Diagram - Example ${page}.${index + 1}`,
      imageSrc: sampleDiagrams[imageIndex],
      author: "Diagram Example",
      authorUsername: "diagramexample",
      tags,
      sourceUrl: "#",
      isGenerated: false
    };
  });
}
