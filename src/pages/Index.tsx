import { useState, useEffect } from "react";
import { AnimatedContainer } from "@/components/animated-container";
import { DiagramCard } from "@/components/diagram-card";
import { AIInput } from "@/components/ai-input";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface DiagramData {
  id: number | string;
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  tags?: string[];
  sourceUrl?: string;
}

const Index = () => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [results, setResults] = useState<DiagramData[]>(SAMPLE_DIAGRAM_DATA);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showSearchField, setShowSearchField] = useState(true);

  // Mock function to simulate fetching diagrams from the web based on search term
  // In a real implementation, this would call an API to get diagram search results
  const fetchDiagramsFromWeb = async (searchTerm: string): Promise<DiagramData[]> => {
    console.log("Searching for:", searchTerm);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, we'll just return a modified version of our sample data
    // with the search term in the titles
    const mockResults: DiagramData[] = [
      {
        id: `search-${Date.now()}-1`,
        title: `${searchTerm} - Comprehensive Diagram`,
        imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
        author: "Web Search",
        authorUsername: "websearch",
        tags: searchTerm.toLowerCase().split(" "),
        sourceUrl: "https://example.com/search-result-1"
      },
      {
        id: `search-${Date.now()}-2`,
        title: `${searchTerm} - Visual Representation`,
        imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
        author: "Diagram Search",
        authorUsername: "diagramsearch",
        tags: [...searchTerm.toLowerCase().split(" "), "visual"],
        sourceUrl: "https://example.com/search-result-2"
      },
      {
        id: `search-${Date.now()}-3`,
        title: `${searchTerm} - Conceptual Model`,
        imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
        author: "Diagram Hub",
        authorUsername: "diagramhub",
        tags: [...searchTerm.toLowerCase().split(" "), "conceptual"],
        sourceUrl: "https://example.com/search-result-3"
      },
      {
        id: `search-${Date.now()}-4`,
        title: `${searchTerm} - Detailed Overview`,
        imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
        author: "Diagram Expert",
        authorUsername: "diagramexpert",
        tags: [...searchTerm.toLowerCase().split(" "), "detailed"],
        sourceUrl: "https://example.com/search-result-4"
      },
    ];
    
    return mockResults;
  };

  const handleAIPrompt = async (prompt: string) => {
    setAiPrompt(prompt);
    setIsSearching(true);
    
    try {
      // Fetch diagrams based on search term
      const searchResults = await fetchDiagramsFromWeb(prompt);
      setResults(searchResults);
    } catch (error) {
      console.error("Error fetching diagrams:", error);
      // In case of error, fall back to sample data
      setResults(SAMPLE_DIAGRAM_DATA);
    } finally {
      setIsSearching(false);
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
    handleAIPrompt(term);
  };

  useEffect(() => {
    // Automatically hide the search field when showing results
    // but keep it visible during initial load
    if (aiPrompt && !isSearching) {
      setShowSearchField(false);
    }
  }, [aiPrompt, isSearching]);

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
                <h1 className="text-2xl font-semibold mb-3 text-center">Find the perfect diagram</h1>
                <p className="text-muted-foreground mb-6 text-center max-w-md mx-auto">
                  Search for any diagram type, concept, or visual representation you need.
                </p>
                
                <div className="w-full mb-8">
                  <AIInput 
                    onSubmit={handleAIPrompt} 
                    className="w-full shadow-lg"
                    placeholder="Enter your search (e.g., 'data structures tree types diagrams')"
                    isSearching={isSearching}
                  />
                </div>
                
                <div className="text-center">
                  <h3 className="text-base font-medium mb-3 text-muted-foreground">Popular searches</h3>
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                    {["UML Class Diagram", "Database Schema", "Flowchart", "Network Diagram", 
                      "Data Structure Trees", "System Architecture", "Cloud Architecture"].map((type) => (
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
                <h2 className="text-xl font-medium">Results for: <span className="text-primary">{aiPrompt}</span></h2>
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
            
            {isSearching ? (
              <div className="w-full h-64 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16">
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <p className="text-muted-foreground mt-4">Searching for diagrams...</p>
              </div>
            ) : aiPrompt && !showSearchField ? (
              <motion.div 
                className="w-full"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <Tabs defaultValue="all" className="w-full">
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
