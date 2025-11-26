import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-utils";

interface UpdateImageMetadataParams {
  imageId: number;
  tags?: string[];
  description?: string;
  colors?: string[];
}

interface UseUpdateImageMetadataOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook for updating image metadata (tags, description, colors)
 */
export function useUpdateImageMetadata(
  options?: UseUpdateImageMetadataOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageId,
      tags,
      description,
      colors,
    }: UpdateImageMetadataParams) => {
      const response = await fetch(`/api/images/${imageId}/metadata`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags, description, colors }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update metadata");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      showSuccessToast("Metadata Updated", "Image metadata has been updated successfully.");
      options?.onSuccess?.();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      showErrorToast("Update Failed", errorMessage);
      options?.onError?.(errorMessage);
    },
  });
}

