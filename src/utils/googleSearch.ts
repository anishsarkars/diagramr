
// Enhanced Google Search API utility for fetching high-quality, relevant diagram results

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
  searchEngineId: string = "",
  page: number = 1
): Promise<SearchResult[]> => {
  try {
    // Create an enhanced query that focuses on educational diagrams
    const coreTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
    
    // Domain-specific modifiers to improve relevance
    const domainSpecificTerms = [
      "diagram", "educational", "visualization", "infographic",
      "high quality", "high resolution", "concept map", "visual explanation",
      "educational diagram", "visual guide", "illustrated concept"
    ];
    
    // Add domain-specific terms only if they aren't already in the query
    const enhancementTerms = domainSpecificTerms.filter(term => 
      !coreTerms.some(coreTerm => term.includes(coreTerm))
    );
    
    // Construct final query with exact phrase matching and enhancements
    const enhancedQuery = `"${query}" ${enhancementTerms.slice(0, 5).join(' ')}`;
    
    // Calculate start index for pagination
    const startIndex = (page - 1) * 10 + 1;
    
    // Add more specific search parameters for better results
    const searchParams = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: enhancedQuery,
      searchType: 'image',
      num: '10',
      start: startIndex.toString(),
      imgSize: 'xlarge',
      imgType: 'photo',
      safe: 'active',
      rights: 'cc_publicdomain,cc_attribute,cc_sharealike',
      fileType: 'jpg,png',
      sort: 'relevance'
    });
    
    const url = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;
    
    console.log(`Fetching diagrams for: "${query}" (Page ${page})`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google API: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      console.log(`Found ${data.items.length} results for page ${page}`);
      
      // Map and format the results
      return data.items
        .map((item: any, index: number) => {
          // Generate more specific and meaningful tags
          const tags = generateTags(item, query);
          
          return {
            id: `google-${Date.now()}-${index}-${page}`,
            title: item.title,
            imageSrc: item.link,
            author: item.displayLink,
            authorUsername: item.displayLink.replace(/\./g, '_').replace(/^www\./, ''),
            tags: tags,
            sourceUrl: item.image?.contextLink || '#'
          };
        })
        .filter((item: any) => {
          // Basic filtering to ensure we only get diagram-like images
          const title = item.title.toLowerCase();
          const hasDiagramTerms = title.includes('diagram') || 
                                title.includes('chart') || 
                                title.includes('graph') || 
                                title.includes('map') ||
                                title.includes('concept');
          
          return hasDiagramTerms || 
                 item.tags.some((tag: string) => 
                    ['diagram', 'chart', 'infographic', 'flowchart', 'graph'].includes(tag)
                 );
        });
    }
    
    // If no results, try a different query
    if (page === 1) {
      return performAlternativeSearch(query, apiKey, searchEngineId);
    }
    
    return [];
  } catch (error) {
    console.error("Error searching Google Images:", error);
    if (page === 1) {
      return performAlternativeSearch(query, apiKey, searchEngineId);
    }
    return [];
  }
};

// Alternative search with different query structure
const performAlternativeSearch = async (
  query: string,
  apiKey: string,
  searchEngineId: string
): Promise<SearchResult[]> => {
  try {
    console.log("Performing alternative search for:", query);
    
    // Different query approach
    const alternativeQuery = `${query} diagram educational concept visualization`;
    
    const searchParams = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: alternativeQuery,
      searchType: 'image',
      num: '10',
      imgSize: 'large',
      rights: 'cc_publicdomain,cc_attribute,cc_sharealike',
    });
    
    const url = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      console.log(`Found ${data.items.length} results in alternative search`);
      
      return data.items.map((item: any, index: number) => {
        const tags = generateTags(item, query);
        
        return {
          id: `google-alt-${Date.now()}-${index}`,
          title: item.title,
          imageSrc: item.link,
          author: item.displayLink,
          authorUsername: item.displayLink.replace(/\./g, '_').replace(/^www\./, ''),
          tags: tags,
          sourceUrl: item.image?.contextLink || '#'
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error("Error in alternative search:", error);
    return [];
  }
};

// Generate meaningful tags for results
const generateTags = (item: any, query: string): string[] => {
  const queryTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
  const title = item.title?.toLowerCase() || '';
  const snippet = item.snippet?.toLowerCase() || '';
  
  // Start with query terms as base tags
  const tags = [...queryTerms];
  
  // Extract keywords from title
  const titleWords = title.split(' ')
    .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(word => word.length > 3 && !queryTerms.includes(word));
  
  // Extract keywords from snippet
  const snippetWords = (snippet || '').split(' ')
    .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(word => word.length > 3 && !queryTerms.includes(word) && !titleWords.includes(word));
  
  // Educational keywords to include if relevant
  const educationalKeywords = ['diagram', 'concept', 'visual', 'model', 'theory', 'framework', 'map', 'chart', 'infographic'];
  const additionalTags = educationalKeywords.filter(keyword => 
    title.includes(keyword) || snippet?.includes(keyword)
  );
  
  // Combine all potential tags and remove duplicates
  const allTags = [...tags, ...titleWords.slice(0, 3), ...snippetWords.slice(0, 2), ...additionalTags];
  const uniqueTags = Array.from(new Set(allTags));
  
  // Return limited number of tags
  return uniqueTags.slice(0, 8);
};
