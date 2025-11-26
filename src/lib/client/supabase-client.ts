"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Gets Supabase environment variables with validation
 */
function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Creates a Supabase client for client-side operations
 * This should only be used in Client Components
 * 
 * @returns Supabase client instance
 * @throws Error if environment variables are missing
 */
export function createSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

