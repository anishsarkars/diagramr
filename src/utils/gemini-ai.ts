
// Gemini AI integration

export interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GeminiResponse {
  suggestions?: string[];
  error?: string;
}

export interface ResourceResponse {
  resources?: ResourceItem[];
  error?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "course" | "video" | "article" | "resource";
  source?: string;
  imageUrl?: string;
}

/**
 * Generates suggestions using Google's Gemini API
 */
export async function generateSuggestions(query: string): Promise<GeminiResponse> {
  try {
    // Use the provided API key from Google AI Studio
    const apiKey = "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
    
    // Additional API key provided
    const altApiKey = "1662e165fa7f4ef390dc17769cf96792";
    
    // Don't make real API calls if the key isn't available or valid
    if ((!apiKey || apiKey.length === 0) && !altApiKey) {
      console.log("Using fallback suggestions (no API key available)");
      return getFallbackSuggestions(query);
    }
    
    const selectedKey = apiKey || altApiKey;
    
    const messages: GeminiMessage[] = [
      {
        role: "user",
        content: `I'm looking for diagrams about "${query}". Suggest 5 specific searches that would find good diagrams related to this topic. Each suggestion should be a specific diagram type or use case. Answer with ONLY a JSON array of strings, nothing else. Make suggestions diverse and helpful.`
      }
    ];
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${selectedKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 250,
          }
        }),
      });
      
      if (!response.ok) {
        console.error(`API request failed with status: ${response.status}`);
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        try {
          // Extract JSON array if wrapped in backticks
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                           text.match(/```\s*([\s\S]*?)\s*```/) ||
                           [null, text];
          
          const jsonContent = jsonMatch[1] || text;
          const suggestions = JSON.parse(jsonContent);
          
          if (Array.isArray(suggestions)) {
            return { suggestions: suggestions.slice(0, 5) };
          }
        } catch (e) {
          console.error("Failed to parse suggestions JSON:", e);
        }
      }
      
      return getFallbackSuggestions(query);
      
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return getFallbackSuggestions(query);
    }
    
  } catch (e) {
    console.error("Error in generateSuggestions:", e);
    return getFallbackSuggestions(query);
  }
}

/**
 * Generates related resources recommendations using Gemini API
 */
export async function generateRelatedResources(query: string): Promise<ResourceResponse> {
  try {
    // Use the provided API key from Google AI Studio
    const apiKey = "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
    
    if (!apiKey || apiKey.length === 0) {
      console.log("Using fallback resources (no API key available)");
      return getFallbackResources(query);
    }
    
    const messages: GeminiMessage[] = [
      {
        role: "user",
        content: `Find educational resources about "${query}". Return 4 specific, diverse recommendations including courses, videos, articles, or other resources. Return ONLY a JSON array with this format:
[
  {
    "id": "unique-id",
    "title": "Resource title",
    "description": "Brief description of the resource",
    "url": "https://example.com/resource",
    "type": "course/video/article/resource",
    "source": "Platform or provider name"
  }
]
Be diverse in your recommendations, precise in descriptions, and ensure links are plausible.`
      }
    ];
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 800,
          }
        }),
      });
      
      if (!response.ok) {
        console.error(`API request failed with status: ${response.status}`);
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        try {
          // Extract JSON array if wrapped in backticks
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                           text.match(/```\s*([\s\S]*?)\s*```/) ||
                           [null, text];
          
          const jsonContent = jsonMatch[1] || text;
          const resources = JSON.parse(jsonContent);
          
          if (Array.isArray(resources)) {
            // Add placeholder image URLs if not provided
            const processedResources = resources.map((resource, index) => ({
              ...resource,
              imageUrl: resource.imageUrl || getPlaceholderImage(resource.type, index)
            }));
            
            return { resources: processedResources.slice(0, 4) };
          }
        } catch (e) {
          console.error("Failed to parse resources JSON:", e);
        }
      }
      
      return getFallbackResources(query);
      
    } catch (error) {
      console.error("Error calling Gemini API for resources:", error);
      return getFallbackResources(query);
    }
    
  } catch (e) {
    console.error("Error in generateRelatedResources:", e);
    return getFallbackResources(query);
  }
}

/**
 * Provides fallback suggestions when the API call fails
 */
function getFallbackSuggestions(query: string): GeminiResponse {
  const baseTypes = [
    "flowchart", 
    "UML diagram", 
    "entity relationship diagram",
    "sequence diagram", 
    "mind map", 
    "process flow",
    "state diagram",
    "network topology",
    "class diagram",
    "data flow diagram",
    "architecture diagram",
    "component diagram"
  ];
  
  // Always give at least one exact match with the query
  const suggestions = [
    `${query} ${baseTypes[0]}`,
    `${query} ${baseTypes[1]}`,
    `${baseTypes[2]} for ${query}`,
    `${baseTypes[3]} of ${query} process`,
    `${baseTypes[Math.floor(Math.random() * baseTypes.length)]} for ${query}`
  ];
  
  return { suggestions };
}

/**
 * Provides fallback resources when the API call fails
 */
function getFallbackResources(query: string): ResourceResponse {
  const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();
  
  const resources = [
    {
      id: "resource-1",
      title: `${capitalizedQuery} Fundamentals Course`,
      description: `Comprehensive course covering all the essential concepts of ${query.toLowerCase()}.`,
      url: "https://example.com/course",
      type: "course",
      source: "Example Learning",
      imageUrl: getPlaceholderImage("course", 0)
    },
    {
      id: "resource-2",
      title: `Understanding ${capitalizedQuery} - Video Tutorial`,
      description: `A visual explanation of ${query.toLowerCase()} with practical examples.`,
      url: "https://example.com/video",
      type: "video",
      source: "Example Academy",
      imageUrl: getPlaceholderImage("video", 1)
    },
    {
      id: "resource-3",
      title: `The Complete Guide to ${capitalizedQuery}`,
      description: `In-depth article explaining the core principles of ${query.toLowerCase()}.`,
      url: "https://example.com/article",
      type: "article",
      source: "Example Blog",
      imageUrl: getPlaceholderImage("article", 2)
    },
    {
      id: "resource-4",
      title: `${capitalizedQuery} Resources Collection`,
      description: `A curated list of resources for learning about ${query.toLowerCase()}.`,
      url: "https://example.com/resources",
      type: "resource",
      source: "Example Hub",
      imageUrl: getPlaceholderImage("resource", 3)
    }
  ];
  
  return { resources };
}

/**
 * Generates placeholder image URLs based on resource type
 */
function getPlaceholderImage(type: string, index: number): string {
  const imageSets = {
    course: [
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=300&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&q=80"
    ],
    video: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80",
      "https://images.unsplash.com/photo-1574717024453-354056afd6fc?w=300&q=80"
    ],
    article: [
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=300&q=80",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&q=80"
    ],
    resource: [
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&q=80",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&q=80"
    ]
  };
  
  // Get appropriate image set or default to the first type
  const imageArray = imageSets[type as keyof typeof imageSets] || imageSets.resource;
  
  // Select an image from the array
  return imageArray[index % imageArray.length];
}
