
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Heart, Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

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
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "diagram-card group relative rounded-xl overflow-hidden border border-border/50 bg-card shadow-md",
        className
      )}
    >
      <div className="diagram-card-image relative">
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
        
        {isGenerated && (
          <div className="absolute top-3 left-3">
            <Badge variant="default" className="bg-primary text-white backdrop-blur-sm shadow-md">
              AI Generated
            </Badge>
          </div>
        )}
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <Button size="sm" variant="secondary" className="gap-1 bg-white/20 backdrop-blur-md text-white hover:bg-white/30" asChild>
              <a href={sourceUrl || "#"} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Source</span>
              </a>
            </Button>
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="secondary" 
                className={cn("bg-white/20 backdrop-blur-md hover:bg-white/30", 
                  isLiked ? "text-red-500 hover:text-red-400" : "text-white")}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
              </Button>
              <Button 
                size="icon" 
                variant="secondary" 
                className={cn("bg-white/20 backdrop-blur-md hover:bg-white/30", 
                  isSaved ? "text-primary hover:text-primary/90" : "text-white")}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
              </Button>
            </div>
          </div>
          
          <motion.div 
            className="flex justify-between items-center"
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button size="sm" variant="secondary" className="gap-1 bg-white/20 backdrop-blur-md text-white hover:bg-white/30">
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </Button>
            <Button size="icon" variant="secondary" className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30">
              <Share2 className="h-4 w-4" />
            </Button>
          </motion.div>
          
          {author && (
            <motion.div 
              className="absolute top-3 right-3"
              initial={{ opacity: 0, x: 5 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="outline" className="bg-black/40 text-white backdrop-blur-sm border-white/20">
                @{authorUsername || author.toLowerCase()}
              </Badge>
            </motion.div>
          )}
        </motion.div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-base line-clamp-2">{title}</h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
