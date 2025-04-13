
import { ResourceItem } from "@/components/recommendation-section";

const API_KEY = "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function generateRelatedResources(query: string): Promise<ResourceItem[]> {
  try {
    console.log("Generating related resources for:", query);
    
    const prompt = `
I need to find the absolute best free educational resources about "${query}" for users who want to learn this topic.

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

Return ONLY a valid JSON array containing these 6 resources with no additional text or formatting.
`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096
        }
      })
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let text = "";
    
    if (data?.candidates?.[0]?.content?.parts?.length > 0) {
      text = data.candidates[0].content.parts[0].text;
    }
    
    // Extract JSON from the response
    let jsonString = text;
    
    // Handle case where AI surrounds JSON with markdown code block
    if (text.includes("```json")) {
      jsonString = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      jsonString = text.split("```")[1].split("```")[0].trim();
    }
    
    try {
      const resources = JSON.parse(jsonString);
      
      // Validate and ensure proper types
      if (Array.isArray(resources)) {
        console.log("Successfully parsed resources:", resources.length);
        
        const validatedResources = resources.map(resource => ({
          title: resource.title || "Learning Resource",
          url: resource.link || resource.url || "",
          source: resource.source || "Educational Platform",
          type: validateResourceType(resource.type),
          description: resource.description || "",
          estimatedTime: resource.estimatedTime || "",
          level: validateResourceLevel(resource.level),
          keyTopics: resource.keyTopics || ""
        }));
        
        return validatedResources;
      }
      
      throw new Error("Invalid resource format");
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.log("Raw response:", text);
      throw new Error("Failed to parse resources");
    }
  } catch (error) {
    console.error("Error in generateRelatedResources:", error);
    
    // Fallback to hardcoded resources based on the query
    return getFallbackRelatedResources(query);
  }
}

// Added new function for search suggestions
export async function generateSuggestions(query: string): Promise<{ suggestions: string[] }> {
  try {
    console.log("Generating search suggestions for:", query);
    
    const prompt = `
Generate 4-6 search suggestions related to "${query}" that would help a user find educational diagrams and visualizations about this topic.

The suggestions should:
1. Be clear and concise, focused on educational content
2. Include specific diagram types where appropriate (flowcharts, mind maps, etc.)
3. Cover different aspects or subtopics of the main query
4. Be formatted as simple strings

Return ONLY a valid JSON object with a single "suggestions" property containing an array of suggestion strings.
Example: { "suggestions": ["query suggestion 1", "query suggestion 2", "query suggestion 3"] }
    `;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 20,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let text = "";
    
    if (data?.candidates?.[0]?.content?.parts?.length > 0) {
      text = data.candidates[0].content.parts[0].text;
    }
    
    // Extract JSON from the response
    let jsonString = text;
    
    // Handle case where AI surrounds JSON with markdown code block
    if (text.includes("```json")) {
      jsonString = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      jsonString = text.split("```")[1].split("```")[0].trim();
    }
    
    try {
      const result = JSON.parse(jsonString);
      
      if (result && Array.isArray(result.suggestions)) {
        return {
          suggestions: result.suggestions.slice(0, 6)
        };
      }
      
      throw new Error("Invalid suggestions format");
    } catch (parseError) {
      console.error("Failed to parse Gemini suggestions response:", parseError);
      return { suggestions: getFallbackSuggestions(query) };
    }
  } catch (error) {
    console.error("Error in generateSuggestions:", error);
    return { suggestions: getFallbackSuggestions(query) };
  }
}

function getFallbackSuggestions(query: string): string[] {
  // Basic fallback suggestions based on the query
  return [
    `${query} diagram`, 
    `${query} flowchart`,
    `${query} visualization`,
    `${query} concept map`,
    `${query} process diagram`
  ].filter(s => s !== query);
}

function validateResourceType(type: string): "course" | "video" | "article" | "resource" {
  if (!type) return "resource";
  
  const normalizedType = type.toLowerCase();
  if (
    normalizedType === "course" || 
    normalizedType === "video" || 
    normalizedType === "article"
  ) {
    return normalizedType as "course" | "video" | "article";
  }
  return "resource";
}

function validateResourceLevel(level: string): "beginner" | "intermediate" | "advanced" | undefined {
  if (!level) return undefined;
  
  const normalizedLevel = level.toLowerCase();
  if (
    normalizedLevel === "beginner" || 
    normalizedLevel === "intermediate" || 
    normalizedLevel === "advanced"
  ) {
    return normalizedLevel as "beginner" | "intermediate" | "advanced";
  }
  return undefined;
}

// Fallback function with static resources when API fails
function getFallbackRelatedResources(query: string): ResourceItem[] {
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
  
  // Specific categories with improved resources - Fixed to return Promises
  if (lowercaseQuery.includes("math") || lowercaseQuery.includes("calculus") || lowercaseQuery.includes("algebra")) {
    return [
      {
        title: "Essence of Calculus",
        url: "https://www.youtube.com/watch?v=WUvTyaaNkzM&list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
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
