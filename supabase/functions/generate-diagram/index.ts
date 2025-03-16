
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

    const enhancedPrompt = detailedPrompt 
      ? `Create a clear, educational diagram illustrating: "${prompt}". 
         Make it visually appealing and easy to understand for students and researchers. 
         Include appropriate labels, arrows, and visual elements that help explain the concept effectively.
         The diagram should be professional and suitable for educational purposes.
         Please respond only with a clear and concise diagram that can be directly displayed as an image.`
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
          temperature: 0.4,
          topK: 32,
          topP: 1,
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
            JSON.stringify({ imageUrl: imgMatch[0] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // No direct image URL, return the text for processing
        return new Response(
          JSON.stringify({ text: textPart.text }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    throw new Error("No valid diagram generation in response");
  } catch (error) {
    console.error("Error generating diagram:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
