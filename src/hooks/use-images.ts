import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient } from "@/lib/client/supabase-client";
import type { Image, ImageWithMetadata } from "@/types";

/**
 * Hook to fetch user's images
 */
export function useImages() {
  return useQuery({
    queryKey: ["images"],
    queryFn: async (): Promise<ImageWithMetadata[]> => {
      const supabase = createSupabaseClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      // Fetch images first
      const { data: images, error: imagesError } = await supabase
        .from("images")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (imagesError) {
        throw new Error(`Failed to fetch images: ${imagesError.message}`);
      }

      if (!images || images.length === 0) {
        return [];
      }

      // Fetch metadata for all images separately
      // This avoids RLS issues with nested selects
      const imageIds = images.map((img) => img.id);
      const { data: metadataList } = await supabase
        .from("image_metadata")
        .select("*")
        .in("image_id", imageIds)
        .eq("user_id", user.id);

      // Create a map of image_id -> metadata for quick lookup
      const metadataMap = new Map(
        (metadataList || []).map((meta) => [meta.image_id, meta])
      );

      // Transform data to include metadata
      return images.map((img) => ({
        ...img,
        metadata: metadataMap.get(img.id),
      })) as ImageWithMetadata[];
    },
    staleTime: 2 * 1000, // 2 seconds - refetch more frequently to catch AI processing updates
    refetchInterval: (query) => {
      // Auto-refetch if any image is processing or pending
      const images = query.state.data || [];
      const hasProcessing = images.some(
        (img) => {
          const status = img.metadata?.ai_processing_status;
          return status === "processing" || status === "pending";
        }
      );
      return hasProcessing ? 2000 : false; // Refetch every 2 seconds if processing
    },
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch when component mounts
  });
}
