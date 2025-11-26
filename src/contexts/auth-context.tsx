"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useAuth as useAuthQuery,
  useSignOut as useSignOutMutation,
} from "@/hooks";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider component
 * Provides authentication state and methods to child components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the reusable useAuth hook
  const { data: user, isLoading, refetch } = useAuthQuery();

  // Use the reusable useSignOut hook
  const signOutMutation = useSignOutMutation();

  const handleSignOut = async () => {
    await signOutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    refetch: () => {
      refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

// Export useAuth as alias for backward compatibility
export { useAuthContext as useAuth };
