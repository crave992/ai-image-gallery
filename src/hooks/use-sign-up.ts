import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SignupFormData } from "@/lib/schemas/auth";
import { signUp } from "@/lib/client/auth-service";

interface UseSignUpOptions {
  onSuccess?: (message: string, isAutoLogin: boolean) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for signing up a new user
 * @param options - Callback options for success and error handling
 * @returns Mutation object with sign up functionality
 */
export function useSignUp(options?: UseSignUpOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      if (data.error) {
        options?.onError?.(data.error);
        return;
      }

      if (data.message) {
        const isAutoLogin = data.message.includes("automatically signed in");
        
        if (isAutoLogin) {
          // Invalidate and refetch auth query if auto-login
          queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
        }
        
        options?.onSuccess?.(data.message, isAutoLogin);
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      options?.onError?.(errorMessage);
    },
  });
}

