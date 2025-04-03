
// Gemini AI integration

export interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GeminiResponse {
  suggestions?: string[];
  error?: string;
}

/**
 * Generates suggestions using Google's Gemini API
 */
export async function generateSuggestions(query: string): Promise<GeminiResponse> {
  try {
    const apiKey = "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
    
    // Don't make real API calls if the key isn't available or valid
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      console.log("Using fallback suggestions (no API key available)");
      return getFallbackSuggestions(query);
    }
    
    const messages: GeminiMessage[] = [
      {
        role: "user",
        content: `I'm looking for diagrams about "${query}". Suggest 4 specific searches that would find good diagrams related to this topic. Each suggestion should be a specific diagram type. Answer with ONLY a JSON array of strings, nothing else.`
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
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 200,
          }
        }),
      });
      
      if (!response.ok) {
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
            return { suggestions: suggestions.slice(0, 4) };
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
    "data flow diagram"
  ];
  
  // Always give at least one exact match with the query
  const suggestions = [
    `${query} ${baseTypes[0]}`,
    `${query} ${baseTypes[1]}`,
    `${baseTypes[2]} for ${query}`,
    `${baseTypes[3]} of ${query} process`
  ];
  
  return { suggestions };
}
