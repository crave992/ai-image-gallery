import { createSupabaseServerClient } from "./supabase-server";

/**
 * Tests the Supabase connection
 * Useful for debugging and verifying environment variables are set correctly
 * 
 * @returns Object with connection status and error message if any
 */
export async function testSupabaseConnection() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Test connection by getting the current user (will be null if not authenticated, but connection should work)
    const { data, error } = await supabase.auth.getUser();

    if (error && error.message.includes("Invalid API key")) {
      return {
        success: false,
        error: "Invalid Supabase API key. Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
      };
    }

    if (error && error.message.includes("Invalid URL")) {
      return {
        success: false,
        error: "Invalid Supabase URL. Please check your NEXT_PUBLIC_SUPABASE_URL in .env.local",
      };
    }

    // If we get here, connection is working (even if user is not authenticated)
    return {
      success: true,
      message: "Supabase connection successful",
      authenticated: !!data.user,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Missing Supabase environment variables")) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: `Connection error: ${error.message}`,
      };
    }
    return {
      success: false,
      error: "Unknown error occurred while testing connection",
    };
  }
}

