
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

// Array of API keys to rotate through
const API_KEYS = [
  "AIzaSyA1zArEu4m9HzEh-CO2Y7oFw0z_E_cFPsg",
  "AIzaSyBLb8xMhQIVk5G344igPWC3xEIPKjsbSn8", 
  "AIzaSyDJBtnO8ZGzlDVfOTsL6BmCOn-yhGfPqgc"
];

// Track API key usage and errors
let currentApiKeyIndex = 0;
const apiErrorCounts: Record<number, number> = {};

// Function to get the next available API key
const getNextApiKey = (): string => {
  // Simple rotation through available keys
  currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
  return API_KEYS[currentApiKeyIndex];
};

export async function searchGoogleImages(
  query: string,
  apiKey: string = API_KEYS[currentApiKeyIndex],
  searchId: string = "260090575ae504419",
  page: number = 1
): Promise<DiagramResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  const start = (page - 1) * 10 + 1;
  
  try {
    console.log(`Searching for: "${query}" (page ${page}, start ${start})`);
    
    // Build a less restrictive search query that allows for broader results
    // but still focuses on diagram-like content
    let enhancedQuery = `${query} diagram OR chart OR visualization OR infographic`;
    
    console.log(`Enhanced query: "${enhancedQuery}"`);
    
    const url = new URL('https://customsearch.googleapis.com/customsearch/v1');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('cx', searchId);
    url.searchParams.append('q', enhancedQuery);
    url.searchParams.append('searchType', 'image');
    url.searchParams.append('start', start.toString());
    url.searchParams.append('num', '10');
    url.searchParams.append('imgType', 'clipart,drawing,photo');
    url.searchParams.append('safe', 'active');
    url.searchParams.append('filter', '1');
    
    console.log("Search URL:", url.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error response:', errorText);
      
      if (response.status === 429 || response.status === 403) {
        console.error('API quota exceeded or access denied for key index', currentApiKeyIndex);
        
        // Increment error count for this API key
        apiErrorCounts[currentApiKeyIndex] = (apiErrorCounts[currentApiKeyIndex] || 0) + 1;
        
        // If we've had multiple errors with this key, try the next one
        if (apiErrorCounts[currentApiKeyIndex] > 2) {
          const nextApiKey = getNextApiKey();
          console.log(`Switching to next API key: ${nextApiKey}`);
          
          // Recursive call with the new API key
          return searchGoogleImages(query, nextApiKey, searchId, page);
        }
        
        throw new Error('API quota exceeded');
      }
      throw new Error(`Google search failed with status: ${response.status}`);
    }
    
    // Reset error count for this API key since it worked
    apiErrorCounts[currentApiKeyIndex] = 0;
    
    const data: GoogleSearchResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No search results found');
      return [];
    }
    
    const results = data.items.map((item, index) => {
      const domain = extractDomain(item.image.contextLink);
      
      // Simplified relevance scoring that doesn't overly filter
      let relevanceScore = 10 - Math.min(index, 9);
      
      const title = item.title.toLowerCase();
      const snippet = (item.snippet || '').toLowerCase();
      const queryTerms = query.toLowerCase().split(' ');
      
      // Boost exact matches to query
      if (title.includes(query.toLowerCase())) relevanceScore += 10;
      
      // Boost matches to query terms
      queryTerms.forEach(term => {
        if (term.length > 2 && title.includes(term)) relevanceScore += 3;
        if (term.length > 2 && snippet.includes(term)) relevanceScore += 2;
      });
      
      // Small boost for diagram-related content
      if (title.includes('diagram') || title.includes('chart') || 
          title.includes('illustration') || title.includes('visualization')) {
        relevanceScore += 5;
      }
      
      // Extract tags from title
      const tags = title.split(/\s+/)
                    .filter(word => word.length > 3)
                    .filter(word => !['and', 'the', 'for', 'with', 'this', 'that'].includes(word))
                    .slice(0, 5);
                    
      queryTerms.forEach(term => {
        if (term.length > 3 && !tags.includes(term)) {
          tags.push(term);
        }
      });
      
      let enhancedTitle = item.title;
      if (enhancedTitle.length > 100) {
        enhancedTitle = enhancedTitle.substring(0, 100) + '...';
      }
      
      const result: DiagramResult = {
        id: `${Date.now()}-${page}-${index}`,
        title: enhancedTitle,
        imageSrc: item.link,
        sourceUrl: item.image.contextLink,
        author: domain,
        authorUsername: domain,
        tags: tags,
        isGenerated: false,
        relevanceScore
      };
      
      return result;
    });
    
    // Sort by relevance but don't remove any results
    return results.sort((a, b) => 
      (b.relevanceScore || 0) - (a.relevanceScore || 0)
    );
    
  } catch (error) {
    console.error('Error in Google search:', error);
    
    // If this isn't already a retry and it's not a quota error, try with a different API key
    if (error.message !== 'API quota exceeded' && apiKey === API_KEYS[currentApiKeyIndex]) {
      const nextApiKey = getNextApiKey();
      console.log(`Error occurred. Trying with next API key: ${nextApiKey}`);
      return searchGoogleImages(query, nextApiKey, searchId, page);
    }
    
    throw error;
  }
}
