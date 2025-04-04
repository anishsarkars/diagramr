import { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Atom, 
  Brain, 
  Briefcase, 
  BarChart as ChartBar,
  CircuitBoard, 
  FileDigit, 
  FlaskConical, 
  ArrowRight as FlowIcon, 
  Circle as GeometryIcon, 
  GitBranch, 
  Globe, 
  Lightbulb, 
  Network, 
  Puzzle, 
  BarChart4 as ScalingIcon, 
  GitCommit as WorkflowIcon
} from 'lucide-react';

interface PopularSearchesProps {
  searches: string[];
  onClick: (search: string) => void;
  className?: string;
}

export function PopularSearches({ searches, onClick, className = '' }: PopularSearchesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Map search categories to icons with consistent styling
  const getIconForSearch = (search: string) => {
    const searchLower = search.toLowerCase();
    const iconClasses = "h-2.5 w-2.5 mr-1 opacity-70";
    
    if (searchLower.includes('network') || searchLower.includes('topology'))
      return <Network className={`${iconClasses} text-blue-400`} />;
    else if (searchLower.includes('flow') || searchLower.includes('process'))
      return <FlowIcon className={`${iconClasses} text-indigo-400`} />;
    else if (searchLower.includes('chart') || searchLower.includes('bar') || searchLower.includes('graph'))
      return <ChartBar className={`${iconClasses} text-purple-400`} />;
    else if (searchLower.includes('brain') || searchLower.includes('mind') || searchLower.includes('neural'))
      return <Brain className={`${iconClasses} text-pink-400`} />;
    else if (searchLower.includes('business') || searchLower.includes('organization'))
      return <Briefcase className={`${iconClasses} text-amber-400`} />;
    else if (searchLower.includes('chemical') || searchLower.includes('reaction') || searchLower.includes('molecular'))
      return <FlaskConical className={`${iconClasses} text-red-400`} />;
    else if (searchLower.includes('circuit') || searchLower.includes('electrical'))
      return <CircuitBoard className={`${iconClasses} text-orange-400`} />;
    else if (searchLower.includes('uml') || searchLower.includes('class') || searchLower.includes('database'))
      return <GitBranch className={`${iconClasses} text-teal-400`} />;
    else if (searchLower.includes('geo') || searchLower.includes('map'))
      return <Globe className={`${iconClasses} text-emerald-400`} />;
    else if (searchLower.includes('math') || searchLower.includes('geometry'))
      return <GeometryIcon className={`${iconClasses} text-cyan-400`} />;
    else if (searchLower.includes('physics') || searchLower.includes('atom'))
      return <Atom className={`${iconClasses} text-blue-400`} />;
    else if (searchLower.includes('concept') || searchLower.includes('idea'))
      return <Lightbulb className={`${iconClasses} text-yellow-400`} />;
    else if (searchLower.includes('activity') || searchLower.includes('timeline'))
      return <Activity className={`${iconClasses} text-green-400`} />;
    else if (searchLower.includes('architecture') || searchLower.includes('structure'))
      return <ScalingIcon className={`${iconClasses} text-violet-400`} />;
    else if (searchLower.includes('data') || searchLower.includes('analytics'))
      return <FileDigit className={`${iconClasses} text-blue-400`} />;
    else if (searchLower.includes('workflow') || searchLower.includes('service') || searchLower.includes('blueprint'))
      return <WorkflowIcon className={`${iconClasses} text-sky-400`} />;
    else
      return <Puzzle className={`${iconClasses} text-gray-400`} />;
  };

  useEffect(() => {
    if (scrollRef.current && !isHovering) {
      const scrollContainer = scrollRef.current;
      let scrollAmount = 0;
      const speed = 0.5; // pixels per frame
      
      const scrollInterval = setInterval(() => {
        scrollContainer.scrollLeft += speed;
        scrollAmount += speed;
        
        // Reset once we've scrolled the entire width
        if (scrollAmount >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
          scrollAmount = 0;
        }
      }, 20);
      
      return () => {
        clearInterval(scrollInterval);
      };
    }
  }, [isHovering]);

  return (
    <div
      className={`relative overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute top-0 bottom-0 left-0 w-8 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
      <div className="absolute top-0 bottom-0 right-0 w-8 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide py-2 space-x-2 whitespace-nowrap"
      >
        {/* Double the items to create the continuous scrolling effect */}
        {[...searches, ...searches].map((search, index) => (
          <button
            key={`${search}-${index}`}
            onClick={() => onClick(search)}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted/40 hover:bg-muted/70 transition-colors duration-200 border border-border/30 shadow-sm"
          >
            {getIconForSearch(search)}
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}
