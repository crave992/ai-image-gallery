import type { Metadata } from "next";
import { LoginPageContent } from "@/components/auth/login-page-content";

export const metadata: Metadata = {
  title: "Sign In | AI Image Gallery",
  description: "Sign in to your AI Image Gallery account",
};

/**
 * Login page (Server Component)
 * Renders the client-side login page content
 */
export default function LoginPage() {
  return <LoginPageContent />;
}
