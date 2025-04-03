
import { useState, useEffect, useCallback } from "react";
import { useInfiniteSearch } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { useSearchLimit } from "@/hooks/use-search-limit";
import { useAuth } from "@/components/auth-context";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ConfettiCelebration } from "@/components/confetti-celebration";
import { DiagramResult } from "@/hooks/use-infinite-search";
import { Loader2, Search, Heart, MoveRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateDiagramWithGemini } from "@/utils/geminiImageGenerator";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ChatDashboard() {
  const [likedDiagrams, setLikedDiagrams] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{id: string, url: string, prompt: string}[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { incrementCount, hasReachedLimit, remainingSearches } = useSearchLimit();
  const isMobile = useIsMobile();
  
  const { 
    results,
    isLoading,
    hasMore,
    loadMore,
    searchTerm,
    searchFor,
    resetSearch
  } = useInfiniteSearch({
    pageSize: 9
  });
  
  useEffect(() => {
    // Check if user just logged in
    const lastLoginCelebration = localStorage.getItem('last-login-celebration');
    const now = Date.now();
    
    if (user && (!lastLoginCelebration || now - parseInt(lastLoginCelebration) > 60 * 60 * 1000)) {
      setShowCelebration(true);
      localStorage.setItem('last-login-celebration', now.toString());
      
      // Auto-hide after animation
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }
    
    // Fetch liked diagrams
    if (user) {
      fetchLikedDiagrams();
    }
  }, [user]);

  useEffect(() => {
    // Generate search suggestions based on input
    if (searchInput.length >= 2) {
      generateSearchSuggestions(searchInput);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchInput]);
  
  const generateSearchSuggestions = (input: string) => {
    // Basic suggestions for common diagram types
    const suggestions = [
      "flowchart",
      "sequence diagram",
      "entity relationship diagram",
      "UML class diagram",
      "process flow",
      "mindmap",
      "gantt chart",
      "network diagram",
      "data flow diagram",
      "state diagram"
    ];
    
    // Filter suggestions based on input
    const filtered = suggestions.filter(s => 
      s.toLowerCase().includes(input.toLowerCase()) && 
      s.toLowerCase() !== input.toLowerCase()
    );
    
    // Generate more contextual suggestions
    let contextual = [];
    if (input.includes("flow")) {
      contextual.push("workflow diagram", "data flow diagram", "process flow");
    } else if (input.includes("class")) {
      contextual.push("UML class diagram", "class hierarchy", "object diagram");
    } else if (input.includes("data")) {
      contextual.push("database schema", "entity relationship diagram", "data flow");
    } else if (input.includes("network")) {
      contextual.push("network topology", "system architecture", "cloud infrastructure");
    }
    
    // Combine and deduplicate
    const all = [...filtered, ...contextual];
    const unique = Array.from(new Set(all));
    
    setSearchSuggestions(unique.slice(0, 5));
  };
  
  const fetchLikedDiagrams = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_diagrams')
        .select('diagram_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        const likedIds = new Set(data.map(item => item.diagram_id));
        setLikedDiagrams(likedIds);
      }
    } catch (error) {
      console.error('Error fetching liked diagrams:', error);
    }
  };
  
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    if (hasReachedLimit) {
      toast.info("You've reached your daily search limit!", {
        description: "Upgrade to Pro for 50+ searches per day",
        action: {
          label: "Upgrade",
          onClick: () => navigate("/pricing")
        }
      });
      return;
    }
    
    const success = await incrementCount();
    if (!success) return;
    
    setSearchInput("");
    setSearchSuggestions([]);
    
    try {
      await searchFor(query);
      
      // Update search history
      const savedHistory = localStorage.getItem('diagramr-search-history');
      let history: string[] = [];
      
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
        } catch (e) {
          console.error('Error parsing search history:', e);
        }
      }
      
      const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 10);
      localStorage.setItem('diagramr-search-history', JSON.stringify(newHistory));
      
      // Show remaining searches info
      if (remainingSearches <= 5 && remainingSearches > 0) {
        toast.info(`${remainingSearches} searches remaining today`, {
          description: user ? "Upgrade for unlimited searches" : "Sign in for more searches/day"
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again or use different terms.");
    }
  };
  
  const handleGenerateImage = async () => {
    if (!searchInput) {
      toast.error("Please enter a prompt for diagram generation");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const imageUrl = await generateDiagramWithGemini({ 
        prompt: searchInput,
        detailedPrompt: true
      });
      
      if (imageUrl) {
        setGeneratedImages(prev => [
          { id: `gen-${Date.now()}`, url: imageUrl, prompt: searchInput },
          ...prev
        ]);
        
        toast.success("AI diagram generated successfully!");
        setSearchInput("");
      } else {
        toast.error("Failed to generate diagram. Please try a different prompt.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Image generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleLikeDiagram = async (diagramId: string | number) => {
    if (!user) {
      toast.info("Please sign in to save diagrams");
      return;
    }
    
    try {
      const diagramToLike = results.find(r => r.id === diagramId);
      if (diagramToLike) {
        const isLiked = likedDiagrams.has(String(diagramId));
        
        if (isLiked) {
          const { error } = await supabase
            .from('saved_diagrams')
            .delete()
            .eq('user_id', user.id)
            .eq('diagram_id', String(diagramId));
          
          if (error) throw error;
          
          const newLiked = new Set(likedDiagrams);
          newLiked.delete(String(diagramId));
          setLikedDiagrams(newLiked);
          
          toast.success("Diagram removed from favorites");
        } else {
          const diagramData = {
            id: String(diagramToLike.id),
            title: diagramToLike.title,
            imageSrc: diagramToLike.imageSrc,
            author: diagramToLike.author || "",
            authorUsername: diagramToLike.authorUsername || "",
            tags: diagramToLike.tags || [],
            sourceUrl: diagramToLike.sourceUrl || "",
            isGenerated: diagramToLike.isGenerated || false
          };
          
          const { error } = await supabase
            .from('saved_diagrams')
            .insert({
              user_id: user.id,
              diagram_id: String(diagramId),
              diagram_data: diagramData
            });
          
          if (error) throw error;
          
          const newLiked = new Set(likedDiagrams);
          newLiked.add(String(diagramId));
          setLikedDiagrams(newLiked);
          
          toast.success("Diagram saved to favorites");
        }
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      toast.error('Failed to update liked diagrams');
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    setSearchSuggestions([]);
    handleSearch(suggestion);
  };
  
  const filteredResults = selectedTagFilter
    ? results.filter(result => result.tags && result.tags.includes(selectedTagFilter))
    : results;

  return (
    <DashboardLayout>
      {showCelebration && (
        <ConfettiCelebration 
          duration={2000} 
          particleCount={30}
          intensity="low"
        />
      )}
      
      <div className="container max-w-6xl py-4 px-4 md:px-8">
        {/* Chat-like search interface */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="rounded-2xl bg-muted/20 p-8 backdrop-blur-sm border border-border/10 shadow-sm">
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-bold mb-4">Diagramr AI</h1>
              
              <div className="flex gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-secondary/50 rounded-xl p-3 text-sm max-w-[80%]">
                  What kind of diagram are you looking for today?
                </div>
              </div>
              
              <div className="mt-4 flex items-end gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      placeholder="Search for diagrams or ask to generate one..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(searchInput);
                        }
                      }}
                      className="pr-20"
                    />
                    {searchInput && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 text-muted-foreground"
                        onClick={() => setSearchInput('')}
                      >
                        Clear
                      </Button>
                    )}
                    
                    {/* Search suggestions */}
                    {searchSuggestions.length > 0 && (
                      <div className="absolute mt-1 w-full bg-background rounded-lg border border-border/10 shadow-md z-10">
                        {searchSuggestions.map((suggestion, index) => (
                          <div 
                            key={index}
                            className="p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={() => handleSearch(searchInput)} disabled={isLoading || !searchInput}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleGenerateImage} 
                  disabled={isGenerating || !searchInput}
                  className="gap-2"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {!isMobile && "Generate"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results in bento grid */}
        {(searchTerm || generatedImages.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {searchTerm && (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">
                  Results for "<span className="text-primary">{searchTerm}</span>"
                </h2>
                {selectedTagFilter && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTagFilter(null)}
                    className="text-xs"
                  >
                    Clear filter: {selectedTagFilter}
                  </Button>
                )}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Searching for diagrams...</p>
              </div>
            ) : filteredResults.length === 0 && generatedImages.length === 0 ? (
              searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted/30 rounded-full p-6 mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6 max-w-lg">
                    We couldn't find any diagrams for "{searchTerm}". Try a different search term or generate an AI diagram.
                  </p>
                  <Button onClick={handleGenerateImage} disabled={isGenerating} className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-8">
                {/* Generated images */}
                {generatedImages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Generated Diagrams
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generatedImages.map(image => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="aspect-[4/3] overflow-hidden rounded-xl border border-border/10 bg-muted/20 hover:shadow-lg transition-shadow"
                        >
                          <div className="relative h-full">
                            <img 
                              src={image.url} 
                              alt={image.prompt}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <p className="text-white text-sm truncate">
                                {image.prompt}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Search Results */}
                {filteredResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Search className="h-4 w-4 text-primary" />
                      Search Results
                    </h3>
                    
                    {/* Tags filter row */}
                    {filteredResults.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.from(new Set(filteredResults.flatMap(r => r.tags || []))).slice(0, 8).map(tag => (
                          <Button
                            key={tag}
                            variant={selectedTagFilter === tag ? "default" : "outline"} 
                            size="sm"
                            className="text-xs rounded-full h-7"
                            onClick={() => setSelectedTagFilter(tag === selectedTagFilter ? null : tag)}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <AnimatePresence>
                        {filteredResults.map((result, index) => (
                          <motion.div
                            key={`${result.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                            className="flex flex-col h-full"
                          >
                            <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200 border-border/10">
                              <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
                                <img 
                                  src={result.imageSrc} 
                                  alt={result.title} 
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm",
                                    likedDiagrams.has(String(result.id)) ? "text-destructive" : "text-muted-foreground"
                                  )}
                                  onClick={() => handleLikeDiagram(result.id)}
                                >
                                  <Heart className={cn(
                                    "h-4 w-4",
                                    likedDiagrams.has(String(result.id)) && "fill-destructive"
                                  )} />
                                </Button>
                              </div>
                              <div className="p-3 flex-1 flex flex-col">
                                <h4 className="font-medium line-clamp-2 mb-2">{result.title}</h4>
                                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                                  {(result.tags || []).slice(0, 3).map((tag, i) => (
                                    <Button
                                      key={i}
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                      onClick={() => setSelectedTagFilter(tag)}
                                    >
                                      #{tag}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    {/* Load more button */}
                    {hasMore && (
                      <div className="flex justify-center mt-8">
                        <Button
                          variant="outline"
                          onClick={loadMore}
                          className="gap-2"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Load more
                              <MoveRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
        
        {/* Initial state */}
        {!searchTerm && filteredResults.length === 0 && generatedImages.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="max-w-md">
              <h2 className="text-2xl font-bold mb-4">Find or Generate Diagrams</h2>
              <p className="text-muted-foreground mb-8">
                Search for educational diagrams or use our AI to generate custom diagrams for your needs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["flow chart", "entity relationship", "sequence diagram", "UML class diagram"].map((term, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    className="text-sm justify-start"
                    onClick={() => handleSearch(term)}
                  >
                    <Search className="h-3 w-3 mr-2" />
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
