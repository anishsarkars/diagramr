
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarNav } from "@/components/sidebar-nav";
import { SearchBar } from "@/components/search-bar";
import { DiagramCard } from "@/components/diagram-card";
import { AIInput } from "@/components/ai-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AnimatedContainer } from "@/components/animated-container";
import { motion } from "framer-motion";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    setSearchQuery(query);
    // In a real app, we would fetch results based on the query
  };

  const handleAIPrompt = (prompt: string) => {
    console.log("AI Prompt:", prompt);
    // In a real app, we would send this to an AI service and get a response
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
    <div className="flex h-screen min-h-screen w-full overflow-hidden bg-background">
      <SidebarNav />
      
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col h-full">
          <AnimatedContainer className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Cloud Computing Diagram</h1>
            <SearchBar onSearch={handleSearch} className="mx-auto mb-8" />
            
            <Tabs defaultValue="all" className="w-full max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="all" onClick={() => setActiveTab("all")}>All Diagrams</TabsTrigger>
                  <TabsTrigger value="uml" onClick={() => setActiveTab("uml")}>UML</TabsTrigger>
                  <TabsTrigger value="flowcharts" onClick={() => setActiveTab("flowcharts")}>Flowcharts</TabsTrigger>
                  <TabsTrigger value="architecture" onClick={() => setActiveTab("architecture")}>Architecture</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-muted/50">
                    <span className="text-muted-foreground mr-1">Tags:</span> cc
                  </Badge>
                  <Badge variant="outline" className="bg-muted/50">
                    <span className="text-muted-foreground mr-1">Tags:</span> cloud infra
                  </Badge>
                </div>
              </div>
              
              <TabsContent value="all" className="mt-0">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 py-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {DIAGRAM_DATA.map((diagram, index) => (
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
                  <Button variant="outline">Browse UML Templates</Button>
                </AnimatedContainer>
              </TabsContent>
              
              <TabsContent value="flowcharts" className="mt-0">
                <AnimatedContainer className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground mb-4">No flowchart diagrams found for this search</p>
                  <Button variant="outline">Browse Flowchart Templates</Button>
                </AnimatedContainer>
              </TabsContent>
              
              <TabsContent value="architecture" className="mt-0">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 py-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {DIAGRAM_DATA.filter(d => d.tags.includes("architecture")).map((diagram, index) => (
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
          </AnimatedContainer>
          
          <div className="mt-auto p-6 border-t border-border">
            <AIInput onSubmit={handleAIPrompt} className="max-w-3xl mx-auto" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
