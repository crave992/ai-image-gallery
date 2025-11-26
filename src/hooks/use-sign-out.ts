import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/lib/client/auth-service";

interface UseSignOutOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook for signing out the current user
 * @param options - Callback options for success and error handling
 * @returns Mutation object with sign out functionality
 */
export function useSignOut(options?: UseSignOutOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear auth query data and all queries
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear();
      options?.onSuccess?.();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      options?.onError?.(errorMessage);
    },
  });
}

