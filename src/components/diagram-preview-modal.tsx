
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HeartIcon, 
  ExternalLinkIcon, 
  DownloadIcon, 
  ZoomInIcon, 
  ZoomOutIcon, 
  XIcon, 
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { DiagramResult } from "@/hooks/use-infinite-search";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DiagramPreviewModalProps {
  open: boolean;
  onClose: () => void;
  diagram: DiagramResult | null;
  onLike?: () => void;
  isLiked?: boolean;
}

export function DiagramPreviewModal({
  open,
  onClose,
  diagram,
  onLike,
  isLiked = false,
}: DiagramPreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!diagram) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(diagram.imageSrc);
      const blob = await response.blob();
      
      // Create object URL from blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      
      // Extract file extension from URL
      const extension = diagram.imageSrc.split('.').pop()?.split('?')[0] || 'png';
      
      // Generate filename
      const filename = `diagram-${diagram.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${extension}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Diagram downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const openSourceUrl = () => {
    if (diagram.sourceUrl && diagram.sourceUrl !== "#") {
      window.open(diagram.sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-lg sm:text-xl mr-8">
                {diagram.title}
              </DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  By {diagram.author || "Unknown"}
                </span>
                
                {diagram.isGenerated && (
                  <Badge className="bg-primary/70">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
                
                <div className="flex flex-wrap gap-1 mt-1">
                  {diagram.tags?.slice(0, 5).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-1.5 py-0 h-5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </DialogDescription>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-2 right-2" 
              onClick={onClose}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div 
          className="flex-1 overflow-auto relative p-4 sm:p-6 bg-muted/30"
          style={{ minHeight: "20rem" }}
          onDoubleClick={resetZoom}
        >
          <div 
            className="w-full h-full flex items-center justify-center transition-all"
            style={{ 
              cursor: zoomLevel !== 1 ? 'zoom-out' : 'zoom-in',
              overflow: 'auto' 
            }}
          >
            <motion.img
              src={imageError ? "/lovable-uploads/7950c6cb-34b4-4e5f-b4da-a9a7d68d9d1d.png" : diagram.imageSrc}
              alt={diagram.title}
              className={cn(
                "max-w-full max-h-[60vh] object-contain transition-transform",
                imageError ? "opacity-80" : ""
              )}
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
              onClick={() => zoomLevel !== 1 ? resetZoom() : handleZoomIn()}
              onError={() => setImageError(true)}
            />
          </div>
          
          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
              <ZoomOutIcon className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
              <ZoomInIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <DialogFooter className="p-4 border-t flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${isLiked ? "text-red-500 hover:text-red-600" : ""}`}
              onClick={onLike}
            >
              <HeartIcon className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleDownload}
            >
              <DownloadIcon className="h-5 w-5" />
            </Button>
          </div>
          
          {diagram.sourceUrl && diagram.sourceUrl !== "#" && (
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2" 
              onClick={openSourceUrl}
            >
              <ExternalLinkIcon className="h-4 w-4" />
              View Source
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
