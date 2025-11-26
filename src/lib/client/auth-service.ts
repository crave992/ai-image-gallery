"use client";

import { createSupabaseClient } from "./supabase-client";
import type { User } from "@/types";
import type { LoginFormData, SignupFormData } from "@/lib/schemas/auth";

/**
 * Client-side authentication service
 * Use this in Client Components
 */

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface SignupResponse {
  message: string | null;
  error: string | null;
}

/**
 * Sign in with email and password
 */
export async function signIn(
  credentials: LoginFormData
): Promise<AuthResponse> {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "Login failed" };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
        created_at: data.user.created_at,
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
 * Sign up with email and password
 * Handles both email confirmation required and auto-confirm scenarios
 */
export async function signUp(
  credentials: SignupFormData
): Promise<SignupResponse> {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          full_name: `${credentials.firstName} ${credentials.lastName}`,
          phone: credentials.phone || null,
        },
      },
    });

    if (error) {
      return { message: null, error: error.message };
    }

    if (!data.user) {
      return { message: null, error: "Signup failed" };
    }

    // Check if email confirmation is required
    // If user has a session, email confirmation is disabled (auto-confirm)
    // If user doesn't have a session, email confirmation is required
    if (data.session) {
      // Auto-confirm enabled - user is automatically logged in
      return {
        message: "Account created successfully! You have been automatically signed in.",
        error: null,
      };
    } else {
      // Email confirmation required
      return {
        message:
          "Account created successfully! Please check your email to verify your account before signing in.",
        error: null,
      };
    }
  } catch (error) {
    return {
      message: null,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const supabase = createSupabaseClient();
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

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const supabase = createSupabaseClient();
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

