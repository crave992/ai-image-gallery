import { createSupabaseServerClient } from "@/lib/server/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth callback route handler for email confirmation
 * Handles the redirect from email confirmation links
 * This is a server-side route handler
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (token_hash && type) {
    try {
      const supabase = await createSupabaseServerClient();

      const { error } = await supabase.auth.verifyOtp({
        type: type as "email" | "signup" | "recovery" | "invite",
        token_hash,
      });

      if (!error) {
        // Email confirmed successfully - redirect to dashboard
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
        const redirectUrl = new URL(next, appUrl);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      // Silently handle error
    }
  }

  // If there's an error or missing params, redirect to login with error
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const loginUrl = new URL("/login", appUrl);
  loginUrl.searchParams.set(
    "error",
    "Email verification failed. Please try again."
  );
  return NextResponse.redirect(loginUrl);
}

