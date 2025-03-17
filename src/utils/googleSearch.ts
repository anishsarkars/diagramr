
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
    // Enhanced query to focus on educational and high-quality diagrams
    const enhancedQuery = `${query} diagram educational high quality high resolution study research teaching concept`;
    
    // Use the API key and search engine ID provided
    // Add imgSize=xlarge and imgType=photo to get higher quality images
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(enhancedQuery)}&searchType=image&num=10&imgSize=xlarge&imgType=photo&safe=active&highRange=1&imgColorType=color&rights=cc_publicdomain,cc_attribute,cc_sharealike&fileType=jpg,png`;
    
    console.log("Fetching high-quality educational diagrams...");
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
      console.log(`Found ${data.items.length} educational diagram results`);
      
      // Filter and enhance results to ensure they're study-related and high quality
      return data.items
        .filter((item: any) => {
          // Filter out non-educational looking results
          const lowerTitle = item.title.toLowerCase();
          const lowerSnippet = (item.snippet || "").toLowerCase();
          
          const isEducational = 
            lowerTitle.includes('diagram') || 
            lowerTitle.includes('concept') || 
            lowerTitle.includes('study') || 
            lowerTitle.includes('learn') || 
            lowerTitle.includes('education') ||
            lowerTitle.includes('research') ||
            lowerTitle.includes('academic') ||
            lowerTitle.includes('infographic') ||
            lowerSnippet.includes('educational') ||
            lowerSnippet.includes('learning');
          
          // Make sure image is big enough to be high quality
          const hasAcceptableSize = 
            (item.image?.height >= 600 || item.image?.width >= 800);
            
          return isEducational && hasAcceptableSize;
        })
        .map((item: any, index: number) => {
          // Generate helpful educational tags based on the content
          const titleWords = item.title.toLowerCase().split(' ');
          const queryTerms = query.toLowerCase().split(' ');
          const educationalTerms = ['diagram', 'concept', 'study', 'model', 'theory', 'map', 'chart', 'research', 'education', 'learning'];
          
          // Extract relevant tags from title and query
          const tags = [
            ...queryTerms.filter(word => word.length > 3),
            ...titleWords.filter(word => 
              word.length > 3 && 
              !queryTerms.includes(word) && 
              (educationalTerms.includes(word) || Math.random() > 0.7) // Include some random relevant words as tags
            ),
            'educational'
          ]
          .slice(0, 8) // Limit to 8 tags
          .filter((tag, i, arr) => arr.indexOf(tag) === i); // Remove duplicates
          
          return {
            id: `google-${Date.now()}-${index}`,
            title: item.title,
            imageSrc: item.link,
            author: item.displayLink,
            authorUsername: item.displayLink.replace(/\./g, '_').replace(/^www\./, ''),
            tags: tags,
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
