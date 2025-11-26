"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useMemo } from "react";

interface AuthRedirectProps {
  redirectTo: string;
  children: React.ReactNode;
}

/**
 * Auth redirect component
 * Redirects authenticated users without using useEffect
 * Uses useMemo to trigger redirect based on auth state changes
 */
export function AuthRedirect({ redirectTo, children }: AuthRedirectProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  // Trigger redirect when authenticated state changes
  // useMemo runs during render, avoiding useEffect
  useMemo(() => {
    if (!isLoading && isAuthenticated) {
      // Use requestAnimationFrame to ensure redirect happens after render
      requestAnimationFrame(() => {
        router.push(redirectTo);
      });
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  // Show redirecting state if authenticated
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  // Render children if not authenticated
  return <>{children}</>;
}
