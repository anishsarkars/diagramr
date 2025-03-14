
// Google Search API configuration
const GOOGLE_SEARCH_API_KEY = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4";
const GOOGLE_CUSTOM_SEARCH_ID = "260090575ae504419";

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
  items: GoogleSearchResult[];
}

export async function searchGoogleImages(query: string): Promise<any[]> {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_CUSTOM_SEARCH_ID}&q=${encodeURIComponent(query)}&searchType=image&num=9`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items) {
      console.log("No search results found");
      return [];
    }
    
    return data.items.map((item: GoogleSearchResult) => ({
      id: `google-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title,
      imageSrc: item.link,
      author: item.displayLink,
      authorUsername: item.displayLink.replace(/\./g, '_'),
      tags: query.toLowerCase().split(' '),
      sourceUrl: item.image.contextLink,
      isGenerated: false
    }));
  } catch (error) {
    console.error("Error fetching images from Google:", error);
    return [];
  }
}
