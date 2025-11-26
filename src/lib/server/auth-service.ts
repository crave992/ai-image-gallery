import { createSupabaseServerClient } from "./supabase-server";
import type { User } from "@/types";

/**
 * Server-side authentication service
 * Use this in Server Components and Server Actions
 */

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: error?.message || "Not authenticated" };
    }

    return {
      user: {
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

