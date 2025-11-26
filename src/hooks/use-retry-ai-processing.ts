import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorToast, showSuccessToast } from "@/lib/shared/toast-utils";

interface RetryAIProcessingOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to retry AI processing for an image
 */
export function useRetryAIProcessing(options?: RetryAIProcessingOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: number) => {
      const response = await fetch("/api/ai/process-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process image");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate images query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["images"] });
      showSuccessToast("AI Processing Restarted", "Image analysis has been restarted successfully.");
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      showErrorToast(
        "Failed to Retry AI Processing",
        error.message || "An error occurred while retrying AI processing."
      );
      options?.onError?.(error);
    },
  });
}

