
import { toast } from "sonner";

const GEMINI_API_KEY = "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
         Make sure text is legible and important elements stand out.`
      : `Create a high quality diagram about: ${prompt}`;
    
    console.log("Generating diagram with Gemini:", enhancedPrompt);
    
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
          temperature: 0.3,  // Lower temperature for more focused outputs
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate image");
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts) {
      // Look for an image in the response
      const parts = data.candidates[0].content.parts;
      const textPart = parts.find((part: any) => part.text);
      
      if (textPart) {
        // Extract the image URL if it exists in the text
        const imgMatch = textPart.text.match(/https:\/\/[^)\s]+\.(png|jpg|jpeg|gif)/i);
        if (imgMatch) {
          return imgMatch[0];
        }
        
        // No direct image URL, return the text for processing
        return textPart.text;
      }
    }
    
    throw new Error("No valid diagram generation in response");
  } catch (error: any) {
    console.error("Error generating diagram with Gemini:", error);
    toast.error(`Failed to generate diagram: ${error.message}`);
    return null;
  }
};
