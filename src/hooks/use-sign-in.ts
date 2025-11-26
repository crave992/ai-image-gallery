import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginFormData } from "@/lib/schemas/auth";
import { signIn } from "@/lib/client/auth-service";

interface UseSignInOptions {
  onSuccess?: (redirectTo?: string) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for signing in a user
 * @param options - Callback options for success and error handling
 * @returns Mutation object with sign in functionality
 */
export function useSignIn(options?: UseSignInOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (data, variables, context) => {
      if (data.error) {
        options?.onError?.(data.error);
        return;
      }

      if (data.user) {
        // Invalidate and refetch auth query
        queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
        options?.onSuccess?.();
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      options?.onError?.(errorMessage);
    },
  });
}

