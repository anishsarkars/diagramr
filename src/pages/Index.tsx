import { useState, useEffect } from "react";
import { AnimatedContainer } from "@/components/animated-container";
import { DiagramCard } from "@/components/diagram-card";
import { AIInput } from "@/components/ai-input";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Sample diagram data for initial load
const SAMPLE_DIAGRAM_DATA = [
  {
    id: 1,
    title: "Cloud Computing Architecture",
    imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    author: "Anish Sarkar",
    authorUsername: "anishsarkar",
    tags: ["cloud", "architecture", "infrastructure"],
    sourceUrl: "https://example.com/cloud-architecture"
  },
  {
    id: 2,
    title: "Cloud Computing Diagram",
    imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    author: "Anish",
    authorUsername: "anish",
    tags: ["cloud", "computing", "saas"],
    sourceUrl: "https://example.com/cloud-computing"
  },
  {
    id: 3,
    title: "Cloud Infrastructure Components",
    imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    author: "GFG",
    authorUsername: "GFG",
    tags: ["cloud", "paas", "iaas"],
    sourceUrl: "https://geeksforgeeks.org/cloud-infrastructure"
  },
  {
    id: 4,
    title: "Service Layers Diagram",
    imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    author: "Sarkar",
    authorUsername: "sarkar",
    tags: ["service", "layers", "cloud"],
    sourceUrl: "https://example.com/service-layers"
  },
];

// Real diagram image URLs for better preview
const DIAGRAM_IMAGES = [
  "https://miro.medium.com/v2/resize:fit:1400/1*Qwln63hihLxKZWQQCwYoMg.png", // Network diagram
  "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/examples/networkdiagram.svg", // Another network diagram
  "https://www.researchgate.net/profile/Jukka-Kiljander/publication/269932936/figure/fig1/AS:668517535866888@1536398532674/IoT-reference-architecture.png", // IoT architecture
  "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/examples/flowchart.svg", // Flowchart
  "https://www.researchgate.net/profile/Emanuele-Bellini-4/publication/343545097/figure/fig2/AS:923460958752769@1597050767735/An-example-of-a-binary-search-tree.png", // Binary search tree
  "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/discovery-page/UML-class-diagram/UML-class-diagram-example.png", // UML class diagram
  "https://media.geeksforgeeks.org/wp-content/uploads/20220217151648/UndirectedGraph3.png", // Graph data structure
  "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/ER-diagram-tutorial/erd_2_LI.jpg", // ER diagram
];

interface DiagramData {
  id: number | string;
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  tags?: string[];
  sourceUrl?: string;
  isGenerated?: boolean;
}

