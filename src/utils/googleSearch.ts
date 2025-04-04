// Update the search function to accept API key and search engine ID and fix API rotation

// Track API key status and usage
interface ApiKeyStatus {
  key: string;
  failedAt?: number;
  usageCount: number;
  lastUsed: number;
  isAvailable: boolean;
}

// Initialize API key tracking
const API_KEYS: ApiKeyStatus[] = [
  { key: 'AIzaSyDFQXT4QDQ12M1dCUldEgDbL_RBB6WjURM', usageCount: 0, lastUsed: 0, isAvailable: true },
  { key: 'AIzaSyA1zArEu4m9HzEh-CO2Y7oFw0z_E_cFPsg', usageCount: 0, lastUsed: 0, isAvailable: true },
  { key: 'AIzaSyDJBtnO8ZGzlDVfOTsL6BmCOn-yhGfPqgc', usageCount: 0, lastUsed: 0, isAvailable: true },
  { key: 'AIzaSyBLb8xMhQIVk5G344igPWC3xEIPKjsbSn8', usageCount: 0, lastUsed: 0, isAvailable: true },
  { key: 'AIzaSyAqJ_EGxg7UXId1IZBfBXxOmdongWW53jk', usageCount: 0, lastUsed: 0, isAvailable: true },
];

// Reset failed API keys after a cooldown period (24 hours)
const RESET_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Check if any API keys need to be reset
function resetFailedApiKeys() {
  const now = Date.now();
  let resetCount = 0;
  
  API_KEYS.forEach(apiKey => {
    if (!apiKey.isAvailable && apiKey.failedAt && (now - apiKey.failedAt > RESET_COOLDOWN)) {
      apiKey.isAvailable = true;
      apiKey.failedAt = undefined;
      resetCount++;
    }
  });
  
  if (resetCount > 0) {
    console.log(`Reset ${resetCount} API keys that were previously marked as failed`);
  }
}

// Select the best available API key using a weighted strategy
function selectApiKey(): ApiKeyStatus | null {
  resetFailedApiKeys();
  
  // Filter available keys
  const availableKeys = API_KEYS.filter(key => key.isAvailable);
  
  if (availableKeys.length === 0) {
    console.warn('No available API keys! Resetting all keys to try again.');
    // Last resort: reset all keys and try again
    API_KEYS.forEach(key => {
      key.isAvailable = true;
      key.failedAt = undefined;
    });
    return API_KEYS[0]; // Return first key after reset
  }
  
  // Sort by least recently used (to distribute load)
  availableKeys.sort((a, b) => a.lastUsed - b.lastUsed);
  
  // Return the least recently used available key
  return availableKeys[0];
}

// Mark an API key as failed
function markApiKeyAsFailed(apiKey: string) {
  const keyStatus = API_KEYS.find(k => k.key === apiKey);
  if (keyStatus) {
    keyStatus.isAvailable = false;
    keyStatus.failedAt = Date.now();
    console.warn(`API key ${apiKey.substring(0, 8)}... marked as unavailable until ${new Date(Date.now() + RESET_COOLDOWN).toISOString()}`);
  }
}

// Update API key usage metrics
function updateApiKeyUsage(apiKey: string) {
  const keyStatus = API_KEYS.find(k => k.key === apiKey);
  if (keyStatus) {
    keyStatus.usageCount++;
    keyStatus.lastUsed = Date.now();
  }
}

