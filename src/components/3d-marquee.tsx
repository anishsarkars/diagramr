
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Compact3DMarqueeProps {
  images: string[];
  rows?: number;
  className?: string;
}

export function Compact3DMarquee({ 
  images = [], 
  rows = 3, 
  className = "" 
}: Compact3DMarqueeProps) {
  // Use placeholder images if none provided
  const marqueeImages = images.length > 0 ? images : [
    'https://placehold.co/600x400?text=Diagram',
    'https://placehold.co/600x400?text=Diagram',
    'https://placehold.co/600x400?text=Diagram',
  ];
  
  // Double the images for seamless loop
  const allImages = [...marqueeImages, ...marqueeImages];
  
  // Create an array of row indices based on the number of rows
  const rowIndices = Array.from({ length: rows }, (_, i) => i);
  
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {rowIndices.map((rowIndex) => (
        <motion.div
          key={`row-${rowIndex}`}
          className="flex py-2"
          animate={{
            x: [0, -100 * (marqueeImages.length)],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 50 + rowIndex * 5, // Varied speeds for 3D effect
              ease: "linear",
            },
          }}
          style={{
            zIndex: rows - rowIndex, // Higher rows appear on top
            y: rowIndex * 20, // Spread out rows
            scale: 1 - 0.05 * rowIndex, // Scale down back rows for perspective
          }}
        >
          {allImages.map((image, index) => (
            <div
              key={`${rowIndex}-${index}`}
              className="mx-3 relative flex-shrink-0 rounded-md overflow-hidden shadow-md hover:shadow-lg transition-all"
              style={{
                width: 300 - rowIndex * 20,
                height: 170 - rowIndex * 10,
                opacity: 1 - rowIndex * 0.15, // Fade out back rows
                filter: rowIndex > 0 ? `blur(${rowIndex * 0.5}px)` : 'none', // Subtle blur for background
              }}
            >
              <img
                src={image}
                alt={`Diagram ${rowIndex}-${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
