import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadImage, uploadMultipleImages, type UploadProgress } from "@/lib/client/image-service";
import type { Image } from "@/types";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-utils";

interface UseUploadImageOptions {
  onSuccess?: (images: Image[]) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: UploadProgress[]) => void;
}

/**
 * Hook for uploading images
 */
export function useUploadImage(options?: UseUploadImageOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
      userId,
    }: {
      files: File[];
      userId: string;
    }) => {
      if (files.length === 1) {
        const result = await uploadImage(files[0], userId);
        return [result];
      }
      return uploadMultipleImages(files, userId, options?.onProgress);
    },
    onSuccess: (results) => {
      const successfulImages = results
        .filter((r) => r.image && !r.error)
        .map((r) => r.image!);

      if (successfulImages.length > 0) {
        // Invalidate images query to refetch
        queryClient.invalidateQueries({ queryKey: ["images"] });
        showSuccessToast(
          "Upload Successful",
          `${successfulImages.length} image${successfulImages.length > 1 ? "s" : ""} uploaded successfully.`
        );
        options?.onSuccess?.(successfulImages);
      }

      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        const errorMessage = errors[0].error || "Upload failed";
        showErrorToast("Upload Failed", errorMessage);
        options?.onError?.(errorMessage);
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      showErrorToast("Upload Failed", errorMessage);
      options?.onError?.(errorMessage);
    },
  });
}

