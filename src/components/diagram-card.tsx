import { useState, useRef, forwardRef, ForwardedRef, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Heart, ExternalLink, Maximize, MoreHorizontal, Copy, Check, BookOpen, AlertTriangle, Briefcase, Code2, Palette, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ImageEnlargeModal } from "./image-enlarge-modal";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode } from "react";
import { DiagramResult } from "@/hooks/use-infinite-search";

export interface DiagramCardProps {
  diagram: DiagramResult;
  viewMode?: "grid" | "list";
  isLiked?: boolean;
  onLike?: () => void;
  onTagClick?: (tag: string) => void;
  onShare?: () => void;
  onDownload?: (id: string | number, format: string) => void;
  className?: string;
}

const DiagramCard = forwardRef(({
  diagram,
  viewMode = "grid",
  isLiked = false,
  onLike,
  onTagClick,
  onShare,
  onDownload,
  className,
}: DiagramCardProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { id, title, imageSrc, author, authorUsername, tags = [], sourceUrl, isGenerated } = diagram;
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showEnlargeModal, setShowEnlargeModal] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check content type for badge display
  const contentType = useMemo(() => {
    // Educational keywords
    const educationalKeywords = [
      "diagram", "schematic", "educational", "academic", "lecture", 
      "study", "university", "college", "research", "textbook"
    ];
    
    // Professional/Business keywords
    const professionalKeywords = [
      "business", "professional", "workflow", "process", "corporate", 
      "enterprise", "project", "organization", "management"
    ];
    
    // Technical keywords
    const technicalKeywords = [
      "technical", "engineering", "architecture", "system", "protocol", 
      "network", "code", "algorithm", "software", "uml"
    ];
    
    // Creative keywords
    const creativeKeywords = [
      "creative", "design", "art", "concept", "idea", "brainstorm", 
      "mind map", "sketch", "visual", "infographic"
    ];
    
    // Check title
    if (title) {
      const titleLower = title.toLowerCase();
      
      for (const keyword of educationalKeywords) {
        if (titleLower.includes(keyword)) return "educational";
      }
      
      for (const keyword of professionalKeywords) {
        if (titleLower.includes(keyword)) return "professional";
      }
      
      for (const keyword of technicalKeywords) {
        if (titleLower.includes(keyword)) return "technical";
      }
      
      for (const keyword of creativeKeywords) {
        if (titleLower.includes(keyword)) return "creative";
      }
    }
    
    // Check tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        const tagLower = tag.toLowerCase();
        
        for (const keyword of educationalKeywords) {
          if (tagLower.includes(keyword) || keyword.includes(tagLower)) 
            return "educational";
        }
        
        for (const keyword of professionalKeywords) {
          if (tagLower.includes(keyword) || keyword.includes(tagLower)) 
            return "professional";
        }
        
        for (const keyword of technicalKeywords) {
          if (tagLower.includes(keyword) || keyword.includes(tagLower)) 
            return "technical";
        }
        
        for (const keyword of creativeKeywords) {
          if (tagLower.includes(keyword) || keyword.includes(tagLower)) 
            return "creative";
        }
      }
    }
    
    // Check source URL
    if (sourceUrl) {
      const url = sourceUrl.toLowerCase();
      
      if (url.includes('.edu') || 
          url.includes('academic') || 
          url.includes('university')) {
        return "educational";
      }
      
      if (url.includes('business') ||
          url.includes('enterprise') ||
          url.includes('company') ||
          url.includes('corporate')) {
        return "professional";
      }
      
      if (url.includes('engineering') ||
          url.includes('technical') ||
          url.includes('developer') ||
          url.includes('code')) {
        return "technical";
      }
      
      if (url.includes('design') ||
          url.includes('creative') ||
          url.includes('art') ||
          url.includes('sketch')) {
        return "creative";
      }
    }
    
    // Default - generic diagram
    return "diagram";
  }, [title, tags, sourceUrl]);

  // Content type badge settings
  const badgeConfig = useMemo(() => {
    switch(contentType) {
      case "educational":
        return {
          icon: <BookOpen className="h-2.5 w-2.5" />,
          text: "Educational",
          className: "bg-blue-500/60 text-white"
        };
      case "professional":
        return {
          icon: <Briefcase className="h-2.5 w-2.5" />,
          text: "Professional",
          className: "bg-indigo-500/60 text-white"
        };
      case "technical":
        return {
          icon: <Code2 className="h-2.5 w-2.5" />,
          text: "Technical",
          className: "bg-emerald-500/60 text-white"
        };
      case "creative":
        return {
          icon: <Palette className="h-2.5 w-2.5" />,
          text: "Creative",
          className: "bg-orange-500/60 text-white"
        };
      default:
        return {
          icon: <FileImage className="h-2.5 w-2.5" />,
          text: "Diagram",
          className: "bg-gray-500/60 text-white"
        };
    }
  }, [contentType]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoaded(true);
  };

  const handleDownload = (format: string) => {
    if (onDownload) {
      onDownload(id, format);
    }
  };

  const isGrid = viewMode === "grid";
  
  // Use browser native lazy loading with IntersectionObserver fallback
  useEffect(() => {
    if (imgRef.current && 'loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      imgRef.current.loading = 'lazy';
    } else if (imgRef.current) {
      // Fallback for browsers that don't support native lazy loading
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imgRef.current && imgRef.current.src !== imageSrc) {
            imgRef.current.src = imageSrc;
          }
        });
      }, { rootMargin: '200px' });
      
      observer.observe(imgRef.current);
      return () => {
        if (imgRef.current) observer.unobserve(imgRef.current);
      };
    }
  }, [imageSrc]);
  
  return (
    <>
      <motion.div 
        ref={ref}
        className={cn(
          "group relative flex rounded-lg overflow-hidden border border-border/40 bg-card hover:shadow-md transition-all duration-200",
          isGrid ? "flex-col h-full" : "flex-row h-32 sm:h-40",
          className
        )}
        whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      >
        {/* Image container */}
        <div 
          className={cn(
            "relative overflow-hidden bg-muted/30 cursor-pointer",
            isGrid ? "w-full aspect-[4/3]" : "w-32 sm:w-40 h-full shrink-0"
          )}
          onClick={() => !imageError && setShowEnlargeModal(true)}
        >
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p className="text-xs text-center px-2">Failed to load image</p>
            </div>
          ) : (
            <img 
              ref={imgRef}
            src={imageSrc}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {/* Content type badge */}
          <div className="absolute top-1.5 left-1.5 z-10">
            <Badge 
              variant="secondary" 
              className={`text-[10px] border-none px-1.5 py-0 h-5 flex items-center gap-0.5 backdrop-blur-sm ${badgeConfig.className}`}
            >
              {badgeConfig.icon}
              <span className="text-[9px] font-normal">{badgeConfig.text}</span>
            </Badge>
          </div>
          
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-1">
              {/* Maximize button for enlarge */}
              {!imageError && (
              <Button 
                size="icon"
                variant="outline"
                className="h-6 w-6 rounded-full bg-white/90 hover:bg-white text-foreground border-none shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEnlargeModal(true);
                }}
              >
                <Maximize className="h-3 w-3" />
              </Button>
              )}
            
              <Button 
                size="icon"
                variant="outline"
                className="h-6 w-6 rounded-full bg-white/90 hover:bg-white text-foreground border-none shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike && onLike();
                }}
              >
                <Heart 
                  className={cn(
                    "h-3 w-3 transition-colors", 
                    isLiked ? "fill-red-500 text-red-500" : "fill-transparent"
                  )} 
                />
              </Button>
              
              {sourceUrl && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 rounded-full bg-white/90 hover:bg-white text-foreground border-none shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  asChild
                >
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
              
              {/* Download options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 rounded-full bg-white/90 hover:bg-white text-foreground border-none shadow-sm"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[140px]">
                  <DropdownMenuItem onClick={() => handleDownload('png')}>
                    PNG Format
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('jpg')}>
                    JPG Format
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('svg')}>
                    SVG Format
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Share button */}
              {onShare && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 rounded-full bg-white/90 hover:bg-white text-foreground border-none shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className={cn(
          "flex flex-col p-3",
          isGrid ? "h-auto" : "flex-1 justify-between",
        )}>
          <div>
            <h3 className="font-medium text-sm truncate" title={title}>{title}</h3>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {author ? `by ${author}` : sourceUrl ? new URL(sourceUrl).hostname : "Unknown source"}
            </p>
          </div>
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className={cn(
              "flex flex-wrap gap-1 mt-2",
              !isGrid && "mt-auto"
            )}>
              {tags.slice(0, isGrid ? 3 : 2).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick && onTagClick(tag);
                  }}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/5 hover:bg-primary/10 text-primary/70 transition-colors"
                >
                  {tag}
                </button>
              ))}
              {tags.length > (isGrid ? 3 : 2) && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground">
                  +{tags.length - (isGrid ? 3 : 2)}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile touch overlay for better tap targets */}
        <div className="absolute inset-0 md:hidden" onClick={() => !imageError && setShowEnlargeModal(true)}></div>
      </motion.div>

      {!imageError && (
      <ImageEnlargeModal
        open={showEnlargeModal}
        onOpenChange={setShowEnlargeModal}
        image={
          showEnlargeModal
            ? {
                src: imageSrc,
                title: title,
                author: author,
                sourceUrl: sourceUrl
              }
            : null
        }
      />
      )}
    </>
  );
});

DiagramCard.displayName = "DiagramCard";

export { DiagramCard };
