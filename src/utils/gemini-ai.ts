
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
  description?: string;
  estimatedTime?: string;
  level?: "beginner" | "intermediate" | "advanced";
  keyTopics?: string;
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
export async function generateRelatedResources(searchQuery: string): Promise<ResourceItem[]> {
  try {
    // Use the provided API key from Google AI Studio
    const apiKey = "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
    
    // Don't make real API calls if the key isn't available or valid
    if (!apiKey || apiKey.length === 0) {
      console.log("Using fallback resources (no API key available)");
      return getFallbackResources(searchQuery);
    }
    
    const perfectPrompt = `I need to find the absolute best free educational resources about "${searchQuery}" for users who want to learn this topic.

Search the web and provide exactly 6 high-quality, completely free educational resources that:
1. Are 100% free to access (no paywalls or trials)
2. Come from reputable, trusted educational platforms
3. Contain visual elements, examples, or interactive components
4. Are highly rated by learners
5. Include a mix of 2 videos, 2 courses, and 2 articles

For each resource, provide ONLY the following data:
- title: Clear, concise title (maximum 10 words)
- description: Compelling 15-20 word summary highlighting unique value
- link: Direct URL to access the resource
- type: Either "video", "course", or "article"
- source: Name of the hosting platform (e.g., "Khan Academy", "freeCodeCamp")
- estimatedTime: Approximate completion time (e.g., "15 min video", "2 hour course")
- level: Learning level ("beginner", "intermediate", or "advanced")
- keyTopics: 3-4 main concepts covered, as a comma-separated string

Return ONLY a valid JSON array containing these 6 resources with no additional text or formatting.`;
    
    try {
      console.log("Sending request to Gemini API for resources on:", searchQuery);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: perfectPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024, // Increased token limit for longer responses
          }
        }),
      });
      
      if (!response.ok) {
        console.error(`API request failed with status: ${response.status}`);
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received response from Gemini API:", data);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        try {
          // Extract JSON array if wrapped in backticks
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                            text.match(/```\s*([\s\S]*?)\s*```/) ||
                            [null, text];
          
          const jsonContent = jsonMatch[1] || text;
          console.log("Parsed JSON content:", jsonContent);
          
          let resources = JSON.parse(jsonContent);
          
          if (Array.isArray(resources)) {
            // Ensure all resources have the correct type
            const validTypes = ["course", "video", "article", "resource"];
            
            const validatedResources = resources
              .filter(resource => resource.title && resource.url && resource.source)
              .map(resource => {
                // Normalize the type if needed
                let normalizedType = resource.type.toLowerCase();
                if (!validTypes.includes(normalizedType)) {
                  normalizedType = "resource";
                }
                
                return {
                  ...resource,
                  type: normalizedType
                };
              }) as ResourceItem[];
            
            console.log("Validated resources:", validatedResources);
            return validatedResources.slice(0, 6);
          }
        } catch (e) {
          console.error("Failed to parse resources JSON:", e);
          console.log("Raw text received:", text);
        }
      }
      
      return getFallbackResources(searchQuery);
      
    } catch (error) {
      console.error("Error calling Gemini API for resources:", error);
      return getFallbackResources(searchQuery);
    }
    
  } catch (e) {
    console.error("Error in generateRelatedResources:", e);
    return getFallbackResources(searchQuery);
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
      type: "course",
      description: "Practical strategies to improve learning skills and master any subject effectively.",
      estimatedTime: "15 hour course",
      level: "beginner",
      keyTopics: "memory techniques, focus, cognitive psychology, study strategies"
    },
    {
      title: "Research Methods: Finding Reliable Sources",
      url: "https://www.youtube.com/watch?v=FQQmDeBYANI",
      source: "YouTube EDU",
      type: "video",
      description: "Learn to identify credible information sources for academic research.",
      estimatedTime: "45 min video",
      level: "intermediate",
      keyTopics: "source evaluation, academic databases, citation, information literacy"
    },
    {
      title: "Visual Learning Strategies",
      url: "https://www.edx.org/learn/studying/studying-techniques",
      source: "edX",
      type: "article",
      description: "Evidence-based approaches to learning complex concepts through visualization.",
      estimatedTime: "20 min read",
      level: "beginner",
      keyTopics: "mind mapping, concept visualization, information retention, visual aids"
    },
    {
      title: "Complete Study Guide for Academic Success",
      url: "https://www.khanacademy.org/college-careers-more",
      source: "Khan Academy",
      type: "course",
      description: "Comprehensive strategies for effective studying across any discipline.",
      estimatedTime: "10 hour course",
      level: "beginner",
      keyTopics: "time management, note-taking, exam preparation, critical thinking"
    },
    {
      title: "Visual Explanation Techniques",
      url: "https://www.youtube.com/watch?v=xGgkJcWlYl8",
      source: "TED-Ed",
      type: "video",
      description: "How to craft clear visual explanations that enhance understanding of complex topics.",
      estimatedTime: "20 min video",
      level: "intermediate",
      keyTopics: "visual communication, diagram creation, knowledge transfer, simplification"
    },
    {
      title: "Digital Tools for Visual Learning",
      url: "https://www.canva.com/learn/visual-learning-tools/",
      source: "Canva",
      type: "article",
      description: "Modern digital tools to enhance understanding through visual representation.",
      estimatedTime: "15 min read",
      level: "beginner",
      keyTopics: "digital visualization, diagram software, concept mapping, educational technology"
    }
  ];
  
  // Specific categories with improved resources
  if (lowercaseQuery.includes("math") || lowercaseQuery.includes("calculus") || lowercaseQuery.includes("algebra")) {
    return [
      {
        title: "Essence of Calculus",
        url: "https://www.youtube.com/watch?v=WUvTyaaNkzM&list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr",
        source: "3Blue1Brown",
        type: "video",
        description: "Visual, intuitive approach to understanding calculus fundamentals.",
        estimatedTime: "4 hour video series",
        level: "intermediate",
        keyTopics: "derivatives, integrals, limits, visualization"
      },
      {
        title: "Khan Academy Calculus",
        url: "https://www.khanacademy.org/math/calculus-1",
        source: "Khan Academy",
        type: "course",
        description: "Comprehensive calculus course with practice problems and visual examples.",
        estimatedTime: "40 hour course",
        level: "beginner",
        keyTopics: "functions, derivatives, integrals, applications"
      },
      {
        title: "Mathematics for Machine Learning",
        url: "https://www.coursera.org/specializations/mathematics-machine-learning",
        source: "Coursera",
        type: "course",
        description: "Essential mathematical concepts needed for modern machine learning applications.",
        estimatedTime: "50 hour course",
        level: "intermediate",
        keyTopics: "linear algebra, multivariate calculus, probability"
      },
      {
        title: "Understanding Linear Algebra",
        url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
        source: "3Blue1Brown",
        type: "video",
        description: "Visually intuitive explanations of linear algebra concepts.",
        estimatedTime: "3 hour video series",
        level: "beginner",
        keyTopics: "vectors, matrices, transformations, eigenvectors"
      },
      {
        title: "Interactive Algebra Exercises",
        url: "https://www.mathsisfun.com/algebra/index.html",
        source: "Math Is Fun",
        type: "article",
        description: "Practical algebra tutorials with interactive examples and visualizations.",
        estimatedTime: "30 min read",
        level: "beginner",
        keyTopics: "equations, functions, graphing, problem-solving"
      },
      {
        title: "Calculus Made Easy",
        url: "https://www.feynmanlectures.caltech.edu/I_toc.html",
        source: "Caltech",
        type: "article",
        description: "Clear explanations of calculus principles with practical examples.",
        estimatedTime: "1 hour read",
        level: "intermediate",
        keyTopics: "differentiation, integration, applications, physics"
      }
    ];
  }
  
  if (lowercaseQuery.includes("science") || lowercaseQuery.includes("physics") || lowercaseQuery.includes("chemistry")) {
    return [
      {
        title: "MIT OpenCourseWare Physics",
        url: "https://ocw.mit.edu/courses/physics/",
        source: "MIT",
        type: "course",
        description: "University-level physics courses with lecture videos and problem sets.",
        estimatedTime: "40 hour course",
        level: "advanced",
        keyTopics: "mechanics, electromagnetism, quantum physics, thermodynamics"
      },
      {
        title: "Crash Course Chemistry",
        url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPHzzYuWy6fYEaX9mQQ8oGr",
        source: "YouTube",
        type: "video",
        description: "Engaging, visual introduction to fundamental chemistry concepts.",
        estimatedTime: "6 hour video series",
        level: "beginner",
        keyTopics: "atomic structure, reactions, bonds, periodic table"
      },
      {
        title: "Khan Academy Chemistry",
        url: "https://www.khanacademy.org/science/chemistry",
        source: "Khan Academy",
        type: "course",
        description: "Complete chemistry curriculum with animations and practice problems.",
        estimatedTime: "30 hour course",
        level: "intermediate",
        keyTopics: "stoichiometry, thermochemistry, organic chemistry, solutions"
      },
      {
        title: "The Feynman Lectures on Physics",
        url: "https://www.feynmanlectures.caltech.edu/",
        source: "Caltech",
        type: "article",
        description: "Renowned physicist's clear, insightful explanations of physics concepts.",
        estimatedTime: "2 hour read per chapter",
        level: "intermediate",
        keyTopics: "mechanics, electromagnetism, quantum mechanics, thermodynamics"
      },
      {
        title: "Science Visualization and Simulation",
        url: "https://phet.colorado.edu/",
        source: "PhET",
        type: "article",
        description: "Interactive science simulations that make abstract concepts visual and concrete.",
        estimatedTime: "30 min per simulation",
        level: "beginner",
        keyTopics: "interactive experiments, physics concepts, chemistry reactions, visualization"
      },
      {
        title: "Chemistry Lab Demonstrations",
        url: "https://www.youtube.com/user/NileRed",
        source: "NileRed",
        type: "video",
        description: "Visual demonstrations of fascinating chemical reactions and processes.",
        estimatedTime: "15-30 min videos",
        level: "intermediate",
        keyTopics: "chemical reactions, laboratory techniques, organic synthesis, demonstrations"
      }
    ];
  }
  
  if (lowercaseQuery.includes("computer") || lowercaseQuery.includes("programming") || lowercaseQuery.includes("code")) {
    return [
      {
        title: "CS50: Introduction to Computer Science",
        url: "https://www.edx.org/course/cs50s-introduction-to-computer-science",
        source: "Harvard via edX",
        type: "course",
        description: "Harvard's renowned introduction to computer science and programming.",
        estimatedTime: "100 hour course",
        level: "beginner",
        keyTopics: "algorithms, data structures, programming fundamentals, web development"
      },
      {
        title: "FreeCodeCamp Full Curriculum",
        url: "https://www.freecodecamp.org/learn",
        source: "freeCodeCamp",
        type: "course",
        description: "Comprehensive, project-based coding curriculum with certification.",
        estimatedTime: "300 hour course",
        level: "beginner",
        keyTopics: "web development, JavaScript, responsive design, algorithms"
      },
      {
        title: "Programming Paradigms Visualized",
        url: "https://www.youtube.com/watch?v=cgVVZMfLjEI",
        source: "MIT OpenCourseWare",
        type: "video",
        description: "Clear explanations of different programming approaches and their applications.",
        estimatedTime: "45 min video",
        level: "intermediate",
        keyTopics: "object-oriented, functional, procedural, paradigm comparison"
      },
      {
        title: "Understanding Algorithms with Visualization",
        url: "https://visualgo.net/",
        source: "VisuAlgo",
        type: "article",
        description: "Interactive visualizations of data structures and algorithms.",
        estimatedTime: "1 hour per topic",
        level: "intermediate",
        keyTopics: "sorting algorithms, data structures, graph algorithms, complexity"
      },
      {
        title: "The Missing Semester of CS Education",
        url: "https://missing.csail.mit.edu/",
        source: "MIT CSAIL",
        type: "video",
        description: "Essential developer tools and practices often missed in CS education.",
        estimatedTime: "10 hour course",
        level: "intermediate",
        keyTopics: "command line, version control, debugging, security"
      },
      {
        title: "Web Development Roadmap",
        url: "https://roadmap.sh/frontend",
        source: "roadmap.sh",
        type: "article",
        description: "Visual guide to becoming a modern web developer with learning resources.",
        estimatedTime: "30 min read",
        level: "beginner",
        keyTopics: "HTML/CSS, JavaScript, frameworks, career progression"
      }
    ];
  }
  
  // Return general resources if no specific category matches
  return generalResources;
}
