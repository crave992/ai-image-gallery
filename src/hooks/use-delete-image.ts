import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteImage } from "@/lib/client/image-service";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-utils";

interface UseDeleteImageOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook for deleting images
 */
export function useDeleteImage(options?: UseDeleteImageOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageId,
      originalPath,
      thumbnailPath,
    }: {
      imageId: number;
      originalPath: string;
      thumbnailPath: string;
    }) => deleteImage(imageId, originalPath, thumbnailPath),
    onSuccess: () => {
      // Invalidate images query to refetch
      queryClient.invalidateQueries({ queryKey: ["images"] });
      showSuccessToast("Image Deleted", "Image has been deleted successfully.");
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

