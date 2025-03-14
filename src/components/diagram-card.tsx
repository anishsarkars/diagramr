
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ExternalLink, 
  Heart, 
  Bookmark, 
  Share2, 
  Maximize2, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface DiagramCardProps {
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  sourceUrl?: string;
  tags?: string[];
  className?: string;
  aspectRatio?: number;
  isGenerated?: boolean;
}

export function DiagramCard({
  title,
  imageSrc,
  author,
  authorUsername,
  sourceUrl,
  tags = [],
  className,
  aspectRatio = 16 / 9,
  isGenerated = false,
}: DiagramCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "diagram-card group relative rounded-xl overflow-hidden border border-border/40 bg-card shadow-sm",
        className
      )}
    >
      <div className="diagram-card-image relative">
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer">
              <AspectRatio ratio={aspectRatio}>
                <img
                  src={imageSrc}
                  alt={title}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </AspectRatio>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl p-2 border-border/30 bg-card/95 backdrop-blur-xl">
            <div className="relative">
              <img 
                src={imageSrc} 
                alt={title} 
                className="w-full h-auto rounded-lg object-contain max-h-[80vh]"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute top-2 right-2 z-50">
                <Button variant="ghost" size="icon" className="rounded-full bg-background/40 backdrop-blur-sm hover:bg-background/60">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-2 right-2 z-50 flex gap-2">
                <Button variant="secondary" size="sm" className="gap-1.5 bg-background/40 backdrop-blur-sm hover:bg-background/60">
                  <Download className="h-3.5 w-3.5" />
                  <span className="text-xs">Download</span>
                </Button>
                <Button variant="secondary" size="sm" className="gap-1.5 bg-background/40 backdrop-blur-sm hover:bg-background/60">
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="text-xs">Share</span>
                </Button>
              </div>
              <div className="absolute bottom-2 left-2">
                <h3 className="text-sm font-medium bg-background/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  {title}
                </h3>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {isGenerated && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="default" className="bg-primary text-white backdrop-blur-sm shadow-sm text-xs">
              AI Generated
            </Badge>
          </div>
        )}
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Button size="sm" variant="secondary" className="gap-1.5 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 text-xs p-2 h-auto" asChild>
              <a href={sourceUrl || "#"} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                <span>View Source</span>
              </a>
            </Button>
            
            <div className="flex gap-1.5">
              <Button 
                size="icon" 
                variant="secondary" 
                className={cn("bg-white/20 backdrop-blur-md hover:bg-white/30 h-7 w-7", 
                  isLiked ? "text-red-500 hover:text-red-400" : "text-white")}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className="h-3.5 w-3.5" fill={isLiked ? "currentColor" : "none"} />
              </Button>
              <Button 
                size="icon" 
                variant="secondary" 
                className={cn("bg-white/20 backdrop-blur-md hover:bg-white/30 h-7 w-7", 
                  isSaved ? "text-primary hover:text-primary/90" : "text-white")}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Bookmark className="h-3.5 w-3.5" fill={isSaved ? "currentColor" : "none"} />
              </Button>
              <DialogTrigger asChild>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 h-7 w-7 text-white"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal bg-secondary/40 px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal px-1.5 py-0">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        {author && (
          <div className="mt-2 flex items-center">
            <p className="text-xs text-muted-foreground">by <span className="font-medium">@{authorUsername || author.toLowerCase()}</span></p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
