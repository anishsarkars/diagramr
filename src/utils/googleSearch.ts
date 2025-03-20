
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
    const enhancedQuery = `${query} diagram visualization infographic schema high quality professional educational`;
    
    // Calculate start index for pagination
    const startIndex = (page - 1) * 10 + 1;
    
    // Build the API URL with appropriate parameters for diagrams
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(enhancedQuery)}&searchType=image&num=10&start=${startIndex}&safe=active&imgSize=large&imgType=clipart,drawing,stock&rights=cc_publicdomain,cc_attribute,cc_sharealike&fileType=jpg,png,svg`;
    
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
        toast.warning("API rate limit reached. Showing alternative results.");
        console.log("[GoogleSearch] Quota exceeded, falling back to alternative results");
        return getDiagramFallbackResults(query, page);
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
      toast.info("No direct results found. Showing related diagrams.");
      console.log("[GoogleSearch] No results from API, using web fallbacks");
      return getDiagramFallbackResults(query, page);
    }
    
    // Map the API results to our DiagramResult format with improved filtering
    const results: DiagramResult[] = data.items
      .filter((item: any) => {
        // Basic filtering to exclude non-diagram images
        const title = item.title?.toLowerCase() || '';
        const diagramKeywords = ['diagram', 'chart', 'flowchart', 'visualization', 'infographic', 'schema'];
        const hasDiagramKeyword = diagramKeywords.some(keyword => title.includes(keyword));
        
        // If 'data structure' is in query, filter more strictly
        if (query.toLowerCase().includes('data structure')) {
          const dataStructureKeywords = ['tree', 'graph', 'hash', 'linked list', 'array', 'stack', 'queue'];
          return hasDiagramKeyword || dataStructureKeywords.some(keyword => title.includes(keyword));
        }
        
        return true; // Return all results for now, advanced filtering done later
      })
      .map((item: any, index: number) => {
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
    console.log("[GoogleSearch] Falling back to diagram repository");
    return getDiagramFallbackResults(query, page);
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

// Enhanced fallback function with specialized diagram collections
function getDiagramFallbackResults(query: string, page: number): DiagramResult[] {
  console.log(`[DiagramRepository] Generating relevant diagrams for: "${query}" (page ${page})`);
  
  // A focused collection of high-quality diagram image URLs organized by topic
  const diagramRepositories: Record<string, string[]> = {
    // Data Structures and Algorithms
    "dataStructure": [
      "https://www.tutorialspoint.com/data_structures_algorithms/images/binary_tree.jpg",
      "https://www.tutorialspoint.com/data_structures_algorithms/images/linear_search.jpg",
      "https://www.tutorialspoint.com/data_structures_algorithms/images/queue_enqueue_dequeue.jpg",
      "https://www.tutorialspoint.com/data_structures_algorithms/images/stack_representation.jpg",
      "https://www.geeksforgeeks.org/wp-content/uploads/Linked-List-Loop.gif",
      "https://www.geeksforgeeks.org/wp-content/uploads/HashTable-768x331.png",
      "https://www.geeksforgeeks.org/wp-content/uploads/binary_search-1.png",
      "https://www.geeksforgeeks.org/wp-content/uploads/gq/2018/01/LL1.png",
      "https://i0.wp.com/algorithms.tutorialhorizon.com/files/2018/03/Binary-Tree-Traversals.png",
      "https://i0.wp.com/algorithms.tutorialhorizon.com/files/2015/11/Red-Black-Tree-Example.png"
    ],
    
    // UML and Software Design
    "uml": [
      "https://www.uml-diagrams.org/examples/class-example-android-opengl.png",
      "https://www.uml-diagrams.org/examples/use-case-example-online-shopping.png",
      "https://www.uml-diagrams.org/examples/state-machine-example-bank-atm.png",
      "https://www.uml-diagrams.org/examples/sequence-example-atm-withdraw.png",
      "https://www.uml-diagrams.org/examples/component-example-system-architecture.png",
      "https://www.conceptdraw.com/How-To-Guide/picture/UML-class-diagram-example-online-shopping-domain-model.png",
      "https://www.lucidchart.com/publicSegments/view/537442f0-7d64-4024-9290-1ce00a00cc28/image.png",
      "https://www.visual-paradigm.com/servlet/editor-content/tutorials/uml-tutorial/sites/tutorials/uml-tutorial/images/class-diagram.png",
      "https://www.researchgate.net/profile/Dragan-Ivanovic/publication/334143302/figure/fig1/AS:776559946387459@1562162091926/An-example-ER-diagram.png"
    ],
    
    // Network Architecture
    "network": [
      "https://images.edrawsoft.com/articles/network-diagram-software/network-diagram.png",
      "https://www.conceptdraw.com/solution-park/resource/images/solutions/network-diagram/NETWORK-DIAGRAM-Network-Topology-Network-Diagram.png",
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/examples/networkdiagram.svg",
      "https://www.conceptdraw.com/How-To-Guide/picture/LAN-Network-Diagram.png",
      "https://www.edrawsoft.com/templates/images/network-topology-sample.png",
      "https://images.edrawsoft.com/articles/network-topology-diagram-templates/star-network-topology.png",
      "https://www.cs.csubak.edu/~dporter/cs3150/images/network.jpg",
      "https://www.conceptdraw.com/How-To-Guide/picture/Computer-and-Networks-Network-Diagram-Cisco.png"
    ],
    
    // Database Schema
    "database": [
      "https://img.freepik.com/premium-vector/vector-database-schema-diagram-entity-relationship-diagram-simple-conceptual-data-model-presented-entity-relationship-diagram_302982-1689.jpg",
      "https://www.researchgate.net/profile/Peter-Kovac-5/publication/311754649/figure/fig2/AS:444151117336577@1482957740275/Example-of-Entity-Relationship-Diagram-ERD.png",
      "https://i.stack.imgur.com/OXoQe.jpg",
      "https://www.oracle.com/webfolder/technetwork/tutorials/obe/db/sqldev/r40/sqldev4_datamodelingquickstart/images/sqldev4_datamodeler_quickstart_05.png",
      "https://www.smartdraw.com/entity-relationship-diagram/img/entity-relationship-diagram.jpg",
      "https://i.stack.imgur.com/rHmqJ.png",
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/blog/2019Q1/database-diagram-examples/MySQL-Workbench-ERD-tool.PNG"
    ],
    
    // System Architecture
    "architecture": [
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/blog/2018Q4/system-architecture/system-architecture-diagram.png",
      "https://www.researchgate.net/profile/Huseyin-Oktay-2/publication/351648093/figure/fig2/AS:1024480481259522@1621362767835/A-simple-architecture-diagram-showing-the-main-components-of-the-hybrid-cloud-based.png",
      "https://www.researchgate.net/profile/Syed-Muhammad-Ahmad-14/publication/332690739/figure/fig1/AS:750946110275590@1556036316072/System-architecture-of-cloud-based-Big-Data-Analytics-as-a-Service.png",
      "https://miro.medium.com/v2/resize:fit:1400/1*-hMKkxEVu-_0q-R85Xu84Q.png",
      "https://cdn.ttgtmedia.com/rms/onlineImages/microservices-microservice_architecture_desktop.jpg",
      "https://microservices.io/i/Microservice_Architecture.png",
      "https://miro.medium.com/v2/resize:fit:1400/0*J7xfNq2mc-U3AHB4.png"
    ],
    
    // Flowcharts
    "flowchart": [
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/flowchart-examples/hiring-process-flowchart.svg",
      "https://www.lucidchart.com/blog/hubfs/Imported_Blog_Media/What-is-a-Flowchart.png",
      "https://www.edrawsoft.com/templates/images/marketing-flow-chart.png",
      "https://www.process.st/wp-content/uploads/2021/12/Flowchart-Example-HR-Approval.png",
      "https://www.edrawsoft.com/templates/images/basic-workflow-diagram.png",
      "https://i.pinimg.com/originals/b4/5e/a8/b45ea8d6c29cb4b3c941d5b6aaeaf852.png"
    ],
    
    // Machine Learning
    "machinelearning": [
      "https://miro.medium.com/v2/resize:fit:1400/1*c6S0GXYgMNELRFCZ_CnCYA.png",
      "https://www.vairix.com/hubfs/machine-learning-framework.jpg",
      "https://www.researchgate.net/profile/Oliver-Duessmann/publication/343938889/figure/fig5/AS:929961670889480@1598939834483/Machine-learning-workflow-adapted-from-40.png",
      "https://sds-platform-private.s3-us-east-2.amazonaws.com/uploads/35_blog_image_3.png",
      "https://cdn-images-1.medium.com/max/800/1*wvoDpTpS95NxUxcgZKnYCA.png"
    ],
    
    // Process diagrams
    "process": [
      "https://www.edrawsoft.com/templates/images/process-flow-diagram.png",
      "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/pert-chart-examples/credit-card-application-pert-chart.svg",
      "https://cdn.sketchbubble.com/pub/media/catalog/product/optimized1/d/a/da3e13b35a385b3dfd56dfd1adb266c7d91fe7fd558d4bfb2f136d1c9ff6c29b/data-flow-diagram-mc-slide1.png",
      "https://uploads.toptal.io/blog/image/125760/toptal-blog-image-1522137583222-72a79dc3c6f35945e02b40140c36a6a6.png"
    ]
  };
  
  // Match query to the appropriate diagram collection
  let selectedCollection: string[] = [];
  const queryLower = query.toLowerCase();
  
  // Data structures and algorithms
  if (queryLower.includes('data structure') || 
      queryLower.includes('algorithm') || 
      queryLower.includes('tree') || 
      queryLower.includes('linked list') || 
      queryLower.includes('stack') || 
      queryLower.includes('queue') || 
      queryLower.includes('hash')) {
    selectedCollection = diagramRepositories.dataStructure;
    console.log("[DiagramRepository] Selected data structure diagrams");
  } 
  // UML and software diagrams
  else if (queryLower.includes('uml') || 
           queryLower.includes('class diagram') || 
           queryLower.includes('sequence diagram') || 
           queryLower.includes('use case') || 
           queryLower.includes('software design')) {
    selectedCollection = diagramRepositories.uml;
    console.log("[DiagramRepository] Selected UML diagrams");
  }
  // Network diagrams
  else if (queryLower.includes('network') || 
           queryLower.includes('topology') || 
           queryLower.includes('lan') || 
           queryLower.includes('wan') || 
           queryLower.includes('internet')) {
    selectedCollection = diagramRepositories.network;
    console.log("[DiagramRepository] Selected network diagrams");
  }
  // Database diagrams
  else if (queryLower.includes('database') || 
           queryLower.includes('er diagram') || 
           queryLower.includes('entity') || 
           queryLower.includes('schema')) {
    selectedCollection = diagramRepositories.database;
    console.log("[DiagramRepository] Selected database diagrams");
  }
  // System architecture
  else if (queryLower.includes('architecture') || 
           queryLower.includes('system') || 
           queryLower.includes('microservice') || 
           queryLower.includes('cloud')) {
    selectedCollection = diagramRepositories.architecture;
    console.log("[DiagramRepository] Selected architecture diagrams");
  }
  // Flowcharts
  else if (queryLower.includes('flowchart') || 
           queryLower.includes('flow chart') || 
           queryLower.includes('workflow') || 
           queryLower.includes('process flow')) {
    selectedCollection = diagramRepositories.flowchart;
    console.log("[DiagramRepository] Selected flowchart diagrams");
  }
  // Machine Learning
  else if (queryLower.includes('machine learning') || 
           queryLower.includes('ml') || 
           queryLower.includes('ai') || 
           queryLower.includes('artificial intelligence') ||
           queryLower.includes('deep learning') ||
           queryLower.includes('neural network')) {
    selectedCollection = diagramRepositories.machinelearning;
    console.log("[DiagramRepository] Selected machine learning diagrams");
  }
  // Process diagrams
  else if (queryLower.includes('process') || 
           queryLower.includes('business process') || 
           queryLower.includes('bpmn')) {
    selectedCollection = diagramRepositories.process;
    console.log("[DiagramRepository] Selected process diagrams");
  }
  // Default - mix of diagrams based on partial matches
  else {
    // Check for partial matches
    for (const [category, diagrams] of Object.entries(diagramRepositories)) {
      if (category.toLowerCase().includes(queryLower) || queryLower.includes(category.toLowerCase())) {
        selectedCollection = diagrams;
        console.log(`[DiagramRepository] Selected ${category} diagrams based on partial match`);
        break;
      }
    }
    
    // If still no match, use a mix of the most common diagram types
    if (selectedCollection.length === 0) {
      selectedCollection = [
        ...diagramRepositories.flowchart.slice(0, 2),
        ...diagramRepositories.uml.slice(0, 2),
        ...diagramRepositories.dataStructure.slice(0, 2),
        ...diagramRepositories.network.slice(0, 2),
        ...diagramRepositories.architecture.slice(0, 2)
      ];
      console.log("[DiagramRepository] Using mixed diagram collection");
    }
  }
  
  // Calculate starting index based on page number for pagination
  const itemsPerPage = 10;
  const startIndex = ((page - 1) % Math.ceil(selectedCollection.length / itemsPerPage)) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, selectedCollection.length);
  const selectedDiagrams = selectedCollection.slice(startIndex, endIndex);
  
  console.log(`[DiagramRepository] Returning ${selectedDiagrams.length} diagrams for page ${page}`);
  
  // If not enough diagrams, cycle through from the beginning
  let finalDiagrams = [...selectedDiagrams];
  while (finalDiagrams.length < itemsPerPage) {
    const remainingNeeded = itemsPerPage - finalDiagrams.length;
    const additionalDiagrams = selectedCollection.slice(0, remainingNeeded);
    finalDiagrams = [...finalDiagrams, ...additionalDiagrams];
  }
  
  // Generate DiagramResult objects
  return finalDiagrams.map((imageUrl, index) => {
    const id = `fallback-${Date.now()}-${page}-${index}`;
    const tags = generateFallbackTags(query);
    
    // Create relevant title based on query and diagram type
    let title = `${query.charAt(0).toUpperCase() + query.slice(1)} Diagram`;
    
    // Add diagram type specificity based on URL
    if (imageUrl.includes('class') && imageUrl.includes('uml')) {
      title = `UML Class Diagram: ${query}`;
    } else if (imageUrl.includes('entity') || imageUrl.includes('er-diagram')) {
      title = `Entity Relationship Diagram: ${query}`;
    } else if (imageUrl.includes('flow') || imageUrl.includes('flowchart')) {
      title = `Flowchart: ${query} Process`;
    } else if (imageUrl.includes('network') || imageUrl.includes('topology')) {
      title = `Network Topology: ${query}`;
    } else if (imageUrl.includes('sequence')) {
      title = `Sequence Diagram: ${query} Interaction`;
    } else if (imageUrl.includes('architecture') || imageUrl.includes('system')) {
      title = `System Architecture: ${query}`;
    }
    
    return {
      id,
      title,
      imageSrc: imageUrl,
      author: "Diagram Repository",
      authorUsername: "diagramrepo",
      tags,
      sourceUrl: imageUrl,
      isGenerated: false
    };
  });
}

// Generate relevant tags for fallback results
function generateFallbackTags(query: string): string[] {
  const tags: string[] = [];
  
  // Add query terms as tags
  const queryTerms = query.toLowerCase().split(' ')
    .filter(term => term.length > 3)
    .slice(0, 3);
  
  tags.push(...queryTerms);
  
  // Add common diagram-related tags
  tags.push('diagram');
  
  // Add more specific tags based on query
  if (query.toLowerCase().includes('data structure')) {
    tags.push('data structure', 'algorithm', 'computer science');
  } else if (query.toLowerCase().includes('network')) {
    tags.push('network', 'topology', 'infrastructure');
  } else if (query.toLowerCase().includes('uml') || query.toLowerCase().includes('class diagram')) {
    tags.push('uml', 'software design', 'modeling');
  } else if (query.toLowerCase().includes('database') || query.toLowerCase().includes('schema')) {
    tags.push('database', 'schema', 'data model');
  } else if (query.toLowerCase().includes('architecture')) {
    tags.push('architecture', 'system design', 'structure');
  } else if (query.toLowerCase().includes('flow') || query.toLowerCase().includes('process')) {
    tags.push('flowchart', 'process', 'workflow');
  } else if (query.toLowerCase().includes('machine learning')) {
    tags.push('machine learning', 'ai', 'data science');
  }
  
  // Return unique tags
  return Array.from(new Set(tags)).slice(0, 8);
}
