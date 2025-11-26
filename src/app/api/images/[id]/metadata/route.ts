import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/server/supabase-server";

/**
 * Update image metadata (tags, description, colors)
 * PATCH /api/images/[id]/metadata
 * Body: { tags?: string[], description?: string, colors?: string[] }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const imageId = parseInt(id, 10);

    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: "Invalid image ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { tags, description, colors } = body;

    if (!tags && !description && !colors) {
      return NextResponse.json(
        { error: "At least one field (tags, description, colors) must be provided" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: image } = await supabase
      .from("images")
      .select("user_id")
      .eq("id", imageId)
      .single();

    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const updateData: {
      tags?: string[];
      description?: string | null;
      colors?: string[];
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : [];
    }
    if (description !== undefined) {
      updateData.description = description || null;
    }
    if (colors !== undefined) {
      updateData.colors = Array.isArray(colors) ? colors : [];
    }

    const { data: metadata, error: updateError } = await supabase
      .from("image_metadata")
      .update(updateData)
      .eq("image_id", imageId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update metadata: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Metadata updated successfully",
      metadata,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "An error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

