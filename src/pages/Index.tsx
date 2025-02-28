
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

// Unsplash image URLs for better diagram previews
const DIAGRAM_IMAGES = [
  "https://images.unsplash.com/photo-1606117192276-2f26a021d014?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1612050489523-fb5c9b8c5704?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1581307705662-903b18977b5e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524334228333-0f6db392f8a1?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1610366398516-46da9dec5931?w=600&auto=format&fit=crop&q=80",
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

  // Enhanced function to simulate fetching diagrams from the web based on search term
  const fetchDiagramsFromWeb = async (searchTerm: string): Promise<DiagramData[]> => {
    console.log("Searching for:", searchTerm);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate more realistic mock results based on the search term
    const searchTermWords = searchTerm.toLowerCase().split(" ");
    
    // Create tag combinations from the search term
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
      
      // Select an image from the pool or use a fallback
      const imageIndex = i % DIAGRAM_IMAGES.length;
      const imageSrc = DIAGRAM_IMAGES[imageIndex];
      
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

  const handleAIPrompt = async (prompt: string) => {
    setAiPrompt(prompt);
    setIsSearching(true);
    
    try {
      // Fetch diagrams based on search term
      const searchResults = await fetchDiagramsFromWeb(prompt);
      setResults(searchResults);
      toast.success(`Found ${searchResults.length} diagrams for "${prompt}"`);
    } catch (error) {
      console.error("Error fetching diagrams:", error);
      // In case of error, fall back to sample data
      setResults(SAMPLE_DIAGRAM_DATA);
      toast.error("Error fetching diagrams. Please try again.");
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
                    placeholder="Enter your search (e.g., 'network diagram' or 'data structures')"
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
