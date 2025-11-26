import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/server/supabase-server";
import { analyzeImageWithAI } from "@/lib/server/ai-service";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";

/**
 * API route to process an image with AI analysis
 * This runs in the background after image upload
 * 
 * POST /api/ai/process-image
 * Body: { imageId: number }
 */
export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();

    if (!imageId || typeof imageId !== "number") {
      return NextResponse.json(
        { error: "Invalid imageId provided" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const adminSupabase = createSupabaseAdminClient();

    // Get the image record
    const { data: image, error: imageError } = await supabase
      .from("images")
      .select("*")
      .eq("id", imageId)
      .single();

    if (imageError || !image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Check if metadata already exists
    const { data: existingMetadata } = await supabase
      .from("image_metadata")
      .select("*")
      .eq("image_id", imageId)
      .single();

    if (existingMetadata?.ai_processing_status === "completed") {
      return NextResponse.json({
        message: "Image already processed",
        metadata: existingMetadata,
      });
    }

    // Update status to processing (metadata should exist from upload, but create if missing)
    if (existingMetadata) {
      await supabase
        .from("image_metadata")
        .update({ ai_processing_status: "processing" })
        .eq("id", existingMetadata.id);
    } else {
      // Fallback: create metadata if it doesn't exist (shouldn't happen, but handle it)
      await supabase.from("image_metadata").insert({
        image_id: imageId,
        user_id: image.user_id,
        ai_processing_status: "processing",
        tags: [],
        colors: [],
        description: null,
      });
    }

    // Download the image from Supabase Storage
    const { data: imageData, error: downloadError } = await adminSupabase.storage
      .from("images")
      .download(image.original_path);

    if (downloadError || !imageData) {
      // Update status to failed
      await supabase
        .from("image_metadata")
        .update({ ai_processing_status: "failed" })
        .eq("image_id", imageId);

      return NextResponse.json(
        { error: "Failed to download image" },
        { status: 500 }
      );
    }

    // Convert image to base64
    const arrayBuffer = await imageData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Determine MIME type from filename
    const mimeType = image.filename.endsWith(".png")
      ? "image/png"
      : "image/jpeg";

    // Analyze image with AI
    let aiResult;
    try {
      aiResult = await analyzeImageWithAI(base64Image, mimeType);
    } catch (aiError) {
      
      // Update status to failed with error details
      await supabase
        .from("image_metadata")
        .update({
          ai_processing_status: "failed",
          description: `AI processing failed: ${aiError instanceof Error ? aiError.message : "Unknown error"}`,
        })
        .eq("image_id", imageId);

      return NextResponse.json(
        {
          error: "AI analysis failed",
          details: aiError instanceof Error ? aiError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Validate AI results before saving
    if (
      !aiResult.tags ||
      aiResult.tags.length === 0 ||
      !aiResult.description ||
      aiResult.description === "An image that has been uploaded." ||
      !aiResult.colors ||
      aiResult.colors.length === 0
    ) {
      await supabase
        .from("image_metadata")
        .update({ ai_processing_status: "failed" })
        .eq("image_id", imageId);

      return NextResponse.json(
        { error: "AI returned invalid results" },
        { status: 500 }
      );
    }

    // Save results to database
    const { data: metadata, error: updateError } = await supabase
      .from("image_metadata")
      .update({
        tags: aiResult.tags,
        description: aiResult.description,
        colors: aiResult.colors,
        ai_processing_status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("image_id", imageId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to save AI analysis results" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Image processed successfully",
      metadata,
    });
  } catch (error) {
    // Try to update status to failed
    try {
      const body = await request.json().catch(() => ({}));
      const imageId = body.imageId;
      if (imageId) {
        const supabase = await createSupabaseServerClient();
        await supabase
          .from("image_metadata")
          .update({
            ai_processing_status: "failed",
            description: `Processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
          })
          .eq("image_id", imageId);
      }
    } catch (updateError) {
      // Silently fail - error already occurred
    }

    return NextResponse.json(
      {
        error: "Internal server error during AI processing",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

