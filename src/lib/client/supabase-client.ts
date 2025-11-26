"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for client-side operations
 * This should only be used in Client Components
 */
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

