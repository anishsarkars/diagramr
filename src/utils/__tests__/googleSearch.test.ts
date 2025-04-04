import { searchGoogleImages, getApiKeyStatus, resetAllApiKeys } from '../googleSearch';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Google Search API with key rotation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset API keys before each test
    resetAllApiKeys();
    
    // Default mock implementation for successful response
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        items: [
          {
            title: 'Test Image 1',
            link: 'https://example.com/image1.jpg',
            image: { contextLink: 'https://example.com/page1' },
            displayLink: 'example.com'
          },
          {
            title: 'Test Image 2',
            link: 'https://example.com/image2.jpg',
            image: { contextLink: 'https://example.com/page2' },
            displayLink: 'example.com'
          }
        ]
      })
    });
  });

  it('should return search results when API call is successful', async () => {
    const results = await searchGoogleImages('test query');
    
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Test Image 1');
    expect(results[1].title).toBe('Test Image 2');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
  
  it('should have 5 total API keys configured', async () => {
    const keyStatus = getApiKeyStatus();
    expect(keyStatus.totalKeys).toBe(5);
    expect(keyStatus.availableKeys).toBe(5);
  });
  
  it('should rotate to next API key when quota is exceeded', async () => {
    // First API call fails with quota exceeded
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        error: {
          code: 403,
          message: 'Daily Limit Exceeded. The quota will be reset at midnight Pacific Time.'
        }
      })
    });
    
    // Second API call succeeds
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        items: [
          {
            title: 'Test Image 1',
            link: 'https://example.com/image1.jpg',
            image: { contextLink: 'https://example.com/page1' },
            displayLink: 'example.com'
          }
        ]
      })
    });
    
    const results = await searchGoogleImages('test query');
    
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Image 1');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // Check API key status
    const keyStatus = getApiKeyStatus();
    expect(keyStatus.availableKeys).toBeLessThan(keyStatus.totalKeys);
    expect(keyStatus.unavailableKeys).toBeGreaterThan(0);
  });
  
  it('should try all API keys before giving up', async () => {
    // Mock all API calls to fail with quota exceeded
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        error: {
          code: 403,
          message: 'Daily Limit Exceeded. The quota will be reset at midnight Pacific Time.'
        }
      })
    });
    
    // This should throw an error after trying all keys
    await expect(searchGoogleImages('test query')).rejects.toThrow('API quota exceeded');
    
    // Get total number of API keys from status
    const keyStatus = getApiKeyStatus();
    
    // Should have tried all keys
    expect(global.fetch).toHaveBeenCalledTimes(keyStatus.totalKeys);
    
    // All keys should be marked as unavailable
    expect(keyStatus.availableKeys).toBe(0);
    expect(keyStatus.unavailableKeys).toBe(keyStatus.totalKeys);
  });
  
  it('should reset failed API keys after cooldown', async () => {
    // Override Date.now for testing time-based functions
    const originalDateNow = Date.now;
    const mockNow = jest.fn();
    
    // Set initial time
    const initialTime = 1625097600000; // Some fixed timestamp
    mockNow.mockReturnValue(initialTime);
    global.Date.now = mockNow;
    
    // Mark some API keys as failed
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        error: {
          code: 403,
          message: 'Daily Limit Exceeded'
        }
      })
    });
    
    try {
      await searchGoogleImages('test query');
    } catch (error) {
      // Expected error
    }
    
    // Check that keys are marked unavailable
    let keyStatus = getApiKeyStatus();
    expect(keyStatus.unavailableKeys).toBeGreaterThan(0);
    
    // Move time forward past cooldown
    mockNow.mockReturnValue(initialTime + 26 * 60 * 60 * 1000); // 26 hours later
    
    // After reset, keys should be available again
    keyStatus = getApiKeyStatus();
    expect(keyStatus.availableKeys).toBe(keyStatus.totalKeys);
    
    // Restore original Date.now
    global.Date.now = originalDateNow;
  });
}); 