export async function searchGoogleImages(
  query: string,
  apiKey?: string,
  searchEngineId?: string,
  startPage: number = 1,
  retryCount: number = 0
): Promise<any[]> {
  const MAX_RETRIES = 3;
  const DEFAULT_SEARCH_ENGINE_ID = '260090575ae504419';
  
  // Use provided API key or select the best available one
  let activeKeyStatus: ApiKeyStatus | null = null;
  
  if (apiKey) {
    // If specific API key requested, find its status
    activeKeyStatus = API_KEYS.find(k => k.key === apiKey && k.isAvailable) || null;
  }
  
  // If no specific key or requested key is unavailable, select best key
  if (!activeKeyStatus) {
    activeKeyStatus = selectApiKey();
    
    // If still no key available
    if (!activeKeyStatus) {
      throw new Error('All API keys have reached quota limits. Please try again later.');
    }
  }
  
  const activeApiKey = activeKeyStatus.key;
  const activeSearchEngineId = searchEngineId || DEFAULT_SEARCH_ENGINE_ID;
  
  const start = (startPage - 1) * 10 + 1;
  
  try {
    console.log(`Making Google CSE API request with key ${activeApiKey.substring(0, 8)}... for query: "${query}" (Retry: ${retryCount}/${MAX_RETRIES})`);
    
    // Update usage metrics
    updateApiKeyUsage(activeApiKey);
    
    // Construct search URL
    const url = `https://www.googleapis.com/customsearch/v1?key=${activeApiKey}&cx=${activeSearchEngineId}&q=${encodeURIComponent(query)}&searchType=image&start=${start}&num=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("Google API Error:", data.error.message);
      
      if (data.error.code === 403 && data.error.message.includes('quota')) {
        // Mark current key as failed
        markApiKeyAsFailed(activeApiKey);
        
        // Retry with a different API key if not exceeding max retries
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying search with a different API key (${retryCount + 1}/${MAX_RETRIES})...`);
          return searchGoogleImages(query, undefined, searchEngineId, startPage, retryCount + 1);
        } else {
          throw new Error('API quota exceeded for all available keys');
        }
      }
      
      throw new Error(data.error.message);
    }
    
    if (!data.items || data.items.length === 0) {
      console.log("No results found for query:", query);
      return [];
    }
    
    // Transform the results to match our DiagramResult interface
    return data.items.map((item: any, index: number) => ({
      id: `google-${startPage}-${index}-${Date.now()}`,
      title: item.title || 'Untitled Image',
      imageSrc: item.link,
      sourceUrl: item.image?.contextLink || item.link,
      author: item.displayLink || '',
      relevanceScore: 1 - (index * 0.05), // Simple relevance scoring based on position
      isGenerated: false,
      tags: [query, item.displayLink?.split('.')[0] || ''].filter(Boolean)
    }));
    
  } catch (error) {
    console.error("Error in Google Image Search:", error);
    
    // Handle rate limiting or other API errors
    if (error.message && (error.message.includes('quota') || error.message.includes('rate limit'))) {
      // Mark current key as failed
      markApiKeyAsFailed(activeApiKey);
      
      // Retry with a different API key if not exceeding max retries
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying search with a different API key (${retryCount + 1}/${MAX_RETRIES})...`);
        return searchGoogleImages(query, undefined, searchEngineId, startPage, retryCount + 1);
      }
    }
    
    throw error;
  }
}

// Export a function to get API key health status (useful for monitoring)
export function getApiKeyStatus() {
  // Reset any keys that should be available again
  resetFailedApiKeys();
  
  // Count available keys
  const availableKeys = API_KEYS.filter(key => key.isAvailable);
  
  // Calculate usage statistics
  const totalUsage = API_KEYS.reduce((sum, key) => sum + key.usageCount, 0);
  const avgUsagePerKey = totalUsage / API_KEYS.length;
  
  // Get the least and most used keys
  const sortedByUsage = [...API_KEYS].sort((a, b) => a.usageCount - b.usageCount);
  const leastUsedKey = sortedByUsage[0];
  const mostUsedKey = sortedByUsage[sortedByUsage.length - 1];
  
  // Calculate load distribution
  const usageStdDev = Math.sqrt(
    API_KEYS.reduce((sum, key) => {
      const diff = key.usageCount - avgUsagePerKey;
      return sum + (diff * diff);
    }, 0) / API_KEYS.length
  );
  
  // Calculate time since last key failure
  const lastFailedKey = API_KEYS
    .filter(key => key.failedAt)
    .sort((a, b) => (b.failedAt || 0) - (a.failedAt || 0))[0];
    
  const timeSinceLastFailure = lastFailedKey 
    ? Date.now() - (lastFailedKey.failedAt || 0) 
    : null;
  
  return {
    totalKeys: API_KEYS.length,
    availableKeys: availableKeys.length,
    unavailableKeys: API_KEYS.length - availableKeys.length,
    healthStatus: getHealthStatus(availableKeys.length),
    totalUsage,
    avgUsagePerKey,
    loadBalance: usageStdDev / avgUsagePerKey, // Lower is better (more balanced)
    timeSinceLastFailure,
    lastFailedKeyPrefix: lastFailedKey ? lastFailedKey.key.substring(0, 8) : null,
    nextKeyToUsePrefix: availableKeys.length > 0 ? selectApiKey()?.key.substring(0, 8) : null,
  };
}

// Helper to classify the health status
function getHealthStatus(availableKeyCount: number): 'critical' | 'warning' | 'healthy' {
  const totalKeys = API_KEYS.length;
  const availablePercentage = (availableKeyCount / totalKeys) * 100;
  
  if (availablePercentage <= 25) return 'critical';
  if (availablePercentage <= 50) return 'warning';
  return 'healthy';
}

// Reset all API keys (for admin use)
export function resetAllApiKeys() {
  API_KEYS.forEach(key => {
    key.isAvailable = true;
    key.failedAt = undefined;
  });
  
  console.log('All API keys have been manually reset and are now available');
  return getApiKeyStatus();
}
