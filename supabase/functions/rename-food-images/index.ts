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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all foods with existing images
    const { data: foods, error: fetchError } = await supabase
      .from("ref_foods")
      .select("id, name, image_url")
      .not("image_url", "is", null);

    if (fetchError) {
      throw new Error(`Failed to fetch foods: ${fetchError.message}`);
    }

    console.log(`Found ${foods?.length || 0} foods with images to rename`);

    const results: Array<{
      id: number;
      name: string;
      oldFile: string;
      newFile: string;
      status: string;
    }> = [];

    // Track used names to handle duplicates
    const usedNames = new Set<string>();

    for (const food of foods || []) {
      try {
        // Extract old filename from URL
        const oldUrl = food.image_url;
        const oldFileName = oldUrl.split("/").pop();
        
        if (!oldFileName) {
          results.push({
            id: food.id,
            name: food.name,
            oldFile: oldUrl,
            newFile: "",
            status: "skipped - no filename found",
          });
          continue;
        }

        // Check if already renamed (not starting with "food-")
        if (!oldFileName.startsWith("food-")) {
          results.push({
            id: food.id,
            name: food.name,
            oldFile: oldFileName,
            newFile: oldFileName,
            status: "already renamed",
          });
          continue;
        }

        // Get file extension
        const extension = oldFileName.split(".").pop() || "png";

        // Create new filename from food name
        let slugName = slugify(food.name);
        
        // Handle duplicates by appending ID
        if (usedNames.has(slugName)) {
          slugName = `${slugName}-${food.id}`;
        }
        usedNames.add(slugName);
        
        const newFileName = `${slugName}.${extension}`;

        console.log(`Renaming: ${oldFileName} -> ${newFileName}`);

        // Download the existing file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("food-images")
          .download(oldFileName);

        if (downloadError) {
          console.error(`Download error for ${oldFileName}:`, downloadError);
          results.push({
            id: food.id,
            name: food.name,
            oldFile: oldFileName,
            newFile: newFileName,
            status: `download failed: ${downloadError.message}`,
          });
          continue;
        }

        // Upload with new name
        const arrayBuffer = await fileData.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from("food-images")
          .upload(newFileName, arrayBuffer, {
            contentType: `image/${extension}`,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${newFileName}:`, uploadError);
          results.push({
            id: food.id,
            name: food.name,
            oldFile: oldFileName,
            newFile: newFileName,
            status: `upload failed: ${uploadError.message}`,
          });
          continue;
        }

        // Get new public URL
        const { data: urlData } = supabase.storage
          .from("food-images")
          .getPublicUrl(newFileName);

        const newImageUrl = urlData.publicUrl;

        // Update database with new URL
        const { error: updateError } = await supabase
          .from("ref_foods")
          .update({ image_url: newImageUrl })
          .eq("id", food.id);

        if (updateError) {
          console.error(`Update error for ${food.id}:`, updateError);
          results.push({
            id: food.id,
            name: food.name,
            oldFile: oldFileName,
            newFile: newFileName,
            status: `db update failed: ${updateError.message}`,
          });
          continue;
        }

        // Delete old file
        const { error: deleteError } = await supabase.storage
          .from("food-images")
          .remove([oldFileName]);

        if (deleteError) {
          console.error(`Delete error for ${oldFileName}:`, deleteError);
          // Don't fail - file was renamed successfully
        }

        results.push({
          id: food.id,
          name: food.name,
          oldFile: oldFileName,
          newFile: newFileName,
          status: "success",
        });

        console.log(`Successfully renamed: ${oldFileName} -> ${newFileName}`);
      } catch (err) {
        console.error(`Error processing food ${food.id}:`, err);
        results.push({
          id: food.id,
          name: food.name,
          oldFile: food.image_url,
          newFile: "",
          status: `error: ${err instanceof Error ? err.message : "unknown"}`,
        });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const skippedCount = results.filter((r) => r.status.includes("already renamed") || r.status.includes("skipped")).length;
    const failedCount = results.filter((r) => !["success", "already renamed", "skipped - no filename found"].includes(r.status) && !r.status.includes("already")).length;

    console.log(`Rename complete: ${successCount} success, ${skippedCount} skipped, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: results.length,
          renamed: successCount,
          skipped: skippedCount,
          failed: failedCount,
        },
        results,
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
