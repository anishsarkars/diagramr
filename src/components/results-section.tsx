
import { Button } from "@/components/ui/button";
import { DiagramCard } from "./diagram-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, LayoutGrid, Download, BookOpen } from "lucide-react";
import { BuiltByBadge } from "./built-by-badge";

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

interface ResultsSectionProps {
  results: DiagramData[];
  searchTerm: string;
  onNewSearch: () => void;
  isLoading: boolean;
  lastAction: "search" | "generate";
}

export function ResultsSection({ results, searchTerm, onNewSearch, isLoading, lastAction }: ResultsSectionProps) {
  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center py-16">
        <div className="relative w-12 h-12 mb-4">
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {lastAction === "search" ? "Searching for diagrams..." : "Generating your diagram..."}
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <motion.div 
            className="flex items-center gap-2 mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-xs p-2 h-8"
              onClick={onNewSearch}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>New Search</span>
            </Button>
          </motion.div>
          
          <motion.h2 
            className="text-xl font-medium"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {lastAction === "search" ? "Results for:" : "Generated for:"} <span className="text-primary">{searchTerm}</span>
          </motion.h2>
          
          <motion.p
            className="text-xs text-muted-foreground mt-1"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Click on any diagram to enlarge and study in detail
          </motion.p>
        </div>
        
        <motion.div 
          className="flex gap-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>View</span>
          </Button>
          <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-8 bg-secondary/60">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Study Mode</span>
          </Button>
        </motion.div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 bg-background/40 backdrop-blur-md">
          <TabsTrigger value="all" className="text-xs">All Results</TabsTrigger>
          <TabsTrigger value="diagrams" className="text-xs">Diagrams</TabsTrigger>
          <TabsTrigger value="infographics" className="text-xs">Infographics</TabsTrigger>
          <TabsTrigger value="charts" className="text-xs">Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2">
            {results.map((diagram, index) => (
              <motion.div
                key={diagram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <DiagramCard
                  title={diagram.title}
                  imageSrc={diagram.imageSrc}
                  author={diagram.author}
                  authorUsername={diagram.authorUsername}
                  tags={diagram.tags}
                  sourceUrl={diagram.sourceUrl}
                  isGenerated={diagram.isGenerated}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="diagrams" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2">
            {results.filter((_, index) => index % 2 === 0).map((diagram, index) => (
              <motion.div
                key={diagram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <DiagramCard
                  title={diagram.title}
                  imageSrc={diagram.imageSrc}
                  author={diagram.author}
                  authorUsername={diagram.authorUsername}
                  tags={diagram.tags}
                  sourceUrl={diagram.sourceUrl}
                  isGenerated={diagram.isGenerated}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="infographics" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2">
            {results.filter((_, index) => index % 3 === 0).map((diagram, index) => (
              <motion.div
                key={diagram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <DiagramCard
                  title={diagram.title}
                  imageSrc={diagram.imageSrc}
                  author={diagram.author}
                  authorUsername={diagram.authorUsername}
                  tags={diagram.tags}
                  sourceUrl={diagram.sourceUrl}
                  isGenerated={diagram.isGenerated}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="charts" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2">
            {results.filter((_, index) => index % 4 === 0).map((diagram, index) => (
              <motion.div
                key={diagram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <DiagramCard
                  title={diagram.title}
                  imageSrc={diagram.imageSrc}
                  author={diagram.author}
                  authorUsername={diagram.authorUsername}
                  tags={diagram.tags}
                  sourceUrl={diagram.sourceUrl}
                  isGenerated={diagram.isGenerated}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <BuiltByBadge position="bottom-right" />
    </motion.div>
  );
}
