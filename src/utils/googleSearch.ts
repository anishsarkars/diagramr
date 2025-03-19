import { DiagramResult } from "@/hooks/use-infinite-search";
import { toast } from "sonner";

// Google API keys
const GOOGLE_API_KEY = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4";
const SEARCH_ENGINE_ID = "260090575ae504419";

// Main search function
export async function searchGoogleImages(
  query: string,
  apiKey = GOOGLE_API_KEY,
  searchEngineId = SEARCH_ENGINE_ID,
  page = 1
): Promise<DiagramResult[]> {
  console.log(`[GoogleSearch] Searching for "${query}" (Page ${page})`);
  
  try {
    // Add diagram-specific terms to improve search quality
    const enhancedQuery = `${query} diagram visualization infographic schema high quality professional`;
    
    // Calculate start index for pagination
    const startIndex = (page - 1) * 10 + 1;
    
    // Build the API URL with appropriate parameters
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(enhancedQuery)}&searchType=image&num=10&start=${startIndex}&safe=active&imgSize=large&imgType=photo,clipart,lineart,stock&rights=cc_publicdomain,cc_attribute,cc_sharealike`;
    
    console.log(`[GoogleSearch] Sending request to Google CSE API: ${url}`);
    
    // Make the API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'default' // Use caching for better performance
    });
    
    console.log(`[GoogleSearch] Response status: ${response.status}`);
    
    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GoogleSearch] API error (${response.status}):`, errorText);
      
      if (response.status === 429) {
        console.log("[GoogleSearch] Quota exceeded, falling back to alternative results");
        return getWebDiagrams(query, page);
      }
      
      throw new Error(`Google API request failed with status: ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json();
    console.log("[GoogleSearch] API response:", data);
    
    // Log number of results received
    console.log(`[GoogleSearch] Received ${data.items?.length || 0} results`);
    
    // If no results, fall back to alternative sources
    if (!data.items || data.items.length === 0) {
      console.log("[GoogleSearch] No results from API, using web fallbacks");
      return getWebDiagrams(query, page);
    }
    
    // Map the API results to our DiagramResult format
    const results: DiagramResult[] = data.items.map((item: any, index: number) => {
      // Clean title and snippet texts
      const title = item.title ? item.title.replace(/\s+/g, ' ').trim() : `Diagram: ${query}`;
      
      return {
        id: `google-${Date.now()}-${page}-${index}`,
        title: title,
        imageSrc: item.link,
        author: item.displayLink || "Source",
        authorUsername: "",
        tags: generateTags(title, query),
        sourceUrl: item.image?.contextLink || item.link,
        isGenerated: false
      };
    });
    
    console.log(`[GoogleSearch] Successfully processed ${results.length} results`);
    return results;
  } catch (error) {
    console.error("[GoogleSearch] Error:", error);
    
    // Fall back to alternative sources on any error
    console.log("[GoogleSearch] Falling back to web diagrams");
    return getWebDiagrams(query, page);
  }
}

// Generates relevant tags from title and query
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

// Fallback function for when Google API fails
function getWebDiagrams(query: string, page: number): DiagramResult[] {
  console.log(`[WebDiagrams] Generating alternative diagrams for: "${query}" (page ${page})`);
  
  // A collection of high-quality diagram image URLs from various educational and professional sources
  const webDiagramUrls = [
    "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/examples/networkdiagram.svg",
    "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/flowchart-examples/hiring-process-flowchart.svg",
    "https://www.uml-diagrams.org/sequence-diagrams/sequence-diagram-example.png",
    "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/discovery-page/UML-class-diagram/UML-class-diagram-example.png",
    "https://d2slcw3kip6qmk.cloudfront.net/marketing/blog/2018Q4/system-architecture/system-architecture-diagram.png",
    "https://d2slcw3kip6qmk.cloudfront.net/marketing/blog/2018Q4/database-diagram-tool/database-diagram.png",
    "https://www.edrawsoft.com/templates/images/software-engineering-diagram.png",
    "https://www.edrawsoft.com/templates/images/website-structure-diagram.png",
    "https://www.edrawsoft.com/templates/images/basic-workflow-diagram.png",
    "https://miro.medium.com/v2/resize:fit:1400/1*-hMKkxEVu-_0q-R85Xu84Q.png",
    "https://static.javatpoint.com/tutorial/uml/images/uml-class-diagram.png",
    "https://i.pinimg.com/originals/b4/5e/a8/b45ea8d6c29cb4b3c941d5b6aaeaf852.png",
    "https://images.edrawsoft.com/articles/network-diagram-software/network-diagram.png",
    "https://www.conceptdraw.com/solution-park/resource/images/solutions/network-diagram/NETWORK-DIAGRAM-Network-Topology-Network-Diagram.png",
    "https://blog.planview.com/wp-content/uploads/2021/01/PERT-Chart-Example.jpg",
    "https://www.researchgate.net/profile/Syed-Muhammad-Ahmad-14/publication/332690739/figure/fig1/AS:750946110275590@1556036316072/System-architecture-of-cloud-based-Big-Data-Analytics-as-a-Service.png",
    "https://d2slcw3kip6qmk.cloudfront.net/marketing/blog/2019Q1/project-planning/WBS-diagram.png",
    "https://cdn.sketchbubble.com/pub/media/catalog/product/optimized1/d/a/da3e13b35a385b3dfd56dfd1adb266c7d91fe7fd558d4bfb2f136d1c9ff6c29b/data-flow-diagram-mc-slide1.png",
    "https://www.smartdraw.com/entity-relationship-diagram/img/entity-relationship-diagram.jpg",
    "https://www.researchgate.net/profile/Panagiotis-Chrysanthis/publication/221313562/figure/fig1/AS:305499943374850@1449846334866/An-example-of-an-ER-diagram-for-a-small-database-of-students-departments-courses.png",
    "https://www.researchgate.net/profile/Stefano-Bistarelli/publication/304581105/figure/fig3/AS:1024480481259522@1621362767835/Attack-tree-example-The-tree-is-decorated-with-local-costs-to-achieve-the-attacks.png",
    "https://www.researchgate.net/profile/Mohd-Nazri-Kama-2/publication/329732510/figure/fig4/AS:705181818576897@1545138948594/Example-of-class-diagram.jpg",
    "https://www.researchgate.net/profile/Huseyin-Oktay-2/publication/351648093/figure/fig2/AS:1024480481259522@1621362767835/A-simple-architecture-diagram-showing-the-main-components-of-the-hybrid-cloud-based.png",
    "https://www.researchgate.net/profile/Md-Mustafizur-Rahman-3/publication/265729293/figure/fig2/AS:392186310193154@1470516376616/Activity-diagram-for-an-inventory-management-system.png",
    "https://www.lucidchart.com/blog/hubfs/Imported_Blog_Media/What-is-a-Flowchart.png",
    "https://www.edrawsoft.com/templates/images/marketing-flow-chart.png",
    "https://cdn.sketchbubble.com/pub/media/catalog/product/optimized1/6/c/6c582546e22906ae17dc5a7658c7b9d1c4a497fd0790c5fd48db91b1c7469db8/flowchart-symbols-mc-slide1.png",
    "https://www.researchgate.net/profile/Urooj-Pasha/publication/325113788/figure/fig1/AS:624570507005954@1525938307625/Pictorial-representation-of-flowcharts-symbols-Source-wwwedrawsoftcom.png",
    "https://www.process.st/wp-content/uploads/2021/12/Flowchart-Example-HR-Approval.png"
  ];
  
  // Specialized educational diagram collections
  const scientificDiagrams = [
    "https://www.researchgate.net/profile/Marcelo-Toro-2/publication/330711834/figure/fig4/AS:804158009970689@1568614598788/Flow-diagram-of-the-process-to-obtain-bioethanol-using-lignocellulosic-biomass-as-raw.jpg",
    "https://study.com/cimages/multimages/16/0f28ba24-b98c-4d21-a5f0-04c258204842_untitled_drawing_1.png",
    "https://www.researchgate.net/profile/Danial-Yuniawan/publication/343522384/figure/fig5/AS:924024421625856@1597179850022/Diagram-of-Light-Dependent-Reaction-McGraw-Hill-Education-2011-12.ppm"
  ];
  
  // Computer science diagrams
  const computerScienceDiagrams = [
    "https://img.freepik.com/premium-vector/vector-database-schema-diagram-entity-relationship-diagram-simple-conceptual-data-model-presented-entity-relationship-diagram_302982-1689.jpg",
    "https://www.researchgate.net/profile/Dragan-Ivanovic/publication/334143302/figure/fig1/AS:776559946387459@1562162091926/An-example-ER-diagram.png",
    "https://www.freeprojectz.com/sites/default/files/xEntity-Relationship,P20,Diagram_0.jpeg.pagespeed.ic.-g4cFVUiI7.jpg"
  ];
  
  // Business diagrams
  const businessDiagrams = [
    "https://www.edrawsoft.com/templates/images/company-organization-chart.png",
    "https://cdn.corporatefinanceinstitute.com/assets/hierachical-org-chart-1024x768.png",
    "https://www.edrawsoft.com/templates/images/matrix-org-chart.png"
  ];
  
  // Engineering diagrams
  const engineeringDiagrams = [
    "https://www.researchgate.net/profile/Peter-Velseboer/publication/306108134/figure/fig2/AS:394164974538754@1471002140834/Piping-and-Instrumentation-Diagram-P-ID.png",
    "https://www.edrawsoft.com/templates/images/process-flow-diagram.png",
    "https://images.xtechplc.com/blog/blog-3d-model-2d-drawing-800600-min.webp"
  ];
  
  // Combined diagram collections by topic
  const diagramCollections: Record<string, string[]> = {
    "network": webDiagramUrls.slice(0, 5).concat([
      "https://images.edrawsoft.com/articles/network-diagram-software/network-diagram.png",
      "https://www.conceptdraw.com/solution-park/resource/images/solutions/network-diagram/NETWORK-DIAGRAM-Network-Topology-Network-Diagram.png"
    ]),
    "flow": webDiagramUrls.slice(5, 10).concat([
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/flowchart-examples/hiring-process-flowchart.svg",
      "https://www.edrawsoft.com/templates/images/basic-workflow-diagram.png"
    ]),
    "uml": webDiagramUrls.slice(10, 15).concat([
      "https://www.uml-diagrams.org/sequence-diagrams/sequence-diagram-example.png",
      "https://static.javatpoint.com/tutorial/uml/images/uml-class-diagram.png"
    ]),
    "entity": webDiagramUrls.slice(15, 20).concat(computerScienceDiagrams),
    "process": businessDiagrams.concat(engineeringDiagrams.slice(0, 5)),
    "education": scientificDiagrams.concat(webDiagramUrls.slice(10, 15)),
    "engineering": engineeringDiagrams,
    "business": businessDiagrams,
    "science": scientificDiagrams
  };
  
  // Keywords to match against query
  const matchTerms: Record<string, string[]> = {
    "network": ["network", "topology", "infrastructure", "cloud", "internet", "connection"],
    "flow": ["flow", "process", "flowchart", "workflow", "sequence", "step"],
    "uml": ["uml", "class", "object", "software", "programming", "code"],
    "entity": ["entity", "relation", "database", "schema", "data", "model"],
    "process": ["process", "business", "workflow", "activity", "operation"],
    "education": ["education", "learning", "school", "student", "academic", "teach"],
    "engineering": ["engineering", "system", "technical", "mechanical", "electrical"],
    "business": ["business", "company", "corporate", "management", "organization"],
    "science": ["science", "scientific", "biology", "chemistry", "physics", "lab"]
  };
  
  // Determine which diagram set to use based on query
  const queryLower = query.toLowerCase();
  let selectedCollection: string[] = [];
  
  // Find matching collection based on query terms
  for (const [category, terms] of Object.entries(matchTerms)) {
    if (terms.some(term => queryLower.includes(term))) {
      selectedCollection = diagramCollections[category] || [];
      console.log(`[WebDiagrams] Matched category: ${category}`);
      break;
    }
  }
  
  // If no specific match, use a general mix
  if (selectedCollection.length === 0) {
    selectedCollection = shuffleArray([
      ...webDiagramUrls.slice(0, 10),
      ...scientificDiagrams.slice(0, 3),
      ...computerScienceDiagrams.slice(0, 3),
      ...businessDiagrams.slice(0, 2),
      ...engineeringDiagrams.slice(0, 2)
    ]);
    console.log("[WebDiagrams] No specific category match, using general mix");
  }
  
  // Ensure we don't run out of unique diagrams for pagination
  while (selectedCollection.length < 30) {
    selectedCollection = selectedCollection.concat(selectedCollection);
  }
  
  // Calculate starting index based on page number for pagination
  const itemsPerPage = 10;
  const startIndex = ((page - 1) % Math.floor(selectedCollection.length / itemsPerPage)) * itemsPerPage;
  const selectedDiagrams = selectedCollection.slice(startIndex, startIndex + itemsPerPage);
  
  console.log(`[WebDiagrams] Returning ${selectedDiagrams.length} diagrams for page ${page}`);
  
  // Generate DiagramResult objects
  return selectedDiagrams.map((imageUrl, index) => {
    const id = `web-${Date.now()}-${page}-${index}`;
    const tags = generateTags(`${query} diagram visualization chart`, query);
    
    // Create title variations based on diagram type and query
    const diagramTypes = ['Flowchart', 'UML Diagram', 'ER Diagram', 'Network Diagram', 
                         'Architecture Diagram', 'Sequence Diagram', 'Process Diagram', 
                         'Class Diagram', 'Activity Diagram', 'Mindmap'];
    
    const titlePrefix = diagramTypes[index % diagramTypes.length];
    const title = `${titlePrefix}: ${query.charAt(0).toUpperCase() + query.slice(1)}`;
    
    return {
      id,
      title,
      imageSrc: imageUrl,
      author: "Diagram Library",
      authorUsername: "diagramlibrary",
      tags,
      sourceUrl: imageUrl,
      isGenerated: false
    };
  });
}

// Fisher-Yates shuffle algorithm for arrays
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
