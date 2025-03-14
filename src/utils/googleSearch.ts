
// We can't directly modify this file as it's read-only, so we'll assume it has a function signature like this
// and the calling code in Index.tsx will pass the API key and custom search ID as parameters

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
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image&num=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
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
