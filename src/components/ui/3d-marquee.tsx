"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export const ThreeDMarquee = ({
  images,
  className,
  rows = 6,
}: {
  images: string[];
  className?: string;
  rows?: number;
}) => {
  // Improved image status tracking with loading state
  const [imageStatus, setImageStatus] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  
  // Default fallback image with a guaranteed load - light theme
  const fallbackImage = "https://placehold.co/970x700/f8fafc/e2e8f0?text=Diagram";
  
  // Ensure we have at least the minimum number of images (rows*6)
  useEffect(() => {
    // Process images to ensure we have enough valid ones
    const processImages = () => {
      let result = [...images];
      const minImages = rows * 6; // 6 columns with 'rows' number of images each
      
      // Fill with fallbacks if needed
      if (result.length < minImages) {
        const numberOfFallbacks = minImages - result.length;
        for (let i = 0; i < numberOfFallbacks; i++) {
          result.push(`https://placehold.co/970x700/f8fafc/e2e8f0?text=Diagram+${i + 1}`);
        }
      }
      
      // Initialize all images as loading
      const initialStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};
      result.forEach(img => {
        initialStatus[img] = 'loading';
      });
      
      setImageStatus(initialStatus);
      setProcessedImages(result);
    };
    
    processImages();
  }, [images, rows]);
  
  // Split the processed images array into 7 equal parts (columns) for an even denser grid
  const chunks = Array.from({ length: 7 }, (_, colIndex) => {
    const chunkSize = Math.ceil(processedImages.length / 7);
    const start = colIndex * chunkSize;
    return processedImages.slice(start, start + chunkSize);
  });
  
  // Handle image load error
  const handleImageError = (imageUrl: string) => {
    setImageStatus(prev => ({
      ...prev,
      [imageUrl]: 'error'
    }));
  };
  
  // Handle image load success
  const handleImageLoad = (imageUrl: string) => {
    setImageStatus(prev => ({
      ...prev,
      [imageUrl]: 'loaded'
    }));
  };
  
  // Get image src based on loading state
  const getImageSrc = (url: string) => {
    return imageStatus[url] === 'error' ? fallbackImage : url;
  };
  
  // Animation configuration for columns - each column has different directions and speeds
  const getColumnAnimation = (colIndex: number) => {
    // Enhanced animation patterns for mobile and desktop
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Adjust animation speeds and ranges for better mobile experience and more variation
    const directions = [
      { y: isMobile ? 120 : 160, duration: isMobile ? 30 : 35 },  // First column
      { y: isMobile ? -130 : -180, duration: isMobile ? 34 : 39 }, // Second column
      { y: isMobile ? 140 : 170, duration: isMobile ? 32 : 37 },  // Third column
      { y: isMobile ? -150 : -190, duration: isMobile ? 36 : 41 }, // Fourth column
      { y: isMobile ? 140 : 200, duration: isMobile ? 33 : 38 },  // Fifth column
      { y: isMobile ? -130 : -170, duration: isMobile ? 35 : 40 }, // Sixth column
      { y: isMobile ? 120 : 150, duration: isMobile ? 31 : 36 },  // Seventh column
    ];
    
    return directions[colIndex];
  };
  
  return (
    <div
      className={cn(
        "mx-auto block overflow-visible rounded-none pb-4 pt-2",
        className,
      )}
    >
      {/* Premium Aceternity UI grid lines - subtle lighter version */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.1)_1px,transparent_1px)] bg-[size:14px_14px] opacity-[0.15]"></div>
      
      {/* Ultra-subtle ambient glow */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/[0.03] via-transparent to-transparent opacity-30 mix-blend-overlay pointer-events-none"></div>
      
      <div className="flex size-full items-center justify-center overflow-visible">
        <div className="size-[1920px] shrink-0 scale-[0.38] xs:scale-[0.45] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-[1]">
          {/* Refined 3D transform for better visual appeal */}
          <div
            style={{
              transform: "rotateX(52deg) rotateY(0deg) rotateZ(-45deg)",
              perspective: "1600px",
              transformStyle: "preserve-3d",
              transformOrigin: "center center"
            }}
            className="relative top-96 right-[50%] grid size-full origin-top-left grid-cols-7 gap-2 xs:gap-3 sm:gap-3 md:gap-4 lg:gap-4 transform-3d"
          >
            {chunks.map((subarray, colIndex) => {
              const animation = getColumnAnimation(colIndex);
              
              return (
              <motion.div
                  initial={{ y: colIndex % 2 === 0 ? 50 : -50 }}
                  animate={{ 
                    y: animation.y,
                    transition: {
                      duration: animation.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                      ease: "easeInOut"
                    }
                }}
                key={colIndex + "marquee"}
                  className="flex flex-col items-start gap-2 xs:gap-3 sm:gap-3 md:gap-4 lg:gap-4 relative"
              >
                {subarray.map((image, imageIndex) => (
                    <div className="relative group" key={imageIndex + image}>
                      {/* Enhanced premium shadow with more depth - lighter version */}
                      <div className="absolute inset-0 rounded-lg bg-black/20 blur-xl opacity-20 translate-y-2 group-hover:translate-y-4 md:group-hover:translate-y-5 transition-all duration-300 md:duration-500"></div>
                      
                      {/* Mobile version */}
                      <motion.div
                      whileHover={{
                          y: -8,
                          x: 4, 
                          rotateX: "-3deg",
                          rotateY: "3deg",
                          scale: 1.03,
                          transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] }
                        }}
                        className="relative transform-gpu will-change-transform md:hidden"
                      >
                        {/* Enhanced light reflection effect */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 rounded-lg z-10 pointer-events-none transition-opacity duration-300"
                        ></div>
                        
                        {/* Premium image with mobile styling - lighter theme */}
                        <img
                          src={getImageSrc(image)}
                          alt={`Diagram ${imageIndex + 1}`}
                          className="aspect-[970/700] rounded-lg object-cover ring-1 ring-black/5 shadow-[0_0_15px_rgba(0,0,0,0.06)] group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300"
                          width={970}
                          height={700}
                          loading="eager"
                          onError={() => handleImageError(image)}
                          onLoad={() => handleImageLoad(image)}
                        />
                        
                        {/* Enhanced edge highlight with subtle glow */}
                        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5 group-hover:ring-black/10 transition-all duration-300"></div>
                        
                        {/* Elegant highlight on top edge */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </motion.div>
                      
                      {/* Desktop version with enhanced effects */}
                      <motion.div
                        whileHover={{
                          y: -16,
                          x: 8,
                          rotateX: "-4deg",
                          rotateY: "4deg",
                          scale: 1.06,
                          transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
                        }}
                        className="relative transform-gpu will-change-transform hidden md:block"
                      >
                        {/* Enhanced light reflection effect */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 rounded-lg z-10 pointer-events-none transition-opacity duration-500"
                        ></div>
                        
                        {/* Premium image with desktop styling - lighter theme */}
                        <img
                          src={getImageSrc(image)}
                          alt={`Diagram ${imageIndex + 1}`}
                          className="aspect-[970/700] rounded-lg object-cover ring-1 ring-black/5 shadow-[0_0_15px_rgba(0,0,0,0.06)] group-hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] transition-all duration-500"
                      width={970}
                      height={700}
                          loading="eager"
                          onError={() => handleImageError(image)}
                          onLoad={() => handleImageLoad(image)}
                        />
                        
                        {/* Enhanced edge highlight with subtle glow */}
                        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5 group-hover:ring-black/10 transition-all duration-500"></div>
                        
                        {/* Elegant highlight on top edge */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </motion.div>
                  </div>
                ))}
              </motion.div>
              );
            })}
            
            {/* Subtle ambient glow in the center */}
            <div className="absolute w-full h-full inset-0 pointer-events-none bg-gradient-radial from-blue-500/[0.02] to-transparent opacity-20 mix-blend-overlay rounded-full scale-75 blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Grid line components
const GridLineVertical = ({ className, offset }: { className?: string; offset?: string }) => (
  <div
      className={cn(
      "absolute h-full w-px bg-gradient-to-b from-white/5 via-white/10 to-white/5",
      className
    )}
    style={{ left: offset }}
  />
);

const GridLineHorizontal = ({ className, offset }: { className?: string; offset?: string }) => (
  <div
      className={cn(
      "absolute w-full h-px bg-gradient-to-r from-white/5 via-white/10 to-white/5",
      className
    )}
    style={{ top: offset }}
  />
);
