
import { DiagramResult } from "@/hooks/use-infinite-search";

export async function searchGoogleImages(
  query: string,
  apiKey: string = "AIzaSyAj41WJ5GYj0FLrz-dlRfoD5Uvo40aFSw4",
  searchEngineId: string = "260090575ae504419",
  page: number = 1
): Promise<DiagramResult[]> {
  const startIndex = (page - 1) * 10 + 1;
  
  try {
    console.log(`[GoogleSearch] Searching for "${query}" (page ${page}, start ${startIndex})`);
    
    const searchParams = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: query,
      searchType: 'image',
      start: startIndex.toString(),
      num: '10',
      imgSize: 'large',
      safe: 'active',
      rights: 'cc_publicdomain,cc_attribute,cc_sharealike',
    });
    
    const apiUrl = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[GoogleSearch] API Error:', errorData);
      
      // Check if quota exceeded
      if (errorData.error?.code === 403 || 
          errorData.error?.message?.includes('quota') || 
          errorData.error?.status === 'RESOURCE_EXHAUSTED') {
        throw new Error('API quota exceeded');
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('[GoogleSearch] No results found');
      return [];
    }
    
    console.log(`[GoogleSearch] Found ${data.items.length} results`);
    
    const results: DiagramResult[] = data.items.map((item: any, index: number) => ({
      id: `google-${page}-${index}-${Date.now()}`,
      title: item.title || 'Untitled Diagram',
      imageSrc: item.link,
      sourceUrl: item.image?.contextLink || item.link,
      author: item.displayLink || '',
      authorUsername: '',
      tags: [query.split(' ')[0], 'diagram', 'educational'],
      isGenerated: false
    }));
    
    return results;
  } catch (error) {
    console.error('[GoogleSearch] Error:', error);
    if (error.message === 'API quota exceeded') {
      // Re-throw quota error to handle specifically
      throw error;
    }
    return [];
  }
}
