"use client";

import { useEffect, useState } from "react";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { DataStructuresDiagram, BrainAnatomyDiagram, MarketingStackDiagram, AdobeConnectDiagram } from "./diagram-examples";

// Expanded set of professionally curated diagrams covering diverse topics
const guaranteedImages = [
  // Tech diagrams - Using more reliable Unsplash images
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  
  // Healthcare and medical
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  
  // Geopolitics and geography
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  
  // Business models and strategies
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  
  // Science and research
  "https://images.unsplash.com/photo-1507668077129-56e32842fceb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1564325724739-bae0bd08762c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  
  // Engineering and architecture
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  
  // Education and learning
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  
  // Additional images for more rows
  "https://images.unsplash.com/photo-1581091879641-197604d8bfed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1577401239170-897942555fb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1579546928937-641f7ac9bced?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1497316730643-415fac54a2af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1535378273068-9bb67d5bbc41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1633465987899-04c6739211fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
];

// Premium diagram examples that closely resemble actual diagrams
const directExampleImages = [
  // Data structures diagram (dark with colorful nodes)
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  // Brain anatomy diagram (colorful regions)
  "https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  // Geopolitical map
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  // Marketing technology stack diagram
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  // Healthcare workflow
  "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  // Machine learning/AI visualization
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  // More reliable diagrams for additional rows
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1496065187959-7f07b8353c55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1604689598793-b43e0e7b1781?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
  "https://images.unsplash.com/photo-1543286386-713bdd548da4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=970&h=700",
];

// Emergency guaranteed static fallbacks if needed
const emergencyFallbacks = Array.from({ length: 126 }, (_, i) => 
  `https://placehold.co/970x700/${i % 3 === 0 ? 'f1f5f9' : i % 3 === 1 ? 'e2e8f0' : 'f8fafc'}/64748b?text=Diagram+${i + 1}`
);

// Additional reliable images for filling gaps
const additionalReliableImages = [
  "https://placehold.co/970x700/f1f5f9/64748b?text=Data+Structure",
  "https://placehold.co/970x700/e2e8f0/64748b?text=Machine+Learning",
  "https://placehold.co/970x700/f8fafc/64748b?text=Biology+Diagram",
  "https://placehold.co/970x700/f1f5f9/64748b?text=Business+Model",
  "https://placehold.co/970x700/e2e8f0/64748b?text=Geographic+Map",
  "https://placehold.co/970x700/f8fafc/64748b?text=Engineering+Diagram",
  "https://placehold.co/970x700/f1f5f9/64748b?text=Medical+Workflow",
  "https://placehold.co/970x700/e2e8f0/64748b?text=Network+Topology",
  "https://placehold.co/970x700/f8fafc/64748b?text=Chemistry+Molecule",
  "https://placehold.co/970x700/f1f5f9/64748b?text=Physics+Concept",
  "https://placehold.co/970x700/e2e8f0/64748b?text=UML+Diagram",
  "https://placehold.co/970x700/f8fafc/64748b?text=Flow+Chart",
  "https://placehold.co/970x700/f1f5f9/64748b?text=Mind+Map",
  "https://placehold.co/970x700/e2e8f0/64748b?text=Concept+Map",
  "https://placehold.co/970x700/f8fafc/64748b?text=Gantt+Chart",
  "https://placehold.co/970x700/f1f5f9/64748b?text=ER+Diagram",
  "https://placehold.co/970x700/e2e8f0/64748b?text=Circuit+Design",
  "https://placehold.co/970x700/f8fafc/64748b?text=Architecture+Blueprint",
  "https://placehold.co/970x700/f1f5f9/64748b?text=Marketing+Funnel",
  "https://placehold.co/970x700/e2e8f0/64748b?text=Financial+Chart",
];

