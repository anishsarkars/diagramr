
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, detailedPrompt = true } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required", success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhance the prompt to generate higher quality, more relevant diagrams
    const enhancedPrompt = detailedPrompt 
      ? `Create a high-quality, educational diagram illustrating: "${prompt}". 
         Create this as a professional-looking, visually appealing diagram that would be suitable for
         educational materials, presentations, or research papers.
         
         Make the diagram:
         1. Clear and precise - focus exactly on what is being asked
         2. Visually attractive with appropriate colors and styling
         3. Well-structured with logical flow
         4. Properly labeled with detailed annotations
         5. High resolution (at least 1920x1080)
         
         The diagram must be extremely relevant to the specific request and contain appropriate technical details.
         Please respond only with a clear, high-quality diagram image that can be directly displayed.
         No additional text explanations are needed in the response.`
      : prompt;
    
    console.log("Generating diagram with Gemini:", enhancedPrompt);
    
    // Try with Gemini Pro model
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
            temperature: 0.1, // Very low temperature for precise results
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
      return handleGeminiResponse(data, corsHeaders);
    } catch (directApiError) {
      console.error("Direct Gemini API error:", directApiError);
      
      // Try with Gemini 1.5 model
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
              temperature: 0.2,
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
        return handleGeminiResponse(data, corsHeaders);
      } catch (alternativeError) {
        console.error("Alternative Gemini model error:", alternativeError);
        
        // If both direct APIs fail, create a basic diagram description that can be used for searching
        const fallbackResponse = `
          I'm having trouble generating a direct image for "${prompt}". 
          
          But here's a detailed description of what such a diagram would include:
          
          A comprehensive diagram about ${prompt} would include key components like:
          1. Main concepts clearly labeled
          2. Visual representation of relationships
          3. Color-coded sections for different aspects
          4. Clear organization with a logical flow
          
          Please try again or search for "${prompt} diagram" to find similar educational resources.
        `;
        
        return new Response(
          JSON.stringify({ 
            text: fallbackResponse,
            error: "Could not generate diagram directly, but created a description",
            success: false
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error("Error generating diagram:", error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to process Gemini response data
function handleGeminiResponse(data: any, corsHeaders: any) {
  if (data.candidates && data.candidates[0]?.content?.parts) {
    // Look for an image or text in the response
    const parts = data.candidates[0].content.parts;
    const textPart = parts.find((part: any) => part.text);
    
    if (textPart) {
      // Extract the image URL if it exists in the text
      const imgMatch = textPart.text.match(/https:\/\/[^)\s]+\.(png|jpg|jpeg|gif)/i);
      if (imgMatch) {
        return new Response(
          JSON.stringify({ 
            imageUrl: imgMatch[0],
            success: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // No direct image URL, return the text for processing
      return new Response(
        JSON.stringify({ 
          text: textPart.text,
          success: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for inline image parts
    const inlineImagePart = parts.find((part: any) => part.inlineData);
    if (inlineImagePart && inlineImagePart.inlineData) {
      return new Response(
        JSON.stringify({ 
          imageData: inlineImagePart.inlineData,
          success: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  throw new Error("No valid diagram generation in response");
}
