import { useState, useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { ResultsSection } from "@/components/results-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { searchGoogleImages } from "@/utils/googleSearch";
import { BuiltByBadge } from "@/components/built-by-badge";

// Set the Google API credentials
const GOOGLE_SEARCH_API_KEY = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4";
const GOOGLE_CUSTOM_SEARCH_ID = "260090575ae504419";

// Sample diagram data for initial load and fallback
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

// High-quality diagram image sources
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
  const [searchCount, setSearchCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Initialize search count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('searchData');
    
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.date === today) {
        setSearchCount(data.count);
      } else {
        // Reset for a new day
        localStorage.setItem('searchData', JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      localStorage.setItem('searchData', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  // Function to fetch diagrams from the web based on search term
  const fetchDiagramsFromWeb = async (searchTerm: string): Promise<DiagramData[]> => {
    console.log("Searching for:", searchTerm);
    
    try {
      // Use Google Search API with provided API key and custom search ID
      const searchResults = await searchGoogleImages(
        searchTerm + " diagram", 
        GOOGLE_SEARCH_API_KEY, 
        GOOGLE_CUSTOM_SEARCH_ID
      );
      
      if (searchResults.length > 0) {
        return searchResults;
      }
      
      // Fallback to mock data if no results
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
    } catch (error) {
      console.error("Error fetching diagrams:", error);
      return SAMPLE_DIAGRAM_DATA;
    }
  };

  // Function to generate diagrams using AI based on prompt
  const generateDiagramWithAI = async (prompt: string): Promise<DiagramData[]> => {
    console.log("Generating diagram for:", prompt);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
        author: "Diagramr AI",
        authorUsername: "diagramr_ai",
        tags: generateTags(prompt),
        sourceUrl: `#`,
        isGenerated: true
      };
    });
    
    return mockResults;
  };

  const handleAIPrompt = async (prompt: string, mode: "search" | "generate") => {
    // Check if the user has reached the free tier limit
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('searchData');
    let currentCount = 0;
    
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.date === today) {
        currentCount = data.count;
      }
    }
    
    // Free tier limit check
    if (!isPremium && currentCount >= 20) {
      showPremiumPopup();
      return;
    }
    
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
        
        // Update search count
        const newCount = currentCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('searchData', JSON.stringify({ date: today, count: newCount }));
        
        // Check if they're approaching the limit
        if (!isPremium && newCount === 17) {
          toast.warning("You have 3 searches left today in the free plan!");
        }
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

  const showPremiumPopup = () => {
    toast((
      <div className="space-y-2">
        <p className="font-medium">Free plan limit reached!</p>
        <p className="text-sm text-muted-foreground">You've used all 20 daily searches.</p>
        <button 
          className="mt-2 bg-primary text-primary-foreground text-sm px-4 py-1.5 rounded-md w-full"
          onClick={() => {}}
        >
          Upgrade to Premium
        </button>
      </div>
    ), {
      duration: 8000,
    });
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
          <>
            <HeroSection onSearch={handleAIPrompt} isLoading={isLoading} />
            {!isPremium && (
              <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-4 py-2 shadow-md">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{20 - searchCount}</span> free searches remaining today
                </p>
              </div>
            )}
            <BuiltByBadge position="fixed" />
          </>
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
