
import { Button } from "@/components/ui/button";
import { DiagramCard } from "./diagram-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, LayoutGrid, Download } from "lucide-react";

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
        <div className="relative w-16 h-16 mb-6">
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-muted-foreground">
          {lastAction === "search" ? "Searching for diagrams..." : "Generating your diagram..."}
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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
              className="gap-2"
              onClick={onNewSearch}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>New Search</span>
            </Button>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-medium"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {lastAction === "search" ? "Results for:" : "Generated for:"} <span className="text-primary">{searchTerm}</span>
          </motion.h2>
        </div>
        
        <motion.div 
          className="flex gap-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span>View</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span>Download All</span>
          </Button>
        </motion.div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
          <TabsTrigger value="infographics">Infographics</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {results.map((diagram, index) => (
              <motion.div
                key={diagram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {results.filter((_, index) => index % 2 === 0).map((diagram, index) => (
              <motion.div
                key={diagram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {results.filter((_, index) => index % 3 === 0).map((diagram, index) => (
              <motion.div
                key={diagram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {results.filter((_, index) => index % 4 === 0).map((diagram, index) => (
              <motion.div
                key={diagram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
    </motion.div>
  );
}
