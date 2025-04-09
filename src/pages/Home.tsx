import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SparklesIcon, SearchIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { SearchBox } from "@/components/search-box";
import { Compact3DMarquee } from "@/components/3d-marquee";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [typingInProgress, setTypingInProgress] = useState(false);
  const [showTypingSuggestions, setShowTypingSuggestions] = useState(false);
  const [typingSuggestions, setTypingSuggestions] = useState<string[]>([]);
  const sampleImages = []; // You'll need to populate this with your sample images

  const handleSearch = (searchQuery: string) => {
    // Implement your search logic here
    console.log("Searching for:", searchQuery);
  };

  return (
    <main className="flex-1 relative">
    {/* Hero section */}
    <section className="relative overflow-hidden py-20 sm:py-24 md:py-28">
      <div className="container px-4 relative z-10">
        {/* Background gradient */}
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-background to-transparent z-0"></div>
        
        <div className="relative mx-auto max-w-5xl">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-6 md:gap-12 items-center">
            {/* Left column - Heading & search */}
            <div className="relative order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col space-y-4 md:pr-6 lg:pr-12 text-left"
              >
                <Badge
                  variant="outline"
                  className="w-fit mb-2 border-primary/30 bg-primary/5 text-primary px-3 py-1"
                >
                  <SparklesIcon className="h-3.5 w-3.5 mr-1.5" /> Educational Diagrams
                </Badge>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-4"
                >
                  <a
                    href="https://www.producthunt.com/posts/diagramr?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-diagramr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-90 transition-opacity"
                  >
                    <img
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=950719&theme=light&t=1744154655943"
                      alt="Diagramr - Fastest way to find any diagram ✦ Google Images Sucks!"
                      width="250"
                      height="54"
                      style={{ width: '250px', height: '54px' }}
                    />
                  </a>
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-right md:text-left mr-0 md:mr-8">
                  Discover<br className="hidden sm:block" /> Diagrams that<br className="hidden sm:block" /> 
                  <span className="relative">
                    <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
                      Matter
                    </span>
                    <span className="absolute -bottom-1.5 left-0 right-0 h-3 bg-primary/10 rounded-full blur-sm"></span>
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg pr-4 md:pr-0">
                  Find the perfect educational diagrams to enhance your learning and teaching experience.
                </p>
                
                <div className="relative pt-4">
                  <SearchBox onSearch={handleSearch} />
                  
                  {typingInProgress && (
                    <div className="flex items-center gap-2 mt-3 ml-1 text-sm text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                      <span>Suggestions will appear as you type...</span>
                    </div>
                  )}
                </div>
                
                {showTypingSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bg-background border border-border/50 rounded-lg shadow-lg p-2 absolute z-20 left-0 right-0 top-[7.5rem] md:right-12"
                  >
                    <div className="flex flex-col space-y-1">
                      {typingSuggestions.map((suggestion, index) => (
                        <Button
                          key={suggestion}
                          variant="ghost"
                          className="justify-start text-sm h-9 px-3 rounded-md"
                          onClick={() => {
                            setQuery(suggestion);
                            setShowTypingSuggestions(false);
                            handleSearch(suggestion);
                          }}
                        >
                          <SearchIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
            
            {/* Right column - 3D Marquee */}
            <div className="md:order-2 order-1 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.2, 0.9, 0.3, 1] }}
                className="relative w-full h-[260px] xs:h-[280px] sm:h-[340px] md:h-[420px] lg:h-[480px] overflow-visible"
              >
                {/* Side fade gradients - thinner and more subtle for minimal design */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none opacity-40 md:opacity-25"></div>
                <div className="absolute inset-x-0 top-0 h-8 md:h-10 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-x-0 bottom-0 h-8 md:h-10 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
                
                {/* Futuristic background elements */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-gradient-radial from-primary/5 to-transparent blur-3xl"></div>
                </div>
                
                {/* Extended marquee with better spacing */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Compact3DMarquee
                    images={sampleImages}
                    className="w-full h-full scale-[1.18] xs:scale-[1.2] sm:scale-[1.22] md:scale-[1.25] lg:scale-[1.3]"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ... rest of existing code ... */}
  </main>
  );
} 