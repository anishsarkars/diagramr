
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

interface PopularSearchesProps {
  onSelect: (query: string) => void;
}

export function PopularSearches({ onSelect }: PopularSearchesProps) {
  const [popularSearches, setPopularSearches] = useState<string[]>([
    "Human anatomy diagrams",
    "Circuit design",
    "UML class diagrams",
    "Entity relationship diagrams",
    "Flow charts",
    "Mind maps",
    "Network topology",
    "Physics concepts"
  ]);

  // Effect to simulate fetching trending searches
  useEffect(() => {
    // This would be replaced with an actual API call in production
    const mockPopularSearches = [
      "Human anatomy diagrams",
      "Circuit design",
      "UML class diagrams",
      "Entity relationship diagrams", 
      "Flow charts",
      "Mind maps",
      "Network topology",
      "Physics concepts"
    ];
    
    setPopularSearches(mockPopularSearches);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full mt-8"
    >
      <div className="flex items-center justify-center mb-4 gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">Popular Searches</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {popularSearches.map((search, index) => (
          <motion.div
            key={search}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            className="relative overflow-hidden group"
            onClick={() => onSelect(search)}
          >
            <div className="glass-card border border-primary/10 p-3 rounded-xl cursor-pointer h-full flex items-center justify-center bg-background/30 backdrop-blur-sm">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/5 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <div className="relative z-10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary/70 mr-2" />
                <span className="text-sm truncate">{search}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
