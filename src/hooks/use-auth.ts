import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types";
import { getCurrentUser } from "@/lib/client/auth-service";

/**
 * Hook to get the current authenticated user
 * @returns Query result with user data, loading state, and error
 */
export function useAuth() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async (): Promise<User | null> => {
      const response = await getCurrentUser();
      if (response.error) {
        return null;
      }
      return response.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

