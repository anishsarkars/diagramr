import { toast } from "sonner";

// API keys
const CLOUDFLARE_API_KEY = "69Jz-coOYL8VI8fPR2MtES0-N7bTS02FVlA34D-e";
const STABILITY_API_KEY = "sk-glNeUMg8H2IIBEKoPNftbAIQ97EnAl5QrBAETnqxIT76zTCS";

interface GenerateImageResult {
  imageUrl: string;
  success: boolean;
  error?: string;
}

export async function generateDiagramWithAI(prompt: string): Promise<GenerateImageResult> {
  console.log("Generating diagram with AI for prompt:", prompt);
  toast.info("Generating diagram...", { duration: 3000 });
  
  // Enhance the prompt for better educational diagrams
  const enhancedPrompt = `Create a stunning, high-quality, professional diagram for: "${prompt}". 
  The diagram should be clean, visually appealing with perfect color harmony, clear text labels, and professional design.
  Include relevant icons, arrows connecting elements, detailed annotations, and a logical structure.
  Style it like a premium infographic or professional documentation diagram with clear hierarchy.
  Make it extremely legible with good contrast and spacing. The diagram should be modern, minimal, and suitable for business presentations.`;
  
  try {
    // First try Stability AI for highest quality diagrams
    console.log("Attempting to generate with Stability AI...");
    const stabilityResult = await generateWithStabilityAI(enhancedPrompt);
    if (stabilityResult.success) {
      console.log("Successfully generated diagram with Stability AI");
      toast.success("Diagram generated successfully!");
      return stabilityResult;
    }
    console.warn("Stability AI generation failed, trying Cloudflare");
  } catch (error) {
    console.error("Error with Stability AI generation:", error);
  }
  
  // Try Cloudflare as another option
  try {
    console.log("Attempting to generate with Cloudflare...");
    const cloudflareResult = await generateWithCloudflare(enhancedPrompt);
    if (cloudflareResult.success) {
      console.log("Successfully generated diagram with Cloudflare");
      toast.success("Diagram generated successfully!");
      return cloudflareResult;
    }
    console.warn("Cloudflare generation failed, trying Edge Function");
  } catch (error) {
    console.error("Error with Cloudflare generation:", error);
  }
  
  // Try using the Edge Function (fallback approach)
  try {
    console.log("Attempting to generate with Edge Function...");
    const edgeFunctionResult = await generateWithEdgeFunction(enhancedPrompt);
    if (edgeFunctionResult.success) {
      console.log("Successfully generated diagram with Edge Function");
      toast.success("Diagram generated successfully!");
      return edgeFunctionResult;
    }
    console.warn("Edge Function generation failed");
  } catch (error) {
    console.error("Error with Edge Function generation:", error);
  }
  
  // Final fallback to high-quality static image if all methods fail
  console.warn("All generation attempts failed, using fallback static image");
  toast.info("Using alternative diagram as generation failed");
  return {
    imageUrl: generateFallbackImageUrl(prompt),
    success: true
  };
}

async function generateWithEdgeFunction(prompt: string): Promise<GenerateImageResult> {
  try {
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
      console.error("Edge function error status:", response.status);
      const errorText = await response.text();
      console.error("Edge function error response:", errorText);
      throw new Error(`Edge function error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Edge function response:", data);
    
    if (data.success && data.imageUrl) {
      return { imageUrl: data.imageUrl, success: true };
    } else {
      throw new Error(data.error || "No valid diagram generated");
    }
  } catch (error) {
    console.error("Error with edge function:", error);
    return { 
      imageUrl: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function generateWithStabilityAI(prompt: string): Promise<GenerateImageResult> {
  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${STABILITY_API_KEY}`
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt + ", professional diagram, high quality, detailed, vector art, educational, vectorized, sharp clean lines, infographic style, technical diagram, minimalist, high resolution",
            weight: 1
          },
          {
            text: "blurry, distorted, ugly, low resolution, poor quality, photograph, photo-realistic, text, word, handwritten",
            weight: -1
          }
        ],
        cfg_scale: 9,
        height: 1024,
        width: 1024,
        steps: 40,
        samples: 1,
        style_preset: "digital-art"
      })
    });

    console.log("Stability API response status:", response.status);
    console.log("Stability API response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Stability API error response:", errorData);
      throw new Error(`Stability API error: ${errorData.message || response.statusText}`);
    }

    const responseData = await response.json();
    console.log("Stability API response data structure:", Object.keys(responseData));
    
    if (responseData.artifacts && responseData.artifacts.length > 0) {
      const base64Image = responseData.artifacts[0].base64;
      const imageUrl = `data:image/png;base64,${base64Image}`;
      return { imageUrl, success: true };
    } else {
      console.error("No artifacts found in Stability AI response:", responseData);
      throw new Error('No image generated by Stability AI');
    }
  } catch (error) {
    console.error("Stability AI generation error:", error);
    return { 
      imageUrl: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error with Stability AI generation' 
    };
  }
}

async function generateWithCloudflare(prompt: string): Promise<GenerateImageResult> {
  try {
    const response = await fetch("https://api.cloudflare.com/client/v4/accounts/e5fad8b4d6ca29e53d57831b4e45ebd7/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOUDFLARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt + ", professional diagram, high quality, detailed, vector art, educational, vectorized, sharp clean lines, infographic style, technical diagram, minimalist, high resolution",
        negative_prompt: "blurry, distorted, ugly, low resolution, poor quality, photograph, photo-realistic, text, word, handwritten",
        num_steps: 50,
        height: 1024,
        width: 1024,
        seed: Math.floor(Math.random() * 1000000)
      })
    });
    
    console.log("Cloudflare API response status:", response.status);
    console.log("Cloudflare API response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Cloudflare API error response:", errorText);
      throw new Error(`Cloudflare API request failed with status: ${response.status}`);
    }
    
    const imageArrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(imageArrayBuffer);
    
    let binaryString = "";
    bytes.forEach(byte => binaryString += String.fromCharCode(byte));
    const base64Image = btoa(binaryString);
    
    return {
      imageUrl: `data:image/png;base64,${base64Image}`,
      success: true
    };
  } catch (error) {
    console.error("Cloudflare generation error:", error);
    return { 
      imageUrl: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error with Cloudflare generation' 
    };
  }
}

// Fallback function to generate a high-quality static image URL based on the prompt
function generateFallbackImageUrl(prompt: string): string {
  const imageOptions = [
    "/lovable-uploads/5aa6a42f-771c-4e89-a3ba-e58ff53c701e.png",
    "/lovable-uploads/a837a9a5-a83f-42b8-835c-261565ed609f.png",
    "/lovable-uploads/e0a024c4-b883-4cfa-a811-67a922e06849.png",
    "/lovable-uploads/00280548-0e69-4df9-9d87-4dfdca65bb09.png",
    "/lovable-uploads/0bd711da-9830-4f71-ad4b-5b7325223770.png",
    "/lovable-uploads/14b933d8-4bc5-478d-a61d-0f37bd0404b1.png",
    "/lovable-uploads/1fcd5d05-8fe4-4a85-a06e-0797163cce27.png",
    "/lovable-uploads/29c6874b-2503-4a4a-ac77-228929a96128.png",
    "/lovable-uploads/a6ccf758-c406-414d-8f2e-e5e6d69439ff.png",
    "/lovable-uploads/ca791211-179d-415b-87a8-97ea4fcfa0cd.png"
  ];
  
  const imageIndex = Math.abs(hashCode(prompt)) % imageOptions.length;
  return imageOptions[imageIndex];
}

// Simple hash function for string
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
