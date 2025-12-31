import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodId, foodName } = await req.json();

    if (!foodId || !foodName) {
      throw new Error("foodId and foodName are required");
    }

    console.log(`Generating image for: ${foodName} (ID: ${foodId})`);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Generate image using Gemini 2.0 Flash
    // Clarify food context to avoid confusion with characters (e.g., Peach from Mario)
    const prompt = `Create a flat, minimal illustration of the FOOD item "${foodName}" (this is an edible food/fruit/vegetable, NOT a character or person) in a child-friendly style. Clean vector-like design with soft shadows, vibrant saturated colors, on a light pastel background (#f4f9fa). Single food item centered, realistic proportions, no text, no borders, no labels, no faces, no characters. Style similar to modern app icons. High quality, crisp edges.`;

    console.log(`Prompt: ${prompt}`);

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ["image", "text"],
            responseMimeType: "image/png",
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Gemini API error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 403) {
        return new Response(JSON.stringify({ error: "API key invalid or quota exceeded" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("Gemini Response received");

    // Extract image from Gemini response
    const parts = aiData.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find((part: any) => part.inlineData);
    
    if (!imagePart?.inlineData) {
      console.error("No image in response:", JSON.stringify(aiData));
      throw new Error("No image generated");
    }

    const { mimeType, data: base64Content } = imagePart.inlineData;
    const imageFormat = mimeType.split("/")[1] || "png";
    const imageBytes = Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0));

    console.log(`Image generated: ${imageFormat}, size: ${imageBytes.length} bytes`);

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const fileName = `food-${foodId}.${imageFormat}`;

    const { error: uploadError } = await supabase.storage
      .from("food-images")
      .upload(fileName, imageBytes, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("food-images").getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;
    console.log(`Image uploaded: ${imageUrl}`);

    // Update foods table (using UUID-based id)
    const { error: updateError } = await supabase
      .from("foods")
      .update({ image_url: imageUrl })
      .eq("id", foodId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`Successfully generated and saved image for ${foodName}`);

    return new Response(
      JSON.stringify({
        success: true,
        foodId,
        foodName,
        imageUrl,
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