export const EducationalDiagramsMarquee = () => {
  const [finalImages, setFinalImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to preload and ensure image availability
    const prepareImages = async () => {
      setIsLoading(true);
      
      // Combine all potential image sources with premium examples first
      const allPotentialImages = [...directExampleImages, ...guaranteedImages, ...additionalReliableImages];
      
      // Create array to hold valid images
      const validImages: string[] = [];
      
      // Preload and verify each image
      for (const imageUrl of allPotentialImages) {
        try {
          // Create an image object to test loading
          const img = new Image();
          
          // Create a promise that resolves when the image loads or rejects on error
          const loadPromise = new Promise<boolean>((resolve, reject) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false); // Just resolve with false instead of rejecting
            img.src = imageUrl;
          });
          
          // Set a timeout to avoid hanging on slow-loading images
          const timeoutPromise = new Promise<boolean>((resolve) => {
            setTimeout(() => resolve(false), 2000);
          });
          
          // Race the image loading against the timeout
          const success = await Promise.race([loadPromise, timeoutPromise]);
          
          if (success) {
            validImages.push(imageUrl);
            
            // We want more images now - at least 126 (18 rows * 7 columns)
            if (validImages.length >= 126) {
              break;
            }
          }
        } catch (e) {
          // Skip this image on any error
          console.log("Error preloading image:", e);
        }
      }
      
      // If we don't have enough images, duplicate existing ones and add fallbacks
      if (validImages.length < 126) {
        // First duplicate existing valid images
        let duplicated = [...validImages];
        
        while (duplicated.length < 126 && validImages.length > 0) {
          // Add copies of valid images first
          const imgToDuplicate = validImages[duplicated.length % validImages.length];
          duplicated.push(imgToDuplicate);
        }
        
        // Then add emergency fallbacks if still needed
        if (duplicated.length < 126) {
          const needed = 126 - duplicated.length;
          duplicated = duplicated.concat(emergencyFallbacks.slice(0, needed));
        }
        
        setFinalImages(duplicated);
      } else {
        setFinalImages(validImages);
      }
      
      setIsLoading(false);
    };
    
    prepareImages();
  }, []);
  
  // Display a loading state while checking images
  if (isLoading) {
    return (
      <div className="py-16 relative overflow-hidden">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-medium leading-tight sm:text-3xl md:text-4xl text-foreground">
              Discover diagrams that matter
            </h2>
            <p className="mt-2 text-base text-muted-foreground max-w-xl mx-auto">
              Loading our visual knowledge base...
            </p>
          </div>
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-10 sm:py-12 lg:py-16 relative overflow-hidden border-t border-neutral-200/20">
      {/* Premium subtle grid pattern - lighter to blend with the page */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb10_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb10_1px,transparent_1px)] bg-[size:30px_30px] opacity-40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(59,130,246,0.03),transparent)]"></div>
      </div>
      
      {/* Subtle accent glow effects */}
      <div className="absolute left-1/4 top-0 -translate-x-1/2 w-[550px] h-[350px] bg-blue-500/5 rounded-full blur-[140px] opacity-30 pointer-events-none"></div>
      <div className="absolute right-1/4 bottom-0 translate-x-1/2 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[140px] opacity-20 pointer-events-none"></div>
      
      {/* Top and bottom fade for seamless integration */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"></div>
      
      <div className="mx-auto w-full px-2 sm:px-4 lg:px-6 max-w-[1920px] relative">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <div className="inline-flex items-center px-2.5 py-1 mb-3 rounded-full border border-neutral-200/20 bg-white/5 text-xs text-foreground/80 tracking-wide">
            <div className="flex items-center">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></div>
              <span>Premium Diagrams</span>
            </div>
          </div>
          <h2 className="text-2xl font-medium leading-tight sm:text-3xl md:text-4xl text-foreground">
            Discover diagrams that matter
          </h2>
          <p className="mt-2 text-base text-muted-foreground max-w-xl mx-auto">
            Diagramr helps you find best diagrams or images for your studies, revision, research, or anything else
          </p>
        </div>
        
        <div className="relative z-0 overflow-visible">
          <ThreeDMarquee 
            images={finalImages}
            rows={18} 
            className="h-[450px] sm:h-[500px] md:h-[550px] lg:h-[600px] xl:h-[650px]"
          />
        </div>
      </div>
    </div>
  );
}; 