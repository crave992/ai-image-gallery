import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteImage } from "@/lib/client/image-service";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-utils";

interface ImageToDelete {
  imageId: number;
  originalPath: string;
  thumbnailPath: string;
}

interface UseDeleteMultipleImagesOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook for deleting multiple images
 */
export function useDeleteMultipleImages(options?: UseDeleteMultipleImagesOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (images: ImageToDelete[]) => {
      const results = await Promise.allSettled(
        images.map(({ imageId, originalPath, thumbnailPath }) =>
          deleteImage(imageId, originalPath, thumbnailPath)
        )
      );

      const errors = results
        .map((result, index) => {
          if (result.status === "rejected") {
            return images[index].imageId;
          }
          if (result.value.error) {
            return images[index].imageId;
          }
          return null;
        })
        .filter((id): id is number => id !== null);

      return { errors, successCount: images.length - errors.length };
    },
    onSuccess: (data) => {
      // Invalidate images query to refetch
      queryClient.invalidateQueries({ queryKey: ["images"] });
      
      if (data.errors.length === 0) {
        showSuccessToast(
          "Images Deleted",
          `${data.successCount} image${data.successCount !== 1 ? "s" : ""} deleted successfully.`
        );
      } else {
        showErrorToast(
          "Partial Delete",
          `${data.successCount} deleted, ${data.errors.length} failed.`
        );
      }
      options?.onSuccess?.();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      showErrorToast("Delete Failed", errorMessage);
      options?.onError?.(errorMessage);
    },
  });
}

