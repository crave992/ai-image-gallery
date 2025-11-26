import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient } from "@/lib/client/supabase-client";

interface UseImageUrlOptions {
  thumbnailPath: string;
  originalPath: string;
  enabled?: boolean;
}

/**
 * Hook to get image URLs (thumbnail and original)
 * Uses React Query for caching and automatic refetching
 */
export function useImageUrl({
  thumbnailPath,
  originalPath,
  enabled = true,
}: UseImageUrlOptions) {
  return useQuery({
    queryKey: ["image-url", thumbnailPath, originalPath],
    queryFn: async () => {
      const supabase = createSupabaseClient();

      // Thumbnails are public
      const {
        data: { publicUrl: thumbnailUrl },
      } = supabase.storage.from("thumbnails").getPublicUrl(thumbnailPath);

      // Original images need signed URLs (private bucket)
      const {
        data: signedUrlData,
        error,
      } = await supabase.storage
        .from("images")
        .createSignedUrl(originalPath, 3600); // 1 hour expiry

      let originalUrl: string;
      if (!error && signedUrlData?.signedUrl) {
        originalUrl = signedUrlData.signedUrl;
      } else {
        // Fallback to public URL if signed URL fails
        const {
          data: { publicUrl: fallbackUrl },
        } = supabase.storage.from("images").getPublicUrl(originalPath);
        originalUrl = fallbackUrl;
      }

      return {
        thumbnail: thumbnailUrl,
        original: originalUrl,
      };
    },
    enabled,
    staleTime: 50 * 60 * 1000, // 50 minutes (less than 1 hour expiry)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

