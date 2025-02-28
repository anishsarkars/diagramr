
import { Button } from "@/components/ui/button";
import { AIInput } from "@/components/ai-input";
import { useState } from "react";
import { AnimatedContainer } from "@/components/animated-container";
import { DiagramCard } from "@/components/diagram-card";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";

// Sample diagram data
const DIAGRAM_DATA = [
  {
    id: 1,
    title: "Cloud Computing Architecture",
    imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    author: "Anish Sarkar",
    authorUsername: "anishsarkar",
    tags: ["cloud", "architecture", "infrastructure"],
  },
  {
    id: 2,
    title: "Cloud Computing Diagram",
    imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    author: "Anish",
    authorUsername: "anish",
    tags: ["cloud", "computing", "saas"],
  },
  {
    id: 3,
    title: "Cloud Infrastructure Components",
    imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    author: "GFG",
    authorUsername: "GFG",
    tags: ["cloud", "paas", "iaas"],
  },
  {
    id: 4,
    title: "Service Layers Diagram",
    imageSrc: "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    author: "Sarkar",
    authorUsername: "sarkar",
    tags: ["service", "layers", "cloud"],
  },
];

const Index = () => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [results, setResults] = useState(DIAGRAM_DATA);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const handleAIPrompt = (prompt: string) => {
    setAiPrompt(prompt);
    setIsSearching(true);
    
    // Simulate search results (in a real app, this would call an API)
    setTimeout(() => {
      // For now we just use the sample data
      setResults(DIAGRAM_DATA);
      setIsSearching(false);
    }, 1500);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col h-full">
          <AnimatedContainer className="p-6 flex flex-col items-center justify-center min-h-[40vh]">
            <div className="mb-8 mt-12">
              <Logo showText className="scale-150" />
            </div>
            
            <h1 className="text-3xl font-semibold mb-4 text-center">AI-Powered Diagram Platform</h1>
            <p className="text-muted-foreground mb-8 text-center max-w-lg">
              Describe the diagram you need, and our AI will find or generate it for you.
            </p>
            
            <div className="w-full max-w-3xl mb-8">
              <AIInput 
                onSubmit={handleAIPrompt} 
                className="w-full shadow-lg"
                placeholder="Describe the diagram you need (e.g., 'UML class diagram for e-commerce system')"
              />
            </div>
            
            {isSearching ? (
              <div className="flex flex-col items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Searching for the perfect diagram...</p>
              </div>
            ) : aiPrompt ? (
              <div className="w-full max-w-6xl">
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-2">Results for: <span className="text-primary">{aiPrompt}</span></h2>
                  <p className="text-muted-foreground">Found {results.length} diagrams that match your description.</p>
                </div>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All Diagrams</TabsTrigger>
                    <TabsTrigger value="uml" onClick={() => setActiveTab("uml")}>UML</TabsTrigger>
                    <TabsTrigger value="flowcharts" onClick={() => setActiveTab("flowcharts")}>Flowcharts</TabsTrigger>
                    <TabsTrigger value="architecture" onClick={() => setActiveTab("architecture")}>Architecture</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 py-4"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {results.map((diagram, index) => (
                        <motion.div key={diagram.id} variants={item} custom={index}>
                          <DiagramCard
                            title={diagram.title}
                            imageSrc={diagram.imageSrc}
                            author={diagram.author}
                            authorUsername={diagram.authorUsername}
                            tags={diagram.tags}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent value="uml" className="mt-0">
                    <AnimatedContainer className="flex flex-col items-center justify-center py-16">
                      <p className="text-muted-foreground mb-4">No UML diagrams found for this search</p>
                      <Button variant="outline">Generate UML Diagram with AI <Sparkles className="ml-2 h-4 w-4" /></Button>
                    </AnimatedContainer>
                  </TabsContent>
                  
                  <TabsContent value="flowcharts" className="mt-0">
                    <AnimatedContainer className="flex flex-col items-center justify-center py-16">
                      <p className="text-muted-foreground mb-4">No flowchart diagrams found for this search</p>
                      <Button variant="outline">Generate Flowchart with AI <Sparkles className="ml-2 h-4 w-4" /></Button>
                    </AnimatedContainer>
                  </TabsContent>
                  
                  <TabsContent value="architecture" className="mt-0">
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 py-4"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {results.filter(d => d.tags.includes("architecture")).map((diagram, index) => (
                        <motion.div key={diagram.id} variants={item} custom={index}>
                          <DiagramCard
                            title={diagram.title}
                            imageSrc={diagram.imageSrc}
                            author={diagram.author}
                            authorUsername={diagram.authorUsername}
                            tags={diagram.tags}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-6">
                <h3 className="text-xl font-medium mb-4">Popular Diagram Types</h3>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                  {["UML Class Diagram", "Sequence Diagram", "Flowchart", "ER Diagram", 
                    "Cloud Architecture", "Network Diagram", "Data Flow", "State Machine"].map((type) => (
                    <Button 
                      key={type} 
                      variant="outline" 
                      className="mb-2"
                      onClick={() => handleAIPrompt(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </AnimatedContainer>
        </div>
      </main>
    </div>
  );
};

export default Index;
