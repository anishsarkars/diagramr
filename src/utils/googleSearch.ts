
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
    // Enhanced query to focus on educational and study content
    const enhancedQuery = `${query} diagram educational high quality study research teaching concept`;
    
    // Use the API key and search engine ID provided
    // Add imgSize=large and imgType=photo to get higher quality images
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(enhancedQuery)}&searchType=image&num=10&imgSize=xlarge&imgType=photo&safe=active&highQuality=1&imgColorType=color&rights=cc_publicdomain,cc_attribute,cc_sharealike`;
    
    console.log("Fetching educational diagrams with URL:", url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
      console.log(`Found ${data.items.length} educational diagram results`);
      
      // Filter and enhance results to ensure they're study-related
      return data.items
        .filter((item: any) => {
          // Filter out non-educational looking results
          const lowerTitle = item.title.toLowerCase();
          const isEducational = 
            lowerTitle.includes('diagram') || 
            lowerTitle.includes('concept') || 
            lowerTitle.includes('study') || 
            lowerTitle.includes('learn') || 
            lowerTitle.includes('education') ||
            lowerTitle.includes('research') ||
            lowerTitle.includes('academic');
          
          // Make sure image is big enough to be readable
          const hasAcceptableSize = 
            (item.image?.height >= 400 || item.image?.width >= 400);
            
          return isEducational || hasAcceptableSize;
        })
        .map((item: any, index: number) => {
          // Generate helpful educational tags based on the content
          const titleWords = item.title.toLowerCase().split(' ');
          const commonEducationalTerms = ['diagram', 'concept', 'study', 'model', 'theory', 'map', 'chart', 'research', 'education', 'learning'];
          
          const tags = [
            ...query.split(' ').filter(word => word.length > 3),
            ...titleWords.filter(word => 
              word.length > 3 && 
              !query.toLowerCase().includes(word) && 
              commonEducationalTerms.some(term => word.includes(term))
            ),
            'educational'
          ].slice(0, 8); // Limit to 8 tags
          
          return {
            id: `google-${Date.now()}-${index}`,
            title: item.title,
            imageSrc: item.link,
            author: item.displayLink,
            authorUsername: item.displayLink.replace(/\./g, '_'),
            tags: [...new Set(tags)], // Remove duplicates
            sourceUrl: item.image.contextLink
          };
        });
    }
    
    return [];
  } catch (error) {
    console.error("Error searching Google Images:", error);
    return [];
  }
};
