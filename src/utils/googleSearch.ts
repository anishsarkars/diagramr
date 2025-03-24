
// Update the search function to accept API key and search engine ID

export async function searchGoogleImages(
  query: string,
  apiKey?: string,
  searchEngineId?: string,
  startPage: number = 1
): Promise<any[]> {
  // Default API keys (use the provided one or fall back to the first one)
  const API_KEYS = [
    'AIzaSyA1zArEu4m9HzEh-CO2Y7oFw0z_E_cFPsg',
    'AIzaSyBLb8xMhQIVk5G344igPWC3xEIPKjsbSn8',
    'AIzaSyDJBtnO8ZGzlDVfOTsL6BmCOn-yhGfPqgc'
  ];
  
  const DEFAULT_SEARCH_ENGINE_ID = '260090575ae504419';
  
  // Use provided keys or defaults
  const activeApiKey = apiKey || API_KEYS[0];
  const activeSearchEngineId = searchEngineId || DEFAULT_SEARCH_ENGINE_ID;
  
  const start = (startPage - 1) * 10 + 1; // Google CSE uses 1-based indexing with 10 results per page
  
  try {
    // Modify query for better diagram results if not specified
    const searchQuery = query.toLowerCase().includes('diagram') ? query : `${query} diagram`;
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${activeApiKey}&cx=${activeSearchEngineId}&q=${encodeURIComponent(searchQuery)}&searchType=image&imgType=clipart,lineart,drawing,stock&start=${start}&num=10`;
    
    console.log(`Making Google CSE API request with key ${activeApiKey.substring(0, 8)}... for query: ${searchQuery}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("Google API Error:", data.error.message);
      if (data.error.code === 403 && data.error.message.includes('quota')) {
        throw new Error('API quota exceeded');
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
      title: item.title || 'Untitled Diagram',
      imageSrc: item.link,
      sourceUrl: item.image?.contextLink || item.link,
      author: item.displayLink || '',
      relevanceScore: 1 - (index * 0.05), // Simple relevance scoring based on position
      isGenerated: false,
      tags: [query, 'diagram', item.displayLink?.split('.')[0] || ''].filter(Boolean)
    }));
    
  } catch (error) {
    console.error("Error in Google Image Search:", error);
    
    // Handle rate limiting by suggesting different API key
    if (error.message.includes('quota')) {
      console.warn("API quota exceeded, consider switching API keys");
    }
    
    throw error;
  }
}
