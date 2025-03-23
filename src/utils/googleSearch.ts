
import { DiagramResult } from "@/hooks/use-infinite-search";

interface GoogleSearchResult {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  mime: string;
  fileFormat: string;
  image: {
    contextLink: string;
    height: number;
    width: number;
    byteSize: number;
    thumbnailLink: string;
    thumbnailHeight: number;
    thumbnailWidth: number;
  };
}

interface GoogleSearchResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: any[];
    nextPage: any[];
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items: GoogleSearchResult[];
}

const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch (error) {
    return '';
  }
};

export async function searchGoogleImages(
  query: string,
  apiKey: string = "AIzaSyBLb8xMhQIVk5G344igPWC3xEIPKjsbSn8",
  searchId: string = "260090575ae504419",
  page: number = 1
): Promise<DiagramResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  const start = (page - 1) * 10 + 1;
  
  try {
    console.log(`Searching for: "${query}" (page ${page}, start ${start})`);
    
    let enhancedQuery = '';
    
    // Improved query enhancements based on subject matter
    if (query.toLowerCase().includes('biology') || 
        query.toLowerCase().includes('cell') || 
        query.toLowerCase().includes('anatomy') ||
        query.toLowerCase().includes('organism') ||
        query.toLowerCase().includes('plant') ||
        query.toLowerCase().includes('animal')) {
      enhancedQuery = `${query} biology educational diagram illustration high quality scientific`;
    }
    else if (query.toLowerCase().includes('chemistry') || 
        query.toLowerCase().includes('molecule') || 
        query.toLowerCase().includes('reaction') ||
        query.toLowerCase().includes('element') ||
        query.toLowerCase().includes('organic') ||
        query.toLowerCase().includes('periodic')) {
      enhancedQuery = `${query} chemistry educational diagram scientific illustration high quality`;
    }
    else if (query.toLowerCase().includes('physics') || 
        query.toLowerCase().includes('force') || 
        query.toLowerCase().includes('motion') ||
        query.toLowerCase().includes('energy') ||
        query.toLowerCase().includes('quantum') ||
        query.toLowerCase().includes('circuit')) {
      enhancedQuery = `${query} physics educational diagram scientific illustration high quality`;
    }
    else if (query.toLowerCase().includes('math') || 
        query.toLowerCase().includes('calculus') || 
        query.toLowerCase().includes('geometry') ||
        query.toLowerCase().includes('algebra') ||
        query.toLowerCase().includes('trigonometry')) {
      enhancedQuery = `${query} mathematics educational diagram illustration concept visualization high quality`;
    }
    else if (query.toLowerCase().includes('architecture') || 
        query.toLowerCase().includes('system') ||
        query.toLowerCase().includes('design') ||
        query.toLowerCase().includes('structure') ||
        query.toLowerCase().includes('blueprint')) {
      enhancedQuery = `${query} technical diagram professional illustration schematic high quality`;
    }
    else if (query.toLowerCase().includes('flow') ||
        query.toLowerCase().includes('process') ||
        query.toLowerCase().includes('workflow') ||
        query.toLowerCase().includes('sequence') ||
        query.toLowerCase().includes('pipeline')) {
      enhancedQuery = `${query} flowchart process diagram educational visualization high quality`;
    }
    else if (query.toLowerCase().includes('uml') ||
        query.toLowerCase().includes('class diagram') ||
        query.toLowerCase().includes('sequence diagram') ||
        query.toLowerCase().includes('object diagram')) {
      enhancedQuery = `${query} software engineering diagram uml visualization professional high quality`;
    }
    else if (query.toLowerCase().includes('data structure') || 
        query.toLowerCase().includes('algorithm') ||
        query.toLowerCase().includes('binary tree') ||
        query.toLowerCase().includes('hash table') ||
        query.toLowerCase().includes('linked list')) {
      enhancedQuery = `${query} computer science diagram visualization high quality educational`;
    }
    else if (query.toLowerCase().includes('network') || 
        query.toLowerCase().includes('topology') ||
        query.toLowerCase().includes('protocol') ||
        query.toLowerCase().includes('router') ||
        query.toLowerCase().includes('infrastructure')) {
      enhancedQuery = `${query} network diagram topology illustration professional high quality`;
    }
    else if (query.toLowerCase().includes('database') || 
        query.toLowerCase().includes('schema') ||
        query.toLowerCase().includes('entity') ||
        query.toLowerCase().includes('er diagram') ||
        query.toLowerCase().includes('relational')) {
      enhancedQuery = `${query} database schema er diagram entity relationship illustration professional`;
    }
    else {
      enhancedQuery = `${query} diagram educational professional visualization high quality illustration`;
    }
    
    console.log(`Enhanced query: "${enhancedQuery}"`);
    
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('cx', searchId);
    url.searchParams.append('q', enhancedQuery);
    url.searchParams.append('searchType', 'image');
    url.searchParams.append('start', start.toString());
    url.searchParams.append('num', '10');
    // Use better image filtering options
    url.searchParams.append('imgType', 'clipart,drawing,illustration');
    url.searchParams.append('imgDominantColor', 'white,gray'); // Diagrams often have white/gray backgrounds
    url.searchParams.append('imgSize', 'large,xlarge'); // Prefer larger diagrams for better detail
    url.searchParams.append('safe', 'active');
    url.searchParams.append('filter', '1');
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      if (response.status === 429 || response.status === 403) {
        console.error('API quota exceeded or access denied');
        throw new Error('API quota exceeded');
      }
      throw new Error(`Google search failed with status: ${response.status}`);
    }
    
    const data: GoogleSearchResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No search results found');
      return [];
    }
    
    const scoredResults = data.items.map((item, index) => {
      const domain = extractDomain(item.image.contextLink);
      
      // Initial score based on result position
      let relevanceScore = 10 - Math.min(index, 9);
      
      const title = item.title.toLowerCase();
      const snippet = (item.snippet || '').toLowerCase();
      const queryTerms = query.toLowerCase().split(' ');
      
      // Title relevance scoring
      if (title.includes(query.toLowerCase())) relevanceScore += 20; // Exact query match
      
      queryTerms.forEach(term => {
        if (term.length > 2 && title.includes(term)) relevanceScore += 5; // Individual term matches
        if (term.length > 2 && snippet.includes(term)) relevanceScore += 3; // Snippet term matches
      });
      
      // Diagram-specific terms scoring
      if (title.includes('diagram')) relevanceScore += 15;
      if (title.includes('chart') || title.includes('graph')) relevanceScore += 10;
      if (title.includes('illustration') || title.includes('visualization')) relevanceScore += 8;
      if (title.includes('educational') || title.includes('academic')) relevanceScore += 12;
      if (title.includes('scientific') || title.includes('technical')) relevanceScore += 10;
      
      // Quality source scoring - educational and professional sites
      const qualitySources = [
        'edu', 'ac.uk', 'ac.jp', '.edu.', 'university', 'college', 'school',
        'lucidchart', 'draw.io', 'diagrams.net', 'researchgate', 'springer',
        'ieee', 'acm.org', 'sciencedirect', 'nature.com', 'textbook',
        'creately', 'gliffy', 'visual-paradigm', 'geeksforgeeks',
        'javatpoint', 'tutorialspoint', 'khanacademy', 'coursera', 'edx',
        'stackoverflow', 'github', 'visualgo.net', 'medium', 'dev.to',
        'microsoft', 'amazon', 'google', 'ibm', 'cisco', 'oracle', 
        'mongodb', 'mysql', 'postgresql'
      ];
      
      qualitySources.forEach(source => {
        if (domain.includes(source)) relevanceScore += 20;
      });
      
      // Subject-specific scoring boosts
      if (query.toLowerCase().includes('biology') && 
         (title.includes('biology') || title.includes('cell') || title.includes('organism'))) {
        relevanceScore += 15;
      }
      
      if (query.toLowerCase().includes('chemistry') && 
         (title.includes('chemistry') || title.includes('molecule') || title.includes('element'))) {
        relevanceScore += 15;
      }
      
      if (query.toLowerCase().includes('physics') && 
         (title.includes('physics') || title.includes('force') || title.includes('energy'))) {
        relevanceScore += 15;
      }
      
      if (query.toLowerCase().includes('uml') && 
         (title.includes('uml') || title.includes('class diagram') || title.includes('sequence diagram'))) {
        relevanceScore += 15;
      }
      
      if ((query.toLowerCase().includes('data structure') || query.toLowerCase().includes('algorithm')) && 
         (title.includes('data structure') || title.includes('algorithm') || title.includes('tree') || title.includes('graph'))) {
        relevanceScore += 15;
      }
      
      // Generate tags automatically from title
      const tags = title.split(/\s+/)
                    .filter(word => word.length > 3)
                    .filter(word => !['and', 'the', 'for', 'with', 'this', 'that'].includes(word))
                    .slice(0, 5);
                    
      // Add query terms to tags
      queryTerms.forEach(term => {
        if (term.length > 3 && !tags.includes(term)) {
          tags.push(term);
        }
      });
      
      // Generate better title if original is too long or unclear
      let enhancedTitle = item.title;
      if (enhancedTitle.length > 100) {
        enhancedTitle = enhancedTitle.substring(0, 100) + '...';
      }
      
      // If title doesn't contain the query, add it for clarity
      if (!enhancedTitle.toLowerCase().includes(query.toLowerCase())) {
        enhancedTitle = `${query.charAt(0).toUpperCase() + query.slice(1)} - ${enhancedTitle}`;
      }
      
      const result: DiagramResult & { relevanceScore?: number } = {
        id: `${Date.now()}-${page}-${index}`,
        title: enhancedTitle,
        imageSrc: item.link,
        sourceUrl: item.image.contextLink,
        author: domain,
        authorUsername: domain,
        tags: tags,
        isGenerated: false,
        relevanceScore // Include score for sorting
      };
      
      return result;
    });
    
    // Sort results by relevance score (highest first)
    const sortedResults = scoredResults.sort((a, b) => 
      (b.relevanceScore || 0) - (a.relevanceScore || 0)
    );
    
    // Remove relevanceScore property before returning
    return sortedResults.map(({ relevanceScore, ...rest }) => rest as DiagramResult);
    
  } catch (error) {
    console.error('Error in Google search:', error);
    throw error;
  }
}
