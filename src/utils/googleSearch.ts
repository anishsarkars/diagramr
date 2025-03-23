
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

// Function to extract domain name from URL
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
    
    // Create a more specific enhanced query based on the search term
    let enhancedQuery = '';
    
    // Subject-specific query enhancements
    if (query.toLowerCase().includes('biology') || 
        query.toLowerCase().includes('cell') || 
        query.toLowerCase().includes('anatomy')) {
      enhancedQuery = `${query} biology educational diagram study visualization`;
    }
    else if (query.toLowerCase().includes('chemistry') || 
        query.toLowerCase().includes('molecule') || 
        query.toLowerCase().includes('reaction')) {
      enhancedQuery = `${query} chemistry educational diagram study visualization`;
    }
    else if (query.toLowerCase().includes('physics') || 
        query.toLowerCase().includes('force') || 
        query.toLowerCase().includes('motion')) {
      enhancedQuery = `${query} physics educational diagram study visualization`;
    }
    else if (query.toLowerCase().includes('math') || 
        query.toLowerCase().includes('calculus') || 
        query.toLowerCase().includes('geometry')) {
      enhancedQuery = `${query} mathematics educational diagram study visualization`;
    }
    // Engineering and technical diagrams
    else if (query.toLowerCase().includes('architecture') || 
        query.toLowerCase().includes('system') ||
        query.toLowerCase().includes('design')) {
      enhancedQuery = `${query} technical diagram professional illustration educational`;
    }
    // Flow diagrams
    else if (query.toLowerCase().includes('flow') ||
        query.toLowerCase().includes('process') ||
        query.toLowerCase().includes('workflow')) {
      enhancedQuery = `${query} flowchart process diagram educational`;
    }
    // UML and technical diagrams
    else if (query.toLowerCase().includes('uml') ||
        query.toLowerCase().includes('class diagram') ||
        query.toLowerCase().includes('sequence diagram')) {
      enhancedQuery = `${query} software engineering diagram educational`;
    }
    // Computer science and data structure diagrams
    else if (query.toLowerCase().includes('data structure') || 
        query.toLowerCase().includes('algorithm')) {
      enhancedQuery = `${query} computer science diagram visualization educational`;
    }
    // General educational diagram enhancement
    else {
      enhancedQuery = `${query} diagram educational visualization high quality`;
    }
    
    console.log(`Enhanced query: "${enhancedQuery}"`);
    
    // Construct API URL with parameters
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('cx', searchId);
    url.searchParams.append('q', enhancedQuery);
    url.searchParams.append('searchType', 'image');
    url.searchParams.append('start', start.toString());
    url.searchParams.append('num', '10');
    url.searchParams.append('imgType', 'clipart');
    url.searchParams.append('imgSize', 'large');
    url.searchParams.append('safe', 'active');
    url.searchParams.append('filter', '1'); // Filter duplicate results
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      // Check for quota exceeded
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
    
    // Filter and score results for better relevance
    const scoredResults = data.items.map((item, index) => {
      const domain = extractDomain(item.image.contextLink);
      
      // Calculate relevance score based on title, domain, and position
      let relevanceScore = 10 - Math.min(index, 9); // Position score (0-9)
      
      // Title relevance
      const title = item.title.toLowerCase();
      const queryTerms = query.toLowerCase().split(' ');
      
      // Add score for query terms in title
      queryTerms.forEach(term => {
        if (title.includes(term)) relevanceScore += 5;
      });
      
      // Add score for educational content
      if (title.includes('diagram') || title.includes('chart')) relevanceScore += 10;
      if (title.includes('educational') || title.includes('study')) relevanceScore += 8;
      
      // Quality source score
      const qualitySources = ['edu', 'ac.uk', 'university', 'school', 'textbook', 
                             'lucidchart', 'draw.io', 'diagrams.net', 'researchgate'];
      qualitySources.forEach(source => {
        if (domain.includes(source)) relevanceScore += 15;
      });
      
      const result: DiagramResult = {
        id: `${Date.now()}-${page}-${index}`,
        title: item.title,
        imageSrc: item.link,
        sourceUrl: item.image.contextLink,
        author: domain,
        authorUsername: domain,
        tags: queryTerms.filter(word => word.length > 3),
        isGenerated: false,
        relevanceScore // Add score for sorting later
      };
      
      return result;
    });
    
    // Sort by relevance score and remove the score property
    return scoredResults
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .map(({ relevanceScore, ...rest }) => rest);
  } catch (error) {
    console.error('Error in Google search:', error);
    throw error;
  }
}
