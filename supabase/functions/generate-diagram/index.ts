
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STABILITY_API_KEY = "sk-glNeUMg8H2IIBEKoPNftbAIQ97EnAl5QrBAETnqxIT76zTCS";
const CLOUDFLARE_API_KEY = "t7wnDSddEAtH26r9pvoxWGR0k6rByUTZmw4CBn7B";

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
    // Get request body and validate
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Invalid JSON body:", e);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON body", 
          success: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, detailedPrompt = true } = body;

    if (!prompt) {
      console.error("Missing prompt in request");
      return new Response(
        JSON.stringify({ error: "Prompt is required", success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced prompt engineering specifically for academic and educational diagrams
    const enhancedPrompt = detailedPrompt 
      ? `Create a high-quality, educational diagram illustrating: "${prompt}". 
         The diagram must be suitable for academic use in textbooks, educational materials,
         research papers, or lecture presentations.
         
         Create this as:
         1. Clear and precise - focusing on academic accuracy and educational value
         2. Highly detailed with properly labeled components
         3. Professionally designed with clean layout and organization
         4. Well-labeled with clear annotations, legends, and academic terminology
         5. Using appropriate visual hierarchy to emphasize key educational concepts
         6. High resolution with sharp lines, clean text, and proper educational formatting
         7. Using color schemes appropriate for educational and academic contexts
         
         The diagram should follow established educational standards and be immediately 
         understandable to students, educators, and researchers. Include proper academic
         notation and formatting expected in educational contexts.
         
         Make the diagram extremely relevant to "${prompt}" with detailed visual elements that 
         accurately represent the academic concept being illustrated.`
      : prompt;
    
    console.log("Generating academic diagram with prompt:", enhancedPrompt);
    
    // Try with Stability AI first (highest quality, most reliable)
    try {
      console.log("Trying Stability API for academic diagram...");
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
              text: enhancedPrompt + ", educational diagram, academic illustration, high quality, detailed, educational, vectorized, sharp, clean lines, infographic style, technical illustration, minimalist, schematic, textbook quality",
              weight: 1
            },
            {
              text: "blurry, distorted, low quality, ugly, unrealistic, photographic, photograph, photo, person, face, hands, watermark, signature, low resolution",
              weight: -1
            }
          ],
          cfg_scale: 9,
          height: 1024,
          width: 1024,
          steps: 50,
          samples: 1,
          style_preset: "digital-art"
        })
      });
      
      // Log response for debugging
      console.log("Stability API response status:", stabilityResponse.status);
      
      if (!stabilityResponse.ok) {
        const errorText = await stabilityResponse.text();
        console.error("Stability API error:", errorText);
        throw new Error(`Stability AI API request failed with status: ${stabilityResponse.status}`);
      }
      
      const stabilityData = await stabilityResponse.json();
      if (stabilityData.artifacts && stabilityData.artifacts.length > 0) {
        const base64Image = stabilityData.artifacts[0].base64;
        
        return new Response(
          JSON.stringify({ 
            imageUrl: `data:image/png;base64,${base64Image}`,
            success: true,
            source: "ai-generated"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.error("No artifacts in stability response:", stabilityData);
        throw new Error("No image generated by Stability AI");
      }
    } catch (stabilityError) {
      console.error("Stability AI error:", stabilityError);
      
      // Try with Cloudflare as backup (also very reliable)
      try {
        console.log("Trying Cloudflare Workers AI for academic diagram...");
        const response = await fetch("https://api.cloudflare.com/client/v4/accounts/e5fad8b4d6ca29e53d57831b4e45ebd7/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${CLOUDFLARE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: enhancedPrompt + ", professional educational diagram, academic illustration, high quality, detailed, vector art, educational, vectorized, sharp clean lines, infographic style, technical diagram, minimalist, high resolution, textbook quality",
            negative_prompt: "blurry, distorted, ugly, low resolution, poor quality, photograph, photo-realistic, text, word, handwritten, watermark, signature, logo",
            num_steps: 50,
            height: 1024,
            width: 1024,
            seed: Math.floor(Math.random() * 1000000)
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Cloudflare API error:", errorText);
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
            success: true,
            source: "ai-generated"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (cloudflareError) {
        console.error("Cloudflare API error:", cloudflareError);
        
        // All methods failed, return a fallback educational image
        const fallbackImages = [
          "/lovable-uploads/5aa6a42f-771c-4e89-a3ba-e58ff53c701e.png",
          "/lovable-uploads/a837a9a5-a83f-42b8-835c-261565ed609f.png",
          "/lovable-uploads/e0a024c4-b883-4cfa-a811-67a922e06849.png",
          "/lovable-uploads/ec798833-9785-43fd-9962-8c826d437f27.png"
        ];
        
        const fallbackImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        
        return new Response(
          JSON.stringify({ 
            imageUrl: fallbackImage,
            error: "AI generation failed, returning educational fallback image",
            success: true,
            source: "fallback"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error("Error generating educational diagram:", error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
