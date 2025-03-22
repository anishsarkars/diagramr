
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
  apiKey: string = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4",
  searchId: string = "260090575ae504419",
  page: number = 1
): Promise<DiagramResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  const start = (page - 1) * 10 + 1;
  
  try {
    console.log(`Searching for: "${query}" (page ${page}, start ${start})`);
    
    // Enhanced query to focus on diagrams and educational content
    const enhancedQuery = `${query} diagram educational visualization`;
    
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
    
    // Map Google search results to DiagramResult format
    return data.items.map((item, index) => {
      const domain = extractDomain(item.image.contextLink);
      
      return {
        id: `${Date.now()}-${page}-${index}`,
        title: item.title,
        imageSrc: item.link,
        sourceUrl: item.image.contextLink,
        author: domain,
        authorUsername: domain,
        tags: query.split(' ').filter(word => word.length > 3),
        isGenerated: false
      };
    });
  } catch (error) {
    console.error('Error in Google search:', error);
    throw error;
  }
}