const Index = () => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [results, setResults] = useState<DiagramData[]>(SAMPLE_DIAGRAM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showSearchField, setShowSearchField] = useState(true);
  const [lastAction, setLastAction] = useState<"search" | "generate">("search");

  // Function to fetch diagrams from the web based on search term
  const fetchDiagramsFromWeb = async (searchTerm: string): Promise<DiagramData[]> => {
    console.log("Searching for:", searchTerm);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Determine which images to show based on search keywords
    const searchTermLower = searchTerm.toLowerCase();
    let filteredImages = [...DIAGRAM_IMAGES];
    
    if (searchTermLower.includes("network")) {
      // Prioritize network diagrams
      filteredImages = DIAGRAM_IMAGES.filter((_, i) => i < 2).concat(filteredImages.filter((_, i) => i >= 2));
    } else if (searchTermLower.includes("tree") || searchTermLower.includes("data structure")) {
      // Prioritize tree or data structure diagrams
      filteredImages = [DIAGRAM_IMAGES[4], DIAGRAM_IMAGES[6]].concat(filteredImages.filter((_, i) => i !== 4 && i !== 6));
    } else if (searchTermLower.includes("uml") || searchTermLower.includes("class")) {
      // Prioritize UML diagrams
      filteredImages = [DIAGRAM_IMAGES[5]].concat(filteredImages.filter((_, i) => i !== 5));
    } else if (searchTermLower.includes("flow") || searchTermLower.includes("flowchart")) {
      // Prioritize flowcharts
      filteredImages = [DIAGRAM_IMAGES[3]].concat(filteredImages.filter((_, i) => i !== 3));
    } else if (searchTermLower.includes("er") || searchTermLower.includes("entity")) {
      // Prioritize ER diagrams
      filteredImages = [DIAGRAM_IMAGES[7]].concat(filteredImages.filter((_, i) => i !== 7));
    }
    
    // Generate tag combinations from the search term
    const generateTags = (term: string) => {
      const words = term.toLowerCase().split(" ");
      const baseTags = words.filter(word => word.length > 3);
      
      // Add some common diagram-related tags
      const diagramTypes = ["flowchart", "uml", "er", "sequence", "class", "network", "architecture"];
      const matchingTypes = diagramTypes.filter(type => term.toLowerCase().includes(type));
      
      return [...new Set([...baseTags, ...matchingTypes])];
    };
    
    // Create author variations
    const authors = ["DiagramHub", "DiagramExpert", "VisualDocs", "Mermaid", "DrawIO", "LucidChart"];
    
    // Generate diagram results
    const mockResults: DiagramData[] = Array.from({ length: 8 }, (_, i) => {
      // Create a title combining the search term with common diagram terminology
      const titlePrefixes = ["Complete", "Detailed", "Professional", "Simple", "Modern", "Comprehensive"];
      const titleSuffixes = ["Diagram", "Chart", "Visualization", "Model", "Representation", "Layout"];
      
      const prefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
      const suffix = titleSuffixes[Math.floor(Math.random() * titleSuffixes.length)];
      
      const title = `${prefix} ${searchTerm} ${suffix}`;
      
      // Select an image from the filtered pool
      const imageIndex = i % filteredImages.length;
      const imageSrc = filteredImages[imageIndex];
      
      // Generate tags from the search term
      const tags = generateTags(searchTerm);
      
      // Select an author
      const authorIndex = i % authors.length;
      const author = authors[authorIndex];
      
      return {
        id: `search-${Date.now()}-${i}`,
        title,
        imageSrc,
        author,
        authorUsername: author.toLowerCase().replace(/\s/g, ""),
        tags,
        sourceUrl: `https://example.com/diagram-${i}`
      };
    });
    
    return mockResults;
  };

  // Function to generate diagrams using AI based on prompt
  const generateDiagramWithAI = async (prompt: string): Promise<DiagramData[]> => {
    console.log("Generating diagram for:", prompt);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // For demonstration, we'll use the same images but mark them as AI-generated
    const imagePool = [...DIAGRAM_IMAGES];
    
    // Create tag combinations from the prompt
    const generateTags = (term: string) => {
      const words = term.toLowerCase().split(" ");
      const baseTags = words.filter(word => word.length > 3);
      return [...new Set([...baseTags, "ai-generated", "custom"])];
    };
    
    // Generate AI results (fewer than search results)
    const mockResults: DiagramData[] = Array.from({ length: 3 }, (_, i) => {
      const imageIndex = i % imagePool.length;
      
      return {
        id: `generated-${Date.now()}-${i}`,
        title: `AI Generated: ${prompt}`,
        imageSrc: imagePool[imageIndex],
        author: "diagramr AI",
        authorUsername: "diagramr_ai",
        tags: generateTags(prompt),
        sourceUrl: `#`,
        isGenerated: true
      };
    });
    
    return mockResults;
  };

  const handleAIPrompt = async (prompt: string, mode: "search" | "generate") => {
    setAiPrompt(prompt);
    setIsLoading(true);
    setLastAction(mode);
    
    try {
      let searchResults: DiagramData[] = [];
      
      if (mode === "search") {
        // Fetch diagrams based on search term
        searchResults = await fetchDiagramsFromWeb(prompt);
        toast.success(`Found ${searchResults.length} diagrams for "${prompt}"`);
      } else {
        // Generate diagram based on prompt
        searchResults = await generateDiagramWithAI(prompt);
        toast.success(`Generated ${searchResults.length} diagrams for "${prompt}"`);
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error(`Error ${mode === "search" ? "fetching" : "generating"} diagrams:`, error);
      // In case of error, fall back to sample data
      setResults(SAMPLE_DIAGRAM_DATA);
      toast.error(`Error ${mode === "search" ? "searching for" : "generating"} diagrams. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const handlePopularSearch = (term: string) => {
    handleAIPrompt(term, "search");
  };

  useEffect(() => {
    // Automatically hide the search field when showing results
    // but keep it visible during initial load
    if (aiPrompt && !isLoading) {
      setShowSearchField(false);
    }
  }, [aiPrompt, isLoading]);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center h-full px-4 md:px-6">
          <motion.div 
            className="p-6 flex flex-col items-center justify-center w-full max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="mb-6 mt-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Logo showText className="scale-125" />
            </motion.div>
            
            {showSearchField && (
              <AnimatedContainer className="w-full max-w-3xl">
                <h1 className="text-2xl font-semibold mb-3 text-center">Find or generate the perfect diagram</h1>
                <p className="text-muted-foreground mb-6 text-center max-w-md mx-auto">
                  Search for any diagram type or let AI generate one for you.
                </p>
                
                <div className="w-full mb-8">
                  <AIInput 
                    onSubmit={handleAIPrompt} 
                    className="w-full shadow-lg"
                    placeholder="Enter your search or describe what you need..."
                    isLoading={isLoading}
                  />
                </div>
                
                <div className="text-center">
                  <h3 className="text-base font-medium mb-3 text-muted-foreground">Popular searches</h3>
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                    {["UML Class Diagram", "Network Diagram", "Data Structure Trees", 
                      "Flowchart", "System Architecture", "ER Diagram"].map((type) => (
                      <Button 
                        key={type} 
                        variant="outline" 
                        size="sm"
                        className="mb-2"
                        onClick={() => handlePopularSearch(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </AnimatedContainer>
            )}
            
            {!showSearchField && (
              <motion.div 
                className="w-full mb-6 flex justify-between items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-medium">
                  {lastAction === "search" ? "Results for:" : "Generated for:"} <span className="text-primary">{aiPrompt}</span>
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSearchField(true)}
                  className="ml-4"
                >
                  New Search
                </Button>
              </motion.div>
            )}
            
            {isLoading ? (
              <div className="w-full h-64 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16">
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <p className="text-muted-foreground mt-4">
                  {lastAction === "search" ? "Searching for diagrams..." : "Generating your diagram..."}
                </p>
              </div>
            ) : aiPrompt && !showSearchField ? (
              <motion.div 
                className="w-full"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <Tabs defaultValue={activeTab} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All Results</TabsTrigger>
                    <TabsTrigger value="diagrams" onClick={() => setActiveTab("diagrams")}>Diagrams</TabsTrigger>
                    <TabsTrigger value="infographics" onClick={() => setActiveTab("infographics")}>Infographics</TabsTrigger>
                    <TabsTrigger value="charts" onClick={() => setActiveTab("charts")}>Charts</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-4">
                      {results.map((diagram) => (
                        <DiagramCard
                          key={diagram.id}
                          title={diagram.title}
                          imageSrc={diagram.imageSrc}
                          author={diagram.author}
                          authorUsername={diagram.authorUsername}
                          tags={diagram.tags}
                          sourceUrl={diagram.sourceUrl}
                          isGenerated={diagram.isGenerated}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="diagrams" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-4">
                      {results.filter((_, index) => index % 2 === 0).map((diagram) => (
                        <DiagramCard
                          key={diagram.id}
                          title={diagram.title}
                          imageSrc={diagram.imageSrc}
                          author={diagram.author}
                          authorUsername={diagram.authorUsername}
                          tags={diagram.tags}
                          sourceUrl={diagram.sourceUrl}
                          isGenerated={diagram.isGenerated}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="infographics" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-4">
                      {results.filter((_, index) => index % 3 === 0).map((diagram) => (
                        <DiagramCard
                          key={diagram.id}
                          title={diagram.title}
                          imageSrc={diagram.imageSrc}
                          author={diagram.author}
                          authorUsername={diagram.authorUsername}
                          tags={diagram.tags}
                          sourceUrl={diagram.sourceUrl}
                          isGenerated={diagram.isGenerated}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="charts" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-4">
                      {results.filter((_, index) => index % 4 === 0).map((diagram) => (
                        <DiagramCard
                          key={diagram.id}
                          title={diagram.title}
                          imageSrc={diagram.imageSrc}
                          author={diagram.author}
                          authorUsername={diagram.authorUsername}
                          tags={diagram.tags}
                          sourceUrl={diagram.sourceUrl}
                          isGenerated={diagram.isGenerated}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Index;
