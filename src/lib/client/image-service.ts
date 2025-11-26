"use client";

import { createSupabaseClient } from "./supabase-client";
import type { Image } from "@/types";
import {
  generateThumbnail,
  generateUniqueFilename,
  isValidImageFile,
} from "./image-utils";
import { THUMBNAIL_SIZE } from "@/lib/constants";

/**
 * Triggers AI processing for an uploaded image
 * This runs asynchronously in the background
 */
async function triggerAIProcessing(imageId: number): Promise<void> {
  try {
    const response = await fetch("/api/ai/process-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageId }),
    });

    if (!response.ok) {
      throw new Error(`AI processing failed: ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

export interface UploadResult {
  image: Image | null;
  error: string | null;
}

/**
 * Uploads a single image with thumbnail to Supabase Storage
 */
export async function uploadImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    if (!isValidImageFile(file)) {
      return {
        image: null,
        error: "Invalid file type. Only JPEG and PNG images are supported.",
      };
    }

    const supabase = createSupabaseClient();

    const originalFilename = generateUniqueFilename(file.name, userId);
    const thumbnailFilename = generateUniqueFilename(
      `thumb-${file.name}`,
      userId
    );

    onProgress?.(10);
    const thumbnailBlob = await generateThumbnail(file, THUMBNAIL_SIZE);
    const thumbnailFile = new File([thumbnailBlob], thumbnailFilename, {
      type: "image/jpeg",
    });
    onProgress?.(20);
    const { data: originalData, error: originalError } = await supabase.storage
      .from("images")
      .upload(originalFilename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (originalError) {
      return {
        image: null,
        error: `Failed to upload image: ${originalError.message}`,
      };
    }

    onProgress?.(60);

    const { data: thumbnailData, error: thumbnailError } = await supabase.storage
      .from("thumbnails")
      .upload(thumbnailFilename, thumbnailFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (thumbnailError) {
      await supabase.storage.from("images").remove([originalFilename]);
      return {
        image: null,
        error: `Failed to upload thumbnail: ${thumbnailError.message}`,
      };
    }

    onProgress?.(80);

    const {
      data: { publicUrl: thumbnailUrl },
    } = supabase.storage.from("thumbnails").getPublicUrl(thumbnailFilename);

    const {
      data: { publicUrl: originalUrl },
    } = supabase.storage.from("images").getPublicUrl(originalFilename);

    const { data: imageData, error: dbError } = await supabase
      .from("images")
      .insert({
        user_id: userId,
        filename: file.name,
        original_path: originalFilename,
        thumbnail_path: thumbnailFilename,
      })
      .select()
      .single();

    if (dbError || !imageData) {
      // Clean up uploaded files
      await supabase.storage.from("images").remove([originalFilename]);
      await supabase.storage.from("thumbnails").remove([thumbnailFilename]);
      return {
        image: null,
        error: `Failed to save image record: ${dbError?.message || "Unknown error"}`,
      };
    }

    await supabase.from("image_metadata").insert({
      image_id: imageData.id,
      user_id: userId,
      ai_processing_status: "pending",
      tags: [],
      colors: [],
      description: null,
    });

    onProgress?.(100);

    if (imageData) {
      triggerAIProcessing(imageData.id).catch(() => {
      });
    }

    return {
      image: imageData as Image,
      error: null,
    };
  } catch (error) {
    return {
      image: null,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

/**
 * Uploads multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  userId: string,
  onProgress?: (progress: UploadProgress[]) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const progress: UploadProgress[] = files.map((file) => ({
    filename: file.name,
    progress: 0,
    status: "uploading" as const,
  }));

  onProgress?.(progress);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    progress[i].status = "uploading";

    const result = await uploadImage(file, userId, (fileProgress) => {
      progress[i].progress = fileProgress;
      onProgress?.([...progress]); // Create new array reference
    });

    if (result.error) {
      progress[i].status = "error";
      progress[i].error = result.error;
    } else {
      progress[i].status = "completed";
      progress[i].progress = 100;
    }

    results.push(result);
    onProgress?.([...progress]); // Create new array reference
  }

  return results;
}

/**
 * Deletes an image and its thumbnail
 */
export async function deleteImage(
  imageId: number,
  originalPath: string,
  thumbnailPath: string
): Promise<{ error: string | null }> {
  try {
    const supabase = createSupabaseClient();

    // Delete from storage
    const [originalError, thumbnailError] = await Promise.all([
      supabase.storage.from("images").remove([originalPath]),
      supabase.storage.from("thumbnails").remove([thumbnailPath]),
    ]);

    if (originalError.error || thumbnailError.error) {
      return {
        error: "Failed to delete image files from storage",
      };
    }

    const { error: dbError } = await supabase
      .from("images")
      .delete()
      .eq("id", imageId);

    if (dbError) {
      return {
        error: `Failed to delete image record: ${dbError.message}`,
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

