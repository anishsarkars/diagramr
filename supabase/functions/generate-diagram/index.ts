
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
        JSON.stringify({ error: "Prompt is required" }),
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
         5. High resolution (at least 1200px width)
         
         The diagram must be extremely relevant to the specific request and contain appropriate technical details.
         Please respond only with a clear, high-quality diagram image that can be directly displayed.
         No additional text explanations are needed in the response.`
      : prompt;
    
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
          temperature: 0.2, // Lower temperature for more focused results
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      throw new Error("Failed to generate image with Gemini API");
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
    }
    
    throw new Error("No valid diagram generation in response");
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
