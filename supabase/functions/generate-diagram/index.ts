
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyCL-wB_Ym_40vV17e1gFhyyL-o2864KQN8";
const STABILITY_API_KEY = Deno.env.get("STABILITY_API_KEY") || "sk-glNeUMg8H2IIBEKoPNftbAIQ97EnAl5QrBAETnqxIT76zTCS";
const CLOUDFLARE_API_KEY = Deno.env.get("CLOUDFLARE_API_KEY") || "69Jz-coOYL8VI8fPR2MtES0-N7bTS02FVlA34D-e";

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

    // Enhanced prompt to generate higher quality, more relevant diagrams
    const enhancedPrompt = detailedPrompt 
      ? `Create a high-quality, professional diagram illustrating: "${prompt}". 
         Create this as a professional-looking, visually appealing diagram that would be suitable for
         educational materials, presentations, research papers, or business documentation.
         
         Make the diagram:
         1. Clear and precise - focus exactly on what is being asked
         2. Visually attractive with appropriate colors and styling
         3. Well-structured with logical flow and professional layout
         4. Properly labeled with detailed annotations
         5. High resolution (at least 1920x1080)
         6. Include appropriate legends, titles, and explanations when needed
         
         The diagram must be extremely relevant to the specific request and contain appropriate technical details.
         Please respond only with a clear, high-quality diagram image that can be directly displayed.
         No additional text explanations are needed in the response.`
      : prompt;
    
    console.log("Generating diagram with prompt:", enhancedPrompt);
    
    // Try with Cloudflare Workers AI first
    try {
      console.log("Trying Cloudflare Workers AI...");
      const response = await fetch("https://api.cloudflare.com/client/v4/accounts/e5fad8b4d6ca29e53d57831b4e45ebd7/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CLOUDFLARE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt + ", professional diagram, high quality, detailed, educational, vectorized, sharp, clean lines, infographic style, minimalist, educational diagram",
          num_steps: 40,
          height: 1024,
          width: 1024
        })
      });
      
      if (!response.ok) {
        throw new Error(`Cloudflare API request failed with status: ${response.status}`);
      }
      
      const imageArrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(imageArrayBuffer);
      
      // Convert to base64
      let binaryString = "";
      bytes.forEach(byte => binaryString += String.fromCharCode(byte));
      const base64Image = btoa(binaryString);
      
      return new Response(
        JSON.stringify({ 
          imageUrl: `data:image/png;base64,${base64Image}`,
          success: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (cloudflareError) {
      console.error("Cloudflare API error:", cloudflareError);
      
      // Try with Stability AI
      try {
        console.log("Trying Stability API...");
        const stabilityResponse = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${STABILITY_API_KEY}`,
          },
          body: JSON.stringify({
            text_prompts: [
              {
                text: enhancedPrompt + ", professional diagram, high quality, detailed, educational, vectorized, sharp, clean lines, infographic style",
                weight: 1
              },
              {
                text: "blurry, distorted, low quality, ugly, unrealistic, photographic, photograph, photo, text, words",
                weight: -1
              }
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 40,
            samples: 1
          })
        });
        
        if (!stabilityResponse.ok) {
          throw new Error(`Stability AI API request failed with status: ${stabilityResponse.status}`);
        }
        
        const stabilityData = await stabilityResponse.json();
        if (stabilityData.artifacts && stabilityData.artifacts.length > 0) {
          const base64Image = stabilityData.artifacts[0].base64;
          
          return new Response(
            JSON.stringify({ 
              imageUrl: `data:image/png;base64,${base64Image}`,
              success: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error("No image generated by Stability AI");
        }
      } catch (stabilityError) {
        console.error("Stability AI error:", stabilityError);
        
        // Try with Gemini Pro as final fallback
        try {
          console.log("Trying Gemini Pro as fallback...");
          const geminiResponse = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
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
          
          if (!geminiResponse.ok) {
            throw new Error(`Gemini API request failed with status: ${geminiResponse.status}`);
          }
          
          const data = await geminiResponse.json();
          return handleGeminiResponse(data, corsHeaders);
        } catch (geminiError) {
          console.error("Gemini API error:", geminiError);
          
          // Create a text-based fallback
          const fallbackResponse = `
            I'm having trouble generating a direct image for "${prompt}". 
            
            But here's a detailed description of what such a diagram would include:
            
            A comprehensive diagram about ${prompt} would include key components like:
            1. Main concepts clearly labeled
            2. Visual representation of relationships
            3. Color-coded sections for different aspects
            4. Clear organization with a logical flow
            
            Please try again or search for "${prompt} diagram" to find similar resources.
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
