import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client using the service role key
 * This client bypasses Row Level Security (RLS) and should ONLY be used server-side
 * Never expose the service role key to the client
 * 
 * Use cases:
 * - Admin operations
 * - Background jobs
 * - Server-side data operations that need to bypass RLS
 * 
 * @returns Supabase admin client instance
 * @throws Error if service role key is missing
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
        "This is required for admin operations. " +
        "Get it from: https://app.supabase.com/project/_/settings/api"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

