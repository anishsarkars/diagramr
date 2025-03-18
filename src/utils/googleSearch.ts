
import { DiagramResult } from "@/hooks/use-infinite-search";
import { toast } from "sonner";

export async function searchGoogleImages(
  query: string,
  apiKey = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4",
  searchEngineId = "260090575ae504419",
  page = 1
): Promise<DiagramResult[]> {
  try {
    console.log(`Fetching diagrams for: "${query}" (Page ${page})`);
    
    // Add diagram-specific terms to improve search quality
    const enhancedQuery = `${query} diagram visualization infographic schema high quality professional`;
    
    const startIndex = (page - 1) * 10 + 1;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(enhancedQuery)}&searchType=image&num=10&start=${startIndex}&safe=active&imgSize=large&imgType=photo,clipart,lineart,stock&rights=cc_publicdomain,cc_attribute,cc_sharealike`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        // Log error details for debugging
        console.error("Google API error status:", response.status);
        const errorText = await response.text();
        console.error("Google API error response:", errorText);
        
        if (response.status === 429) {
          toast.error("Search limit exceeded. Using alternative results.");
          console.log("Google API quota exceeded, using alternative search results");
          return getAlternativeSearchResults(query, page);
        }
        throw new Error(`Failed to fetch from Google API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Log search results for debugging
      console.log("Google API response:", data);
      
      // Fallback to sample data if the API has no items
      if (!data.items || data.items.length === 0) {
        console.log("No results found from API, using alternative search");
        toast.info("No search results found, showing similar diagrams");
        return getAlternativeSearchResults(query, page);
      }
      
      return data.items.map((item: any, index: number) => ({
        id: `${new Date().getTime()}-${page}-${index}`,
        title: item.title || `Diagram: ${query}`,
        imageSrc: item.link,
        author: item.displayLink || "Source",
        authorUsername: "",
        tags: generateTags(item.title || query, query),
        sourceUrl: item.image?.contextLink || "",
        isGenerated: false
      }));
    } catch (error) {
      console.error("Google API search failed:", error);
      toast.error("Search failed. Showing alternative results.");
      return getAlternativeSearchResults(query, page);
    }
  } catch (error) {
    console.error("Error searching Google Images:", error);
    toast.error("Search error. Showing alternative results.");
    
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
  const titleWords = title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3 && !queryTerms.includes(word))
    .slice(0, 5);
  
  tags.push(...titleWords);
  
  // Add common diagram type tags if they appear in title
  const diagramTypes = ['flowchart', 'sequence', 'entity', 'class', 'uml', 'er', 'data', 'process', 'network', 'architecture'];
  
  diagramTypes.forEach(type => {
    if (title.toLowerCase().includes(type) && !tags.includes(type)) {
      tags.push(type);
    }
  });
  
  // Return unique tags
  return Array.from(new Set(tags)).slice(0, 8);
}

