import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Convert food name to URL-safe slug
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-');     // Replace multiple hyphens with single
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodId, foodName, description } = await req.json();

    if (!foodId || !foodName) {
      throw new Error("foodId and foodName are required");
    }

    // Use custom description if provided, otherwise use food name
    const foodDescription = description || foodName;
    console.log(`Generating image for: ${foodName} (ID: ${foodId}) with description: ${foodDescription}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate image using Lovable AI with Gemini
    // Clarify food context to avoid confusion with characters (e.g., Peach from Mario)
    const prompt = `Create a flat, minimal illustration of the FOOD item "${foodDescription}" (this is an edible food/fruit/vegetable, NOT a character or person) in a child-friendly style. Clean vector-like design with soft shadows, vibrant saturated colors, on a light pastel background (#f4f9fa). Single food item centered, realistic proportions, no text, no borders, no labels, no faces, no characters. Style similar to modern app icons. High quality, crisp edges.`;

    console.log(`Prompt: ${prompt}`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI Response received");

    // Extract image from response
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageData) {
      console.error("No image in response:", JSON.stringify(aiData));
      throw new Error("No image generated");
    }

    // Parse base64 image
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image format");
    }

    const imageFormat = base64Match[1];
    const base64Content = base64Match[2];
    const imageBytes = Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0));

    console.log(`Image generated: ${imageFormat}, size: ${imageBytes.length} bytes`);

    // Upload to Supabase Storage with food name as filename
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create filename from food name
    const slugName = slugify(foodName);
    const fileName = `${slugName}.${imageFormat}`;
    
    // Check if file already exists - if so, append ID to avoid conflicts
    const { data: existingFile } = await supabase.storage
      .from("food-images")
      .list("", { search: slugName });
    
    const finalFileName = existingFile && existingFile.length > 0 
      ? `${slugName}-${foodId}.${imageFormat}`
      : fileName;
    
    console.log(`Uploading as: ${finalFileName}`);
    
    const { error: uploadError } = await supabase.storage
      .from("food-images")
      .upload(finalFileName, imageBytes, {
        contentType: `image/${imageFormat}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("food-images")
      .getPublicUrl(finalFileName);

    const imageUrl = urlData.publicUrl;
    console.log(`Image uploaded: ${imageUrl}`);

    // Update ref_foods table
    const { error: updateError } = await supabase
      .from("ref_foods")
      .update({ image_url: imageUrl })
      .eq("id", foodId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`Successfully generated and saved image for ${foodName} as ${finalFileName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        foodId, 
        foodName,
        fileName: finalFileName,
        imageUrl 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});