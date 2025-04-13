// Gemini AI integration

export interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GeminiResponse {
  suggestions?: string[];
  error?: string;
}

export interface ResourceItem {
  title: string;
  url: string;
  source: string;
  type: "course" | "video" | "article" | "resource";
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
 * Generates educational resources related to the search query
 */
export async function generateRelatedResources(query: string): Promise<ResourceItem[]> {
  try {
    // Use the provided API key from Google AI Studio
    const apiKey = "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
    
    // Don't make real API calls if the key isn't available or valid
    if (!apiKey || apiKey.length === 0) {
      console.log("Using fallback resources (no API key available)");
      return getFallbackResources(query);
    }
    
    const messages: GeminiMessage[] = [
      {
        role: "user",
        content: `Find 4 educational resources about "${query}" that would help someone learn more about this topic. Include online courses, videos, articles, and other helpful resources. Return ONLY a JSON array of objects with these exact fields: "title", "url", "source", "type" (must be one of: "course", "video", "article", "resource"). Make sure all URLs are valid and resources are from reputable educational sources.`
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
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 350,
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
            // Ensure all resources have the correct type
            const validTypes = ["course", "video", "article", "resource"];
            
            const validatedResources = resources
              .filter(resource => resource.title && resource.url && resource.source)
              .map(resource => ({
                ...resource,
                type: validTypes.includes(resource.type) ? resource.type : "resource"
              })) as ResourceItem[];
            
            return validatedResources.slice(0, 4);
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
 * Provides fallback educational resources when the API call fails
 */
function getFallbackResources(query: string): ResourceItem[] {
  const lowercaseQuery = query.toLowerCase();
  
  // General resources that can apply to most topics
  const generalResources: ResourceItem[] = [
    {
      title: "Introduction to Learning Techniques",
      url: "https://www.coursera.org/learn/learning-how-to-learn",
      source: "Coursera",
      type: "course"
    },
    {
      title: "Research Methods: Finding Reliable Sources",
      url: "https://www.youtube.com/watch?v=FQQmDeBYANI",
      source: "YouTube EDU",
      type: "video"
    },
    {
      title: "How to Study Effectively: Evidence-Based Strategies",
      url: "https://www.edx.org/learn/studying/studying-techniques",
      source: "edX",
      type: "article"
    },
    {
      title: "The Complete Study Guide",
      url: "https://www.khanacademy.org/college-careers-more",
      source: "Khan Academy",
      type: "resource"
    }
  ];
  
  // Specific categories - uncomment and modify as needed
  if (lowercaseQuery.includes("math") || lowercaseQuery.includes("calculus") || lowercaseQuery.includes("algebra")) {
    return [
      {
        title: "Introduction to Mathematics",
        url: "https://www.khanacademy.org/math",
        source: "Khan Academy",
        type: "course"
      },
      {
        title: "Essence of Calculus",
        url: "https://www.youtube.com/watch?v=WUvTyaaNkzM&list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr",
        source: "3Blue1Brown",
        type: "video"
      },
      {
        title: "Linear Algebra for Machine Learning",
        url: "https://www.coursera.org/specializations/mathematics-machine-learning",
        source: "Coursera",
        type: "course"
      },
      {
        title: "Interactive Algebra Practice",
        url: "https://www.desmos.com/calculator",
        source: "Desmos",
        type: "resource"
      }
    ];
  }
  
  if (lowercaseQuery.includes("science") || lowercaseQuery.includes("physics") || lowercaseQuery.includes("chemistry")) {
    return [
      {
        title: "Introduction to Physics",
        url: "https://www.edx.org/learn/physics/introduction",
        source: "edX",
        type: "course"
      },
      {
        title: "Chemistry Fundamentals",
        url: "https://www.youtube.com/c/TheOrganicChemistryTutor",
        source: "The Organic Chemistry Tutor",
        type: "video"
      },
      {
        title: "Physics Problems Solved",
        url: "https://www.physicsclassroom.com/",
        source: "The Physics Classroom",
        type: "resource"
      },
      {
        title: "Chemistry Lab Safety",
        url: "https://chem.libretexts.org/",
        source: "LibreTexts",
        type: "article"
      }
    ];
  }
  
  if (lowercaseQuery.includes("computer") || lowercaseQuery.includes("programming") || lowercaseQuery.includes("code")) {
    return [
      {
        title: "Introduction to Computer Science",
        url: "https://www.edx.org/course/cs50s-introduction-to-computer-science",
        source: "Harvard CS50",
        type: "course"
      },
      {
        title: "Learn to Code for Beginners",
        url: "https://www.freecodecamp.org/learn",
        source: "freeCodeCamp",
        type: "resource"
      },
      {
        title: "Python for Everybody",
        url: "https://www.py4e.com/",
        source: "Dr. Charles Severance",
        type: "course"
      },
      {
        title: "How to Think Like a Computer Scientist",
        url: "https://www.youtube.com/watch?v=5HMq_A0E5jk",
        source: "MIT OpenCourseWare",
        type: "video"
      }
    ];
  }
  
  if (lowercaseQuery.includes("history") || lowercaseQuery.includes("geography") || lowercaseQuery.includes("culture")) {
    return [
      {
        title: "World History",
        url: "https://www.khanacademy.org/humanities/world-history",
        source: "Khan Academy",
        type: "course"
      },
      {
        title: "Geography Now",
        url: "https://www.youtube.com/c/GeographyNow",
        source: "YouTube",
        type: "video"
      },
      {
        title: "Cultural Anthropology",
        url: "https://www.coursera.org/learn/cultural-anthropology",
        source: "Coursera",
        type: "course"
      },
      {
        title: "Interactive Historical Maps",
        url: "https://www.worldhistory.org/",
        source: "World History Encyclopedia",
        type: "resource"
      }
    ];
  }
  
  // Return general resources if no specific category matches
  return generalResources;
}
