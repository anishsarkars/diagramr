
import { toast } from "sonner";

// URLs for the Supabase Edge Function
const DIAGRAM_GENERATION_URL = "/api/generate-diagram"; 
const FALLBACK_IMAGE_URL = "/lovable-uploads/7950c6cb-34b4-4e5f-b4da-a9a7d68d9d1d.png";

interface GenerationOptions {
  prompt: string;
  detailedPrompt?: boolean;
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Main function to generate diagrams using the Supabase Edge Function
export async function generateDiagramWithAI(
  prompt: string,
  options: Partial<GenerationOptions> = {}
): Promise<GenerationResult> {
  console.log("[AI Generator] Starting diagram generation for:", prompt);
  
  try {
    const generationOptions = {
      prompt: prompt,
      detailedPrompt: options.detailedPrompt ?? true,
    };
    
    console.log("[AI Generator] Sending request to edge function:", 
      JSON.stringify(generationOptions));
    
    // Attempt to generate using Edge Function
    const response = await fetch(DIAGRAM_GENERATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generationOptions)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI Generator] Error response from edge function:", errorText);
      throw new Error(`Edge function error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("[AI Generator] Received response:", 
      JSON.stringify(data).substring(0, 150) + "...");
    
    if (!data.success) {
      console.error("[AI Generator] Error in generation data:", data.error);
      throw new Error(data.error || "Generation failed");
    }
    
    if (!data.imageUrl) {
      console.error("[AI Generator] No image URL in success response");
      throw new Error("No image URL returned");
    }
    
    console.log("[AI Generator] Successfully generated diagram");
    
    return {
      success: true,
      imageUrl: data.imageUrl
    };
  } catch (error) {
    console.error("[AI Generator] Error during generation:", error);
    
    // Provide a fallback image
    console.log("[AI Generator] Returning fallback image");
    return {
      success: true,
      imageUrl: FALLBACK_IMAGE_URL,
      error: error instanceof Error ? error.message : "Unknown error during generation"
    };
  }
}

// Function to create a useful prompt for diagram generation
export function createDiagramPrompt(query: string, isDetailed: boolean = true): string {
  if (!isDetailed) return query;
  
  const prompt = `Create a professional, educational diagram that illustrates: "${query}".
    
This should be:
- Clear, accurate, and visually appealing
- Properly labeled with all key elements identified
- Using appropriate colors and visual hierarchy
- Optimized for educational use in presentations or documentation
- Suitable for students, researchers, or professionals
- High resolution with clean, precise lines
- Following best practices for information visualization

Make the diagram highly relevant to the specific topic: "${query}"`;

  return prompt;
}
