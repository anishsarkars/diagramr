
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Mic, 
  Image, 
  Camera, 
  Newspaper, 
  Database, 
  Network, 
  PieChart,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-context";

interface PersonalizedHomeProps {
  onSearch: (query: string) => void;
}

export function PersonalizedHome({ onSearch }: PersonalizedHomeProps) {
  const [query, setQuery] = useState("");
  const [greeting, setGreeting] = useState("Hello");
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || "there";
  const firstName = userName.split(" ")[0];
  
  // Get recent searches from localStorage
  const getRecentSearches = () => {
    const savedHistory = localStorage.getItem('diagramr-search-history');
    let history: string[] = [];
    
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        console.error('Error parsing search history:', e);
      }
    }
    
    return history.slice(0, 5);
  };
  
  // Set appropriate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  // Example categories that would be useful for diagram searches
  const categories = [
    { 
      name: "Database Diagrams", 
      icon: <Database className="h-5 w-5 text-green-500" />,
      colorClass: "bg-green-100 dark:bg-green-900/20"
    },
    { 
      name: "Network Charts", 
      icon: <Network className="h-5 w-5 text-orange-500" />,
      colorClass: "bg-orange-100 dark:bg-orange-900/20"
    },
    { 
      name: "DSA Visualizations", 
      icon: <Code className="h-5 w-5 text-indigo-500" />,
      colorClass: "bg-indigo-100 dark:bg-indigo-900/20"
    },
    { 
      name: "Analytics", 
      icon: <PieChart className="h-5 w-5 text-red-500" />,
      colorClass: "bg-red-100 dark:bg-red-900/20"
    }
  ];

  const handleSearch = () => {
    if (query.trim()) {
      // Save to search history
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
      
      onSearch(query);
    }
  };

  const handleCategoryClick = (category: string) => {
    onSearch(category);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main content */}
      <div className="flex-1 container max-w-md mx-auto px-3 sm:px-4 pt-6 sm:pt-8 pb-24">
        {/* Greeting */}
        <motion.div 
          className="text-center mb-6 sm:mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="text-xl sm:text-2xl font-medium text-foreground mb-1">
            {greeting}, {firstName}.
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            How can I help you today?
          </p>
        </motion.div>

        {/* Recent searches */}
        {getRecentSearches().length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-sm font-medium text-foreground mb-2">
              Recent searches
            </h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {getRecentSearches().map((search, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted px-3 py-1.5 text-xs"
                  onClick={() => onSearch(search)}
                >
                  <Search className="h-3 w-3 mr-1 text-muted-foreground" />
                  {search}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Categories */}
        <motion.div 
          className="grid grid-cols-2 xs:grid-cols-2 gap-2 sm:gap-4 mb-6 sm:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              className={cn(
                "flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl",
                "border border-border/30 backdrop-blur-sm transition-all",
                "hover:border-primary/20 hover:shadow-sm",
                category.colorClass
              )}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                transition: { delay: 0.2 + (index * 0.1), duration: 0.5 } 
              }}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="mb-1.5 sm:mb-2">
                {category.icon}
              </div>
              <span className="text-xs font-medium text-foreground line-clamp-1">
                {category.name}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Additional suggestion section */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-sm font-medium text-foreground mb-2 sm:mb-3">
            Suggested searches
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {["ER Diagram", "Class Diagram", "Sequence Diagram", "Flow Chart", "Mind Map"].map((tag) => (
              <Badge 
                key={tag}
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/80 text-xs sm:text-sm py-1 px-2 sm:px-3"
                onClick={() => onSearch(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fixed search bar at bottom */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-background backdrop-blur-md border-t border-border/30 p-3 sm:p-4 pb-6 sm:pb-8 z-50 fixed-bottom safe-bottom"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="container max-w-md mx-auto">
          <div className="relative flex items-center">
            <div className="absolute left-3 sm:left-4 text-muted-foreground">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <Input
              type="text"
              placeholder="Search for diagrams..."
              className="pr-16 sm:pr-24 pl-10 sm:pl-12 py-5 sm:py-6 w-full text-sm sm:text-base bg-card/60 border-border/20 focus:border-primary rounded-full shadow-sm mobile-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
              <button 
                className="p-1 sm:p-1.5 rounded-full hover:bg-muted touch-feedback"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
