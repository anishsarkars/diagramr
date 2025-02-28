
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Heart } from "lucide-react";
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
}: DiagramCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className={cn(
        "diagram-card group relative rounded-xl overflow-hidden border border-border bg-card shadow-sm",
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
              // Fallback to a placeholder if the image fails to load
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </AspectRatio>
        
        {author && (
          <div className="absolute bottom-2 right-2 text-xs">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              @{authorUsername || author.toLowerCase()}
            </Badge>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <Button size="sm" variant="secondary" className="gap-1" asChild>
            <a href={sourceUrl || "#"} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Source</span>
            </a>
          </Button>
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="secondary" 
              className={cn(isLiked ? "text-red-500" : "")}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className="h-3.5 w-3.5" fill={isLiked ? "currentColor" : "none"} />
            </Button>
            <Button size="sm" variant="secondary" className="gap-1">
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-medium text-base line-clamp-2">{title}</h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
