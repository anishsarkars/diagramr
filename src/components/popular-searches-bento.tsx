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
  GitCommit as WorkflowIcon,
  Database
} from 'lucide-react';

interface PopularSearchesBentoProps {
  onSearch: (query: string) => void;
}

export function PopularSearchesBento({ onSearch }: PopularSearchesBentoProps) {
  // Using GitBranch as Database icon since there's no Database icon in the imports
  const DatabaseIcon = GitBranch;

  // Diagram categories with their icons and descriptions
  const categories = [
    {
      id: 'uml',
      name: 'UML Diagrams',
      icon: <GitBranch className="h-4 w-4 text-teal-400" />,
      description: 'System architecture & software design',
      searches: ['Class Diagram', 'Sequence Diagram', 'Use Case Diagram']
    },
    {
      id: 'flowcharts',
      name: 'Flowcharts',
      icon: <FlowIcon className="h-4 w-4 text-indigo-400" />,
      description: 'Process flows & decision trees',
      searches: ['Flow Chart', 'Process Flow', 'Decision Tree']
    },
    {
      id: 'er',
      name: 'ER Diagrams',
      icon: <DatabaseIcon className="h-4 w-4 text-blue-400" />,
      description: 'Database schemas & relationships',
      searches: ['ER Diagram', 'Database Schema', 'Relational Model']
    },
    {
      id: 'mindmaps',
      name: 'Mind Maps',
      icon: <Brain className="h-4 w-4 text-pink-400" />,
      description: 'Visual organization of ideas',
      searches: ['Mind Map', 'Concept Map', 'Knowledge Graph']
    },
    {
      id: 'networks',
      name: 'Network Diagrams',
      icon: <Network className="h-4 w-4 text-violet-400" />,
      description: 'System connections & architecture',
      searches: ['Network Topology', 'System Architecture', 'Component Diagram']
    },
    {
      id: 'science',
      name: 'Scientific Diagrams',
      icon: <Atom className="h-4 w-4 text-blue-400" />,
      description: 'Chemistry, physics & biology',
      searches: ['Molecular Structure', 'Atomic Model', 'Cell Diagram']
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {categories.map((category) => (
        <div 
          key={category.id}
          className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-4 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-muted">
              {category.icon}
            </div>
            <h3 className="font-medium text-sm">{category.name}</h3>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
          
          <div className="flex flex-wrap gap-1.5">
            {category.searches.map((search) => (
              <button
                key={search}
                onClick={() => onSearch(search)}
                className="text-xs px-2 py-1 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors duration-200"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 