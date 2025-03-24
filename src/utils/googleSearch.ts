
// Update the search function to accept API key and search engine ID and fix API rotation

// Track failed API keys to avoid using them again
const failedApiKeys = new Set<string>();

export async function searchGoogleImages(
  query: string,
  apiKey?: string,
  searchEngineId?: string,
  startPage: number = 1
): Promise<any[]> {
  // Default API keys 
  const API_KEYS = [
    'AIzaSyA1zArEu4m9HzEh-CO2Y7oFw0z_E_cFPsg',
    'AIzaSyBLb8xMhQIVk5G344igPWC3xEIPKjsbSn8',
    'AIzaSyDJBtnO8ZGzlDVfOTsL6BmCOn-yhGfPqgc'
  ];
  
  const DEFAULT_SEARCH_ENGINE_ID = '260090575ae504419';
  
  // Filter out known failed API keys
  const availableApiKeys = API_KEYS.filter(key => !failedApiKeys.has(key));
  
  // If provided API key is marked as failed, ignore it
  if (apiKey && failedApiKeys.has(apiKey)) {
    apiKey = undefined;
  }
  
  // Use provided keys or get next available key
  let activeApiKey = apiKey;
  if (!activeApiKey || failedApiKeys.has(activeApiKey)) {
    if (availableApiKeys.length === 0) {
      // Reset failed keys if all keys have failed - they might work again after some time
      failedApiKeys.clear();
      activeApiKey = API_KEYS[0];
    } else {
      // Get next available key randomly to distribute load
      const randomIndex = Math.floor(Math.random() * availableApiKeys.length);
      activeApiKey = availableApiKeys[randomIndex];
    }
  }
  
  const activeSearchEngineId = searchEngineId || DEFAULT_SEARCH_ENGINE_ID;
  
  const start = (startPage - 1) * 10 + 1; // Google CSE uses 1-based indexing with 10 results per page
  
  try {
    console.log(`Making Google CSE API request with key ${activeApiKey.substring(0, 8)}... for query: ${query}`);
    
    // Don't modify the query to always add "diagram" - search for what the user wants
    const searchQuery = query;
    
    // Construct search URL with more generic search parameters
    const url = `https://www.googleapis.com/customsearch/v1?key=${activeApiKey}&cx=${activeSearchEngineId}&q=${encodeURIComponent(searchQuery)}&searchType=image&start=${start}&num=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("Google API Error:", data.error.message);
      
      if (data.error.code === 403 && data.error.message.includes('quota')) {
        console.warn(`API key ${activeApiKey.substring(0, 8)}... has exceeded quota. Marking as failed.`);
        failedApiKeys.add(activeApiKey);
        
        // Retry with another API key
        if (availableApiKeys.length > 1) {
          console.log("Retrying with another API key...");
          return searchGoogleImages(query, undefined, searchEngineId, startPage);
        }
        
        throw new Error('API quota exceeded for all keys');
      }
      
      throw new Error(data.error.message);
    }
    
    if (!data.items || data.items.length === 0) {
      console.log("No results found for query:", searchQuery);
      return [];
    }
    
    // Transform the results to match our DiagramResult interface
    return data.items.map((item: any, index: number) => ({
      id: `google-${startPage}-${index}-${Date.now()}`,
      title: item.title || 'Untitled Image',
      imageSrc: item.link,
      sourceUrl: item.image?.contextLink || item.link,
      author: item.displayLink || '',
      relevanceScore: 1 - (index * 0.05), // Simple relevance scoring based on position
      isGenerated: false,
      tags: [query, item.displayLink?.split('.')[0] || ''].filter(Boolean)
    }));
    
  } catch (error) {
    console.error("Error in Google Image Search:", error);
    
    // Handle rate limiting by suggesting different API key
    if (error.message.includes('quota')) {
      if (activeApiKey) {
        failedApiKeys.add(activeApiKey);
      }
      
      // Check if we have more API keys to try
      if (availableApiKeys.length > 1) {
        console.log("Retrying with another API key...");
        return searchGoogleImages(query, undefined, searchEngineId, startPage);
      }
    }
    
    throw error;
  }
}
