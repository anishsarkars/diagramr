
import { useState, useEffect, useRef, useCallback } from "react";
import { HeroSection } from "@/components/hero-section";
import { ResultsSection } from "@/components/results-section";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";
import { useNavigate } from "react-router-dom";
import { useInfiniteSearch } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { generateDiagramWithGemini } from "@/utils/geminiImageGenerator";

const Index = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const [showSearchField, setShowSearchField] = useState(true);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { 
    hasReachedLimit, 
    incrementCount, 
    requiresLogin,
    hasReachedGenerationLimit,
    incrementGenerationCount
  } = useSearchLimit();
  
  const { 
    results,
    isLoading,
    hasMore,
    loadMore,
    searchTerm,
    searchFor,
    lastAction,
    resetSearch
  } = useInfiniteSearch();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastResultRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore]);

  const handleAIPrompt = async (prompt: string, mode: "search" | "generate") => {
    if (requiresLogin) {
      setShowLoginRequired(true);
      return;
    }

    let canProceed = false;
    
    if (mode === "search") {
      if (hasReachedLimit) {
        setShowPremiumDialog(true);
        return;
      }
      
      canProceed = await incrementCount();
      if (!canProceed) {
        setShowPremiumDialog(true);
        return;
      }
    } else if (mode === "generate") {
      if (hasReachedGenerationLimit) {
        setShowPremiumDialog(true);
        return;
      }
      
      canProceed = await incrementGenerationCount();
      if (!canProceed) {
        setShowPremiumDialog(true);
        return;
      }
    }
    
    setShowSearchField(false);
    
    if (mode === "generate") {
      try {
        // Show loading state
        toast.loading("Generating your diagram...");
        
        // Generate the image
        const imageUrl = await generateDiagramWithGemini(prompt);
        
        if (imageUrl) {
          // Create a result with the generated image
          const generatedResult = {
            id: `gen-${Date.now()}`,
            title: `AI-Generated: ${prompt}`,
            imageSrc: imageUrl,
            author: "Diagramr AI",
            authorUsername: "diagramr",
            tags: prompt.split(" ").filter(tag => tag.length > 3).slice(0, 5),
            sourceUrl: "#",
            isGenerated: true
          };
          
          // Set the results
          await searchFor(prompt, "generate", [generatedResult]);
          toast.dismiss();
          toast.success("Diagram generated successfully!");
        } else {
          toast.dismiss();
          toast.error("Could not generate diagram. Please try again.");
          resetSearch();
          setShowSearchField(true);
        }
      } catch (error) {
        console.error("Generation error:", error);
        toast.dismiss();
        toast.error("Generation failed. Please try again.");
        resetSearch();
        setShowSearchField(true);
      }
    } else {
      // Regular search
      await searchFor(prompt, "search");
    }
  };

  const handleNewSearch = () => {
    setShowSearchField(true);
    resetSearch();
  };

  const handleLoginRedirect = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/auth');
    }
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
            searchTerm={searchTerm} 
            onNewSearch={handleNewSearch} 
            isLoading={isLoading}
            lastAction={lastAction}
            lastResultRef={lastResultRef}
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
