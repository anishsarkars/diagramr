
// Google Search API utility for fetching high-quality image results

type SearchResult = {
  id: string;
  title: string;
  imageSrc: string;
  author?: string;
  authorUsername?: string;
  tags?: string[];
  sourceUrl?: string;
};

export const searchGoogleImages = async (
  query: string,
  apiKey: string = "",
  searchEngineId: string = ""
): Promise<SearchResult[]> => {
  try {
    // Use the API key and search engine ID provided
    // Add imgSize=large and imgType=photo to get higher quality images
    // Also add highQuality=1 and imgColorType=color parameters for better results
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image&num=10&imgSize=xlarge&imgType=photo&safe=active&highQuality=1&imgColorType=color`;
    
    console.log("Fetching images from Google with URL:", url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
      console.log(`Found ${data.items.length} image results`);
      
      return data.items.map((item: any, index: number) => ({
        id: `google-${Date.now()}-${index}`,
        title: item.title,
        imageSrc: item.link,
        author: item.displayLink,
        authorUsername: item.displayLink.replace(/\./g, '_'),
        tags: query.split(' ').filter(word => word.length > 3),
        sourceUrl: item.image.contextLink
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error searching Google Images:", error);
    return [];
  }
};