// Function to generate alternative search results with high-quality diagram images
function getAlternativeSearchResults(query: string, page: number): DiagramResult[] {
  // Enhanced curated list of high-quality diagram images for common query types
  const diagramImageSets: Record<string, string[]> = {
    network: [
      "/lovable-uploads/5aa6a42f-771c-4e89-a3ba-e58ff53c701e.png",
      "/lovable-uploads/e0a024c4-b883-4cfa-a811-67a922e06849.png",
      "/lovable-uploads/a6ccf758-c406-414d-8f2e-e5e6d69439ff.png",
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/examples/networkdiagram.svg"
    ],
    flowchart: [
      "/lovable-uploads/a837a9a5-a83f-42b8-835c-261565ed609f.png",
      "/lovable-uploads/ca791211-179d-415b-87a8-97ea4fcfa0cd.png",
      "/lovable-uploads/29c6874b-2503-4a4a-ac77-228929a96128.png",
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/flowchart-examples/hiring-process-flowchart.svg"
    ],
    sequence: [
      "/lovable-uploads/e0a024c4-b883-4cfa-a811-67a922e06849.png",
      "/lovable-uploads/1fcd5d05-8fe4-4a85-a06e-0797163cce27.png",
      "/lovable-uploads/ca791211-179d-415b-87a8-97ea4fcfa0cd.png",
      "https://www.uml-diagrams.org/sequence-diagrams/sequence-diagram-example.png"
    ],
    uml: [
      "/lovable-uploads/ca791211-179d-415b-87a8-97ea4fcfa0cd.png",
      "/lovable-uploads/a6ccf758-c406-414d-8f2e-e5e6d69439ff.png",
      "/lovable-uploads/14b933d8-4bc5-478d-a61d-0f37bd0404b1.png",
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/discovery-page/UML-class-diagram/UML-class-diagram-example.png"
    ],
    architecture: [
      "/lovable-uploads/d13f2dfc-b974-424f-83a2-a060b3a74cb5.png",
      "/lovable-uploads/00280548-0e69-4df9-9d87-4dfdca65bb09.png",
      "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/blog/2018Q4/system-architecture/system-architecture-diagram.png"
    ],
    er: [
      "/lovable-uploads/ec798833-9785-43fd-9962-8c826d437f27.png",
      "/lovable-uploads/29c6874b-2503-4a4a-ac77-228929a96128.png",
      "/lovable-uploads/a6ccf758-c406-414d-8f2e-e5e6d69439ff.png",
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/ER-diagram-tutorial/ER-diagram-tutorial.png"
    ],
    database: [
      "/lovable-uploads/6fded565-6442-486f-9eea-5259f0fe2811.png",
      "/lovable-uploads/ec798833-9785-43fd-9962-8c826d437f27.png",
      "/lovable-uploads/a6ccf758-c406-414d-8f2e-e5e6d69439ff.png",
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/blog/2018Q4/database-diagram-tool/database-diagram.png"
    ],
    data: [
      "/lovable-uploads/6fded565-6442-486f-9eea-5259f0fe2811.png",
      "/lovable-uploads/ec798833-9785-43fd-9962-8c826d437f27.png", 
      "/lovable-uploads/a6ccf758-c406-414d-8f2e-e5e6d69439ff.png",
      "/lovable-uploads/29c6874b-2503-4a4a-ac77-228929a96128.png"
    ]
  };
  
  // Default high-quality diagram images for general queries
  const defaultDiagrams = [
    "/lovable-uploads/5aa6a42f-771c-4e89-a3ba-e58ff53c701e.png",
    "/lovable-uploads/a837a9a5-a83f-42b8-835c-261565ed609f.png",
    "/lovable-uploads/e0a024c4-b883-4cfa-a811-67a922e06849.png",
    "/lovable-uploads/ec798833-9785-43fd-9962-8c826d437f27.png",
    "/lovable-uploads/ca791211-179d-415b-87a8-97ea4fcfa0cd.png",
    "/lovable-uploads/d13f2dfc-b974-424f-83a2-a060b3a74cb5.png",
    "/lovable-uploads/6fded565-6442-486f-9eea-5259f0fe2811.png",
    "/lovable-uploads/a6ccf758-c406-414d-8f2e-e5e6d69439ff.png",
    "/lovable-uploads/29c6874b-2503-4a4a-ac77-228929a96128.png",
    "/lovable-uploads/00280548-0e69-4df9-9d87-4dfdca65bb09.png",
    "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    "/lovable-uploads/14b933d8-4bc5-478d-a61d-0f37bd0404b1.png",
    "/lovable-uploads/1fcd5d05-8fe4-4a85-a06e-0797163cce27.png"
  ];
  
  let imagesToUse: string[] = [];
  
  // Find a matching query type
  const queryLower = query.toLowerCase();
  for (const [key, images] of Object.entries(diagramImageSets)) {
    if (queryLower.includes(key)) {
      imagesToUse = [...images, ...defaultDiagrams];
      break;
    }
  }
  
  // If no specific match, use defaults with page variation
  if (imagesToUse.length === 0) {
    imagesToUse = defaultDiagrams;
  }
  
  // Ensure we have enough results for pagination
  while (imagesToUse.length < 20) {
    imagesToUse = [...imagesToUse, ...defaultDiagrams];
  }
  
  // Calculate starting index based on page
  const startIndex = ((page - 1) % 2) * 10;
  const selectedImages = imagesToUse.slice(startIndex, startIndex + 10);
  
  // Generate mock results with high-quality information
  return selectedImages.map((imageUrl, index) => {
    const id = `alt-${new Date().getTime()}-${page}-${index}`;
    const tags = generateTags(`${query} diagram visualization chart`, query);
    const diagramTypes = ['Flowchart', 'UML Diagram', 'ER Diagram', 'Network Diagram', 
                         'Architecture Diagram', 'Sequence Diagram', 'Process Diagram', 
                         'Class Diagram', 'Activity Diagram', 'Mindmap'];
    
    // Create a descriptive title based on the query
    const titlePrefix = diagramTypes[index % diagramTypes.length];
    const title = `${titlePrefix}: ${query.charAt(0).toUpperCase() + query.slice(1)}`;
    
    return {
      id,
      title,
      imageSrc: imageUrl,
      author: "Diagram Example",
      authorUsername: "diagramexample",
      tags,
      sourceUrl: "#",
      isGenerated: false
    };
  });
}
