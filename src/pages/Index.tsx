
import { useState, useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { ResultsSection } from "@/components/results-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [results, setResults] = useState<DiagramData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    setShowSearchField(false);
    
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

  const handleNewSearch = () => {
    setShowSearchField(true);
    setAiPrompt("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {showSearchField ? (
          <HeroSection onSearch={handleAIPrompt} isLoading={isLoading} />
        ) : (
          <ResultsSection 
            results={results} 
            searchTerm={aiPrompt} 
            onNewSearch={handleNewSearch} 
            isLoading={isLoading}
            lastAction={lastAction}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
