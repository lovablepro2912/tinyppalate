import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchSize = 5, startFromId = 0, autoContinue = true, regenerateAll = false } = await req.json().catch(() => ({}));

    console.log(`Starting batch generation. Batch size: ${batchSize}, Starting from ID: ${startFromId}, Auto-continue: ${autoContinue}, Regenerate all: ${regenerateAll}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get foods - either all foods or just those without images
    let query = supabase
      .from("ref_foods")
      .select("id, name")
      .gt("id", startFromId)
      .order("id", { ascending: true })
      .limit(batchSize);

    // Only filter by null image_url if not regenerating all
    if (!regenerateAll) {
      query = query.is("image_url", null);
    }

    const { data: foods, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch foods: ${fetchError.message}`);
    }

    if (!foods || foods.length === 0) {
      console.log("✅ ALL FOODS HAVE IMAGES - Generation complete!");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "All foods have images - generation complete!", 
          processed: 0,
          remaining: 0,
          complete: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Count total remaining before processing
    let countQuery = supabase
      .from("ref_foods")
      .select("id", { count: "exact", head: true });
    
    if (!regenerateAll) {
      countQuery = countQuery.is("image_url", null);
    } else {
      countQuery = countQuery.gt("id", startFromId);
    }
    
    const { count: totalRemaining } = await countQuery;

    console.log(`📊 Progress: ${totalRemaining} foods remaining. Processing batch of ${foods.length}...`);

    const results: Array<{ foodId: number; foodName: string; success: boolean; error?: string }> = [];
    
    // Process each food with delay to avoid rate limits
    for (const food of foods) {
      console.log(`🍽️ Processing: ${food.name} (ID: ${food.id})`);
      
      try {
        // Call the single image generation function
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-food-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            foodId: food.id,
            foodName: food.name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          
          // If rate limited, stop processing and schedule continuation
          if (response.status === 429) {
            console.log("⚠️ Rate limited, waiting 60 seconds before continuing...");
            results.push({ 
              foodId: food.id, 
              foodName: food.name, 
              success: false, 
              error: "Rate limited" 
            });
            // Wait longer before continuing (60 seconds)
            await delay(60000);
            continue;
          }
          
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        results.push({ 
          foodId: food.id, 
          foodName: food.name, 
          success: true 
        });
        console.log(`✅ Completed: ${food.name}`);
      } catch (error) {
        console.error(`❌ Failed: ${food.name}`, error);
        results.push({ 
          foodId: food.id, 
          foodName: food.name, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }

      // Wait between requests to avoid rate limits (12 seconds)
      if (foods.indexOf(food) < foods.length - 1) {
        console.log("⏳ Waiting 12 seconds before next request...");
        await delay(12000);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const lastProcessedId = results.length > 0 ? results[results.length - 1].foodId : startFromId;

    // Count remaining foods after this batch
    let remainingQuery = supabase
      .from("ref_foods")
      .select("id", { count: "exact", head: true });
    
    if (!regenerateAll) {
      remainingQuery = remainingQuery.is("image_url", null);
    } else {
      remainingQuery = remainingQuery.gt("id", lastProcessedId);
    }
    
    const { count: remaining } = await remainingQuery;

    console.log(`📊 Batch complete. Success: ${successCount}/${results.length}. Remaining: ${remaining}`);

    // Auto-continue if there are more foods to process
    if (autoContinue && remaining && remaining > 0) {
      console.log(`🔄 Auto-continuing with next batch starting from ID: ${lastProcessedId}`);
      
      // Trigger next batch asynchronously (don't wait for response)
      fetch(`${supabaseUrl}/functions/v1/generate-all-food-images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchSize,
          startFromId: lastProcessedId,
          autoContinue: true,
          regenerateAll,
        }),
      }).catch(err => console.error("Failed to trigger next batch:", err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successful: successCount,
        failed: results.length - successCount,
        remaining: remaining || 0,
        lastProcessedId,
        results,
        autoContinuing: autoContinue && remaining && remaining > 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Batch processing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
