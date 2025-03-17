
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
  searchEngineId: string = ""
): Promise<SearchResult[]> => {
  try {
    // Create an enhanced query that focuses on educational diagrams and the exact search term
    // Adding specificity to get more relevant results
    const coreTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
    
    // Domain-specific modifiers to improve relevance
    const domainSpecificTerms = [
      "diagram", "educational", "visualization", "infographic",
      "high quality", "high resolution", "concept map", "visual explanation"
    ];
    
    // Add domain-specific terms only if they aren't already in the query
    const enhancementTerms = domainSpecificTerms.filter(term => 
      !coreTerms.some(coreTerm => term.includes(coreTerm))
    );
    
    // Construct final query with exact phrase matching and enhancements
    const enhancedQuery = `"${query}" ${enhancementTerms.join(' ')}`;
    
    // Add more specific search parameters for better results
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(enhancedQuery)}&searchType=image&num=10&imgSize=xlarge&imgType=photo&safe=active&highRange=1&imgColorType=color&rights=cc_publicdomain,cc_attribute,cc_sharealike&fileType=jpg,png`;
    
    console.log("Fetching high-quality educational diagrams for:", query);
    console.log("Enhanced search query:", enhancedQuery);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
      console.log(`Found ${data.items.length} educational diagram results`);
      
      // More advanced filtering and relevance scoring
      return data.items
        .map((item: any, index: number) => {
          // Calculate relevance score for this result
          const relevanceScore = calculateRelevanceScore(item, query);
          
          // Generate more specific and meaningful tags
          const tags = generateTags(item, query);
          
          return {
            id: `google-${Date.now()}-${index}`,
            title: item.title,
            imageSrc: item.link,
            author: item.displayLink,
            authorUsername: item.displayLink.replace(/\./g, '_').replace(/^www\./, ''),
            tags: tags,
            sourceUrl: item.image.contextLink,
            relevanceScore: relevanceScore // Add relevance score to sort by later
          };
        })
        .filter((item: any) => item.relevanceScore > 0.3) // Filter out low relevance results
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore) // Sort by relevance
        .map(({ relevanceScore, ...item }: any) => item); // Remove the relevance score field
    }
    
    return [];
  } catch (error) {
    console.error("Error searching Google Images:", error);
    return [];
  }
};

// Helper function to calculate relevance score (0-1) for search results
const calculateRelevanceScore = (item: any, query: string): number => {
  let score = 0;
  const maxScore = 10;
  const queryTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
  const title = item.title?.toLowerCase() || '';
  const snippet = item.snippet?.toLowerCase() || '';
  const displayLink = item.displayLink?.toLowerCase() || '';
  
  // Check for exact phrase match (highest relevance)
  if (title.includes(query.toLowerCase())) {
    score += 3;
  }
  
  // Check for all terms appearing in title
  const allTermsInTitle = queryTerms.every(term => title.includes(term));
  if (allTermsInTitle) {
    score += 2;
  }
  
  // Check individual terms in title
  queryTerms.forEach(term => {
    if (title.includes(term)) {
      score += 0.5;
    }
  });
  
  // Educational content indicators
  const educationalTerms = ['diagram', 'concept', 'study', 'learn', 'education', 'model', 'theory', 'framework'];
  educationalTerms.forEach(term => {
    if (title.includes(term) || snippet.includes(term)) {
      score += 0.3;
    }
  });
  
  // Check for scholarly or educational domains
  const educationalDomains = ['.edu', 'school', 'university', 'college', 'academy', 'institute'];
  if (educationalDomains.some(domain => displayLink.includes(domain))) {
    score += 1;
  }
  
  // Image quality indicators in URL or snippet
  const qualityIndicators = ['high-resolution', 'hd', 'high-quality', 'detailed'];
  qualityIndicators.forEach(indicator => {
    if (item.link?.toLowerCase().includes(indicator) || 
        snippet.includes(indicator) || 
        title.includes(indicator)) {
      score += 0.5;
    }
  });
  
  // Normalize score to 0-1 range
  return Math.min(score / maxScore, 1);
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
  const snippetWords = snippet.split(' ')
    .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(word => word.length > 3 && !queryTerms.includes(word) && !titleWords.includes(word));
  
  // Educational keywords to include if relevant
  const educationalKeywords = ['diagram', 'concept', 'visual', 'model', 'theory', 'framework', 'map'];
  const additionalTags = educationalKeywords.filter(keyword => 
    title.includes(keyword) || snippet.includes(keyword)
  );
  
  // Combine all potential tags and remove duplicates
  const allTags = [...tags, ...titleWords.slice(0, 3), ...snippetWords.slice(0, 2), ...additionalTags];
  const uniqueTags = Array.from(new Set(allTags));
  
  // Return limited number of tags
  return uniqueTags.slice(0, 8);
};
