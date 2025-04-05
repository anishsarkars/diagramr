import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export const Compact3DMarquee = ({
  images,
  className,
  rows = 3, 
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
  
  // Ensure we have at least the minimum number of images (rows*5)
  useEffect(() => {
    // Process images to ensure we have enough valid ones
    const processImages = () => {
      let result = [...images];
      const minImages = rows * 5; // 5 columns with 'rows' number of images each
      
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
  
  // Split the processed images array into 5 equal parts (columns) for the compact grid
  const chunks = Array.from({ length: 5 }, (_, colIndex) => {
    const chunkSize = Math.ceil(processedImages.length / 5);
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
  
  // Animation configuration for columns - more modern and futuristic patterns
  const getColumnAnimation = (colIndex: number) => {
    // Enhanced animation patterns with faster, more dynamic movements
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Faster, more fluid animations with wider range for futuristic feel
    const directions = [
      { y: isMobile ? 80 : 180, duration: isMobile ? 28 : 38 },     // First column - faster on mobile
      { y: isMobile ? -90 : -190, duration: isMobile ? 30 : 40 },   // Second column - faster on mobile
      { y: isMobile ? 85 : 185, duration: isMobile ? 29 : 39 },     // Third column - faster on mobile
      { y: isMobile ? -95 : -195, duration: isMobile ? 31 : 41 },   // Fourth column - faster on mobile
      { y: isMobile ? 100 : 200, duration: isMobile ? 27 : 37 },    // Fifth column - faster on mobile
    ];
    
    return directions[colIndex];
  };
  
  return (
    <div
      className={cn(
        "mx-auto block overflow-visible rounded-none py-0 relative",
        className,
      )}
    >
      {/* Ultra-thin grid lines for minimal futuristic look */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.25]"></div>
      
      {/* Enhanced center blending with brighter radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/[0.12] via-transparent to-transparent opacity-80 mix-blend-overlay pointer-events-none"></div>
      
      <div className="flex size-full items-center justify-center overflow-visible">
        {/* Increased scale for better space utilization with mobile optimization */}
        <div className="size-[2000px] shrink-0 scale-[0.36] xs:scale-[0.38] sm:scale-[0.42] md:scale-[0.44] lg:scale-[0.46] xl:scale-[0.48]">
          {/* More extreme 3D transform for futuristic perspective, adjusted for mobile */}
          <div
            style={{
              transform: typeof window !== 'undefined' && window.innerWidth < 768
                ? "rotateX(50deg) rotateY(0deg) rotateZ(-38deg)" // Less extreme angle on mobile
                : "rotateX(55deg) rotateY(0deg) rotateZ(-42deg)",
              perspective: "2000px",
              transformStyle: "preserve-3d",
              transformOrigin: "center center"
            }}
            className="relative top-72 right-[50%] grid size-full origin-top-left grid-cols-5 gap-3 xs:gap-3 sm:gap-3 md:gap-4 lg:gap-4 transform-3d"
          >
            {/* Enhanced center glow effect - brighter for futuristic feel */}
            <div className="absolute inset-0 z-10 opacity-80 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-radial from-primary/15 via-primary/[0.05] to-transparent blur-[120px]"></div>
            </div>
            
            {chunks.map((subarray, colIndex) => {
              const animation = getColumnAnimation(colIndex);
              
              return (
              <motion.div
                  initial={{ y: colIndex % 2 === 0 ? 40 : -40 }}
                  animate={{ 
                    y: animation.y,
                    transition: {
                      duration: animation.duration,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: [0.2, 0.9, 0.3, 1], // More pronounced motion curve
                      delay: colIndex * 0.2, // Tighter stagger for more uniform motion
                    }
                  }}
                  key={colIndex + "marquee"}
                  className="flex flex-col items-start gap-3 xs:gap-3 sm:gap-3 md:gap-4 lg:gap-4 relative"
              >
                {subarray.map((image, imageIndex) => (
                  <div className="relative group" key={imageIndex + image}>
                    {/* Sharper, more defined shadow for cleaner look */}
                    <div className="absolute inset-0 rounded-lg bg-black/30 blur-lg opacity-25 translate-y-2 group-hover:translate-y-3 group-hover:blur-xl transition-all duration-400 ease-out"></div>
                    
                    {/* Enhanced hover effects for futuristic interaction */}
                    <motion.div
                      whileHover={{
                        y: -6,
                        x: 4, 
                        rotateX: "-4deg",
                        rotateY: "4deg",
                        scale: 1.04,
                        transition: { duration: 0.4, ease: [0.2, 0.9, 0.3, 1] }
                      }}
                      className="relative transform-gpu will-change-transform"
                    >
                      {/* Enhanced light reflection with sharper gradient */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-white/70 to-transparent opacity-0 group-hover:opacity-100 rounded-lg z-10 pointer-events-none transition-opacity duration-400"
                      ></div>
                      
                      {/* Thinner, more defined borders for minimal aesthetic */}
                      <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-tr from-white/50 via-white/25 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                      
                      {/* Brighter highlight line - futuristic accent */}
                      <div className="absolute inset-x-0 -top-[1px] h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-20"></div>
                      
                      {/* Cleaner image card with sharper edges */}
                      <img
                        src={getImageSrc(image)}
                        alt={`Diagram ${imageIndex + 1}`}
                        className="aspect-[970/700] rounded-lg object-cover ring-1 ring-black/5 shadow-[0_0_8px_rgba(0,0,0,0.05)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)] transition-all duration-400"
                        width={970}
                        height={700}
                        loading="eager"
                        onError={() => handleImageError(image)}
                        onLoad={() => handleImageLoad(image)}
                      />
                      
                      {/* Ultra-thin edge highlight - minimal design */}
                      <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/15 group-hover:ring-white/30 transition-all duration-400"></div>
                      
                      {/* Subtle bottom accent */}
                      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                      
                      {/* Brighter glow effect on hover - futuristic highlight */}
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-tr from-primary/15 to-transparent blur-sm"></div>
                    </motion.div>
                    
                    {/* Brighter indicator dot for futuristic accent */}
                    <div className="absolute -bottom-1 right-1 w-1 h-1 rounded-full bg-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-400 shadow-[0_0_6px_rgba(var(--primary),0.6)]"></div>
                  </div>
                ))}
              </motion.div>
              );
            })}
            
            {/* Enhanced ambient glow with more intensity */}
            <div className="absolute w-full h-full inset-0 pointer-events-none bg-gradient-radial from-primary/[0.1] to-transparent opacity-70 mix-blend-overlay rounded-full scale-95 blur-3xl"></div>
            
            {/* Brighter center marker for visual focus */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-radial from-primary/8 to-transparent blur-xl opacity-90 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 