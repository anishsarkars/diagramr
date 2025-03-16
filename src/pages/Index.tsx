
import { useState, useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { ResultsSection } from "@/components/results-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { searchGoogleImages } from "@/utils/googleSearch";
import { useAuth } from "@/components/auth-context";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";
import { useNavigate } from "react-router-dom";

const GOOGLE_SEARCH_API_KEY = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4";
const GOOGLE_CUSTOM_SEARCH_ID = "260090575ae504419";

// Sample diagrams to use as fallback
const DIAGRAM_IMAGES = [
  "https://miro.medium.com/v2/resize:fit:1400/1*Qwln63hihLxKZWQQCwYoMg.png",
  "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/examples/networkdiagram.svg",
  "https://www.researchgate.net/profile/Jukka-Kiljander/publication/269932936/figure/fig1/AS:668517535866888@1536398532674/IoT-reference-architecture.png",
  "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/examples/flowchart.svg",
  "https://www.researchgate.net/profile/Emanuele-Bellini-4/publication/343545097/figure/fig2/AS:923460958752769@1597050767735/An-example-of-a-binary-search-tree.png",
  "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/discovery-page/UML-class-diagram/UML-class-diagram-example.png",
  "https://media.geeksforgeeks.org/wp-content/uploads/20220217151648/UndirectedGraph3.png",
  "https://d2slcw3kip6qmk.cloudfront.net/marketing/pages/chart/ER-diagram-tutorial/erd_2_LI.jpg",
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

interface IndexProps {
  onLoginClick?: () => void;
}

const Index = ({ onLoginClick }: IndexProps) => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [results, setResults] = useState<DiagramData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchField, setShowSearchField] = useState(true);
  const [lastAction, setLastAction] = useState<"search" | "generate">("search");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { 
    searchCount,
    hasReachedLimit, 
    incrementCount, 
    remainingSearches,
    requiresLogin
  } = useSearchLimit();
  
  const isPremium = profile?.is_premium || false;

  const fetchDiagramsFromWeb = async (searchTerm: string): Promise<DiagramData[]> => {
    console.log("Searching for:", searchTerm);
    
    try {
      const searchResults = await searchGoogleImages(
        searchTerm + " diagram high quality", 
        GOOGLE_SEARCH_API_KEY, 
        GOOGLE_CUSTOM_SEARCH_ID
      );
      
      if (searchResults.length > 0) {
        return searchResults;
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const generateTags = (term: string) => {
        const words = term.toLowerCase().split(" ");
        const baseTags = words.filter(word => word.length > 3);
        return [...new Set([...baseTags, "ai-generated", "custom"])];
      };
      
      const authors = ["DiagramHub", "DiagramExpert", "VisualDocs", "Mermaid", "DrawIO", "LucidChart"];
      
      const mockResults: DiagramData[] = Array.from({ length: 8 }, (_, i) => {
        const titlePrefixes = ["Complete", "Detailed", "Professional", "Simple", "Modern", "Comprehensive"];
        const titleSuffixes = ["Diagram", "Chart", "Visualization", "Model", "Representation", "Layout"];
        
        const prefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
        const suffix = titleSuffixes[Math.floor(Math.random() * titleSuffixes.length)];
        
        const title = `${prefix} ${searchTerm} ${suffix}`;
        
        const imageIndex = i % DIAGRAM_IMAGES.length;
        const imageSrc = DIAGRAM_IMAGES[imageIndex];
        
        const tags = generateTags(searchTerm);
        
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
      throw error;
    }
  };

  const generateDiagramWithAI = async (prompt: string): Promise<DiagramData[]> => {
    console.log("Generating diagram for:", prompt);
    
    // For a real implementation, this would connect to an AI service like OpenAI
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const imagePool = [...DIAGRAM_IMAGES];
    
    const generateTags = (term: string) => {
      const words = term.toLowerCase().split(" ");
      const baseTags = words.filter(word => word.length > 3);
      return [...new Set([...baseTags, "ai-generated", "custom"])];
    };
    
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
    if (mode === "generate" && !isPremium) {
      setShowPremiumDialog(true);
      return;
    }
    
    if (requiresLogin) {
      setShowLoginRequired(true);
      return;
    }
    
    if (hasReachedLimit) {
      setShowPremiumDialog(true);
      return;
    }
    
    if (mode === "search") {
      const success = await incrementCount();
      if (!success) {
        setShowPremiumDialog(true);
        return;
      }
    }
    
    setAiPrompt(prompt);
    setIsLoading(true);
    setLastAction(mode);
    setShowSearchField(false);
    
    try {
      let searchResults: DiagramData[] = [];
      
      if (mode === "search") {
        searchResults = await fetchDiagramsFromWeb(prompt);
        toast.success(`Found ${searchResults.length} diagrams for "${prompt}"`);
        
        if (!isPremium && remainingSearches <= 3 && remainingSearches > 0) {
          toast.warning(`You have ${remainingSearches} searches left today in the free plan!`);
        }
      } else {
        searchResults = await generateDiagramWithAI(prompt);
        toast.success(`Generated ${searchResults.length} diagrams for "${prompt}"`);
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error(`Error ${mode === "search" ? "fetching" : "generating"} diagrams:`, error);
      toast.error(`Error ${mode === "search" ? "searching for" : "generating"} diagrams. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setShowSearchField(true);
    setAiPrompt("");
  };

  const handleSaveDiagram = (diagramId: string | number) => {
    if (!user) {
      setShowLoginRequired(true);
      return;
    }
    
    if (!isPremium) {
      setShowPremiumDialog(true);
      return;
    }
    
    toast.success("Diagram saved to favorites!");
  };

  const handleLoginRedirect = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/auth');
    }
  };

  // Check if the user needs to be prompted for login
  useEffect(() => {
    if (requiresLogin && !user) {
      setShowLoginRequired(true);
    }
  }, [requiresLogin, user]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {showSearchField ? (
          <>
            <HeroSection onSearch={handleAIPrompt} isLoading={isLoading} />
          </>
        ) : (
          <ResultsSection 
            results={results} 
            searchTerm={aiPrompt} 
            onNewSearch={handleNewSearch} 
            isLoading={isLoading}
            lastAction={lastAction}
            onSaveDiagram={handleSaveDiagram}
          />
        )}
      </main>
      
      <Footer />
      
      <PremiumPlanDialog
        open={showPremiumDialog}
        onClose={() => setShowPremiumDialog(false)}
        showLogin={requiresLogin}
        onLoginClick={handleLoginRedirect}
      />
      
      <PremiumPlanDialog
        open={showLoginRequired}
        onClose={() => setShowLoginRequired(false)}
        showLogin={true}
        onLoginClick={handleLoginRedirect}
      />
    </div>
  );
};

export default Index;
