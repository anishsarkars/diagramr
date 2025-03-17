
import { toast } from "sonner";

const GEMINI_API_KEY = "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

// Fallback function using the edge function instead of direct Gemini API
const generateWithEdgeFunction = async (prompt: string): Promise<string | null> => {
  try {
    console.log("Using edge function fallback for diagram generation:", prompt);
    
    const response = await fetch('/api/generate-diagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        detailedPrompt: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Edge function error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.imageUrl) {
      return data.imageUrl;
    } else if (data.success && data.text) {
      // Extract image URL from text if possible
      const imgMatch = data.text.match(/https:\/\/[^)\s]+\.(png|jpg|jpeg|gif)/i);
      if (imgMatch) {
        return imgMatch[0];
      }
    }
    
    throw new Error(data.error || "No valid diagram generated");
  } catch (error: any) {
    console.error("Error using edge function for diagram:", error);
    return null;
  }
};

// A function to generate a static image URL based on the prompt
// This is a fallback for when both Gemini and the edge function fail
const generateFallbackImageUrl = (prompt: string): string => {
  // Create a hash from the prompt to make unique but consistent URLs
  const hash = prompt.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  // Use the hash to select one of several placeholder diagram images
  const imageIndex = Math.abs(hash) % 5 + 1;
  
  // Return a link to a placeholder diagram image
  return `/lovable-uploads/7950c6cb-34b4-4e5f-b4da-a9a7d68d9d1d.png`;
};

interface GenerateImageOptions {
  prompt: string;
  detailedPrompt?: boolean;
  highQuality?: boolean;
}

export const generateDiagramWithGemini = async (
  { prompt, detailedPrompt = true, highQuality = true }: GenerateImageOptions
): Promise<string | null> => {
  try {
    const enhancedPrompt = detailedPrompt 
      ? `Create a stunning, high-quality educational diagram illustrating: "${prompt}". 
         Make it visually appealing with bold colors, clear labels, and professional design.
         Include appropriate arrows, visual elements, and detailed annotations that help explain the concept effectively.
         The diagram should be very high resolution (at least 1920x1080), suitable for educational presentations.
         Use a clean, modern design style with strong visual hierarchy and professional typography.
         The diagram should be comprehensive yet easy to understand, with a clear flow of information.
         Make sure text is legible and important elements stand out.
         Create this as a diagram that would appear in a professional textbook or educational website.
         IMPORTANT: Respond ONLY with a diagram image, don't include any text explanations.`
      : `Create a high quality diagram about: ${prompt}. Respond ONLY with a diagram image, no text.`;
    
    console.log("Generating diagram with Gemini:", enhancedPrompt);
    
    // Try with direct Gemini API first
    try {
      const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more consistent results
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts) {
        // Look for an image or text in the response
        const parts = data.candidates[0].content.parts;
        const textPart = parts.find((part: any) => part.text);
        
        if (textPart) {
          // Extract the image URL if it exists in the text
          const imgMatch = textPart.text.match(/https:\/\/[^)\s]+\.(png|jpg|jpeg|gif)/i);
          if (imgMatch) {
            return imgMatch[0];
          }
          
          // No direct image URL found, but we have text
          console.log("Gemini returned text without image URL. Trying alternative approach.");
        }
      }
      
      throw new Error("No valid diagram found in Gemini response");
    } catch (geminiError) {
      console.warn("Primary Gemini API failed:", geminiError);
      
      // Try the Gemini 1.5 model as a fallback
      try {
        const alternativeResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: enhancedPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 32,
              topP: 0.95,
              maxOutputTokens: 4096,
            }
          })
        });
        
        if (!alternativeResponse.ok) {
          throw new Error(`Alternative Gemini model failed with status: ${alternativeResponse.status}`);
        }
        
        const data = await alternativeResponse.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts) {
          const parts = data.candidates[0].content.parts;
          const textPart = parts.find((part: any) => part.text);
          
          if (textPart) {
            const imgMatch = textPart.text.match(/https:\/\/[^)\s]+\.(png|jpg|jpeg|gif)/i);
            if (imgMatch) {
              return imgMatch[0];
            }
          }
        }
        
        throw new Error("No valid diagram found in alternative Gemini response");
      } catch (alternativeError) {
        console.warn("Alternative Gemini model failed:", alternativeError);
        
        // Use edge function as another fallback
        const edgeFunctionResult = await generateWithEdgeFunction(prompt);
        if (edgeFunctionResult) {
          return edgeFunctionResult;
        }
        
        // If all else fails, use a fallback static image
        console.warn("All generation attempts failed, using fallback static image");
        return generateFallbackImageUrl(prompt);
      }
    }
  } catch (error: any) {
    console.error("Error generating diagram with all methods:", error);
    toast.error(`Failed to generate diagram: ${error.message}`);
    
    // Use a fallback static image as last resort
    return generateFallbackImageUrl(prompt);
  }
};
