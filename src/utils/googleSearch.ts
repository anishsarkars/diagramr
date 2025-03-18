
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
    
    // Domain-specific modifiers to improve relevance for various professional contexts
    const domainSpecificTerms = [
      "diagram", "infographic", "visualization", "chart", "flowchart", 
      "high quality", "high resolution", "concept map", "visual explanation",
      "professional diagram", "visual guide", "illustrated concept", "technical diagram",
      "process flow", "architecture diagram", "system diagram", "visual representation"
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
      num: '20', // Increased from 10 to 20 for more results per request
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
      const results = data.items
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
          // Improved filtering to ensure we get relevant diagram-like images
          const title = item.title.toLowerCase();
          const hasRelevantTerms = title.includes('diagram') || 
                                title.includes('chart') || 
                                title.includes('graph') || 
                                title.includes('map') ||
                                title.includes('concept') ||
                                title.includes('flow') ||
                                title.includes('process') ||
                                title.includes('system') ||
                                title.includes('architecture');
          
          return hasRelevantTerms || 
                 item.tags.some((tag: string) => 
                    ['diagram', 'chart', 'infographic', 'flowchart', 'graph', 'architecture', 'system'].includes(tag)
                 );
        });
      
      // If it's the first page, immediately initiate fetching of next pages
      if (page === 1) {
        initiateBackgroundFetching(query, apiKey, searchEngineId, 2);
      }
      
      return results;
    }
    
    // If no results, try alternative search approaches
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

// Initiate background fetching of additional pages to prepare for infinite scroll
const initiateBackgroundFetching = (query: string, apiKey: string, searchEngineId: string, startPage: number) => {
  // Fetch up to 5 additional pages in the background
  for (let page = startPage; page <= startPage + 4; page++) {
    setTimeout(() => {
      searchGoogleImages(query, apiKey, searchEngineId, page)
        .then(results => {
          console.log(`Background fetched ${results.length} results for page ${page}`);
          // Store these results in sessionStorage for quick access
          const cacheKey = `diagramr-search-${query}-page-${page}`;
          sessionStorage.setItem(cacheKey, JSON.stringify(results));
        })
        .catch(err => {
          console.error(`Error in background fetching for page ${page}:`, err);
        });
    }, (page - startPage) * 2000); // Stagger requests to avoid rate limiting
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
    
    // Try multiple alternative approaches
    const alternativeQueries = [
      // Approach 1: Use more general terms
      `${query} diagram visualization concept`,
      
      // Approach 2: Focus on educational context
      `${query} educational diagram learning resource`,
      
      // Approach 3: Focus on professional/business context
      `${query} professional diagram business presentation`,
      
      // Approach 4: Technical approach
      `${query} technical diagram documentation`,
      
      // Approach 5: Focus on specific diagram types
      `${query} flowchart process infographic`
    ];
    
    // Try each alternative query
    for (const alternativeQuery of alternativeQueries) {
      const searchParams = new URLSearchParams({
        key: apiKey,
        cx: searchEngineId,
        q: alternativeQuery,
        searchType: 'image',
        num: '20',
        imgSize: 'large',
        imgType: 'photo',
        safe: 'active',
        rights: 'cc_publicdomain,cc_attribute,cc_sharealike',
      });
      
      const url = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;
      
      try {
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
      } catch (innerError) {
        console.warn(`Alternative query "${alternativeQuery}" failed:`, innerError);
        // Continue with next alternative query
      }
    }
    
    // Fallback to a more generic approach if all alternatives fail
    const fallbackParams = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: `${query} image`,
      searchType: 'image',
      num: '20',
      safe: 'active',
    });
    
    const fallbackUrl = `https://www.googleapis.com/customsearch/v1?${fallbackParams.toString()}`;
    const fallbackResponse = await fetch(fallbackUrl);
    const fallbackData = await fallbackResponse.json();
    
    if (fallbackData.items && fallbackData.items.length > 0) {
      console.log(`Found ${fallbackData.items.length} results in fallback search`);
      
      return fallbackData.items.map((item: any, index: number) => {
        return {
          id: `google-fallback-${Date.now()}-${index}`,
          title: item.title,
          imageSrc: item.link,
          author: item.displayLink,
          authorUsername: item.displayLink.replace(/\./g, '_').replace(/^www\./, ''),
          tags: [query.split(' ')[0]],
          sourceUrl: item.image?.contextLink || '#'
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error("Error in all alternative searches:", error);
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
  
  // Educational and professional keywords to include if relevant
  const contextKeywords = [
    'diagram', 'concept', 'visual', 'model', 'theory', 'framework', 'map', 'chart', 'infographic',
    'flowchart', 'process', 'architecture', 'system', 'network', 'structure', 'relationship',
    'technical', 'educational', 'professional', 'business', 'presentation', 'documentation'
  ];
  
  const additionalTags = contextKeywords.filter(keyword => 
    title.includes(keyword) || snippet?.includes(keyword)
  );
  
  // Combine all potential tags and remove duplicates
  const allTags = [...tags, ...titleWords.slice(0, 3), ...snippetWords.slice(0, 2), ...additionalTags];
  const uniqueTags = Array.from(new Set(allTags));
  
  // Return limited number of tags
  return uniqueTags.slice(0, 8);
};
