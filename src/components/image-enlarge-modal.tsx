
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";

interface ImageEnlargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: {
    src: string;
    title: string;
    author?: string;
    sourceUrl?: string;
  } | null;
}

export function ImageEnlargeModal({
  open,
  onOpenChange,
  image,
}: ImageEnlargeModalProps) {
  const handleDownload = () => {
    if (!image) return;
    
    const link = document.createElement("a");
    link.href = image.src;
    link.download = `${image.title.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto p-1 gap-0">
        <div className="relative">
          <DialogClose className="absolute right-2 top-2 z-10 bg-background/80 rounded-full p-1">
            <X className="h-4 w-4" />
          </DialogClose>
          
          <div className="overflow-hidden rounded-t-lg">
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-auto object-contain"
            />
          </div>
          
          <div className="p-4 border-t bg-background">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg mb-1">{image.title}</h3>
                {image.author && (
                  <p className="text-sm text-muted-foreground">By {image.author}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleDownload}
                  title="Download image"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                {image.sourceUrl && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(image.sourceUrl, '_blank')}
                    title="Visit source"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Source
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
