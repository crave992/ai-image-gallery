import type { Metadata } from "next";
import { SignupPageContent } from "@/components/auth/signup-page-content";

export const metadata: Metadata = {
  title: "Sign Up | AI Image Gallery",
  description: "Create an account to start uploading and managing your images",
};

/**
 * Signup page (Server Component)
 * Renders the client-side signup page content
 */
export default function SignupPage() {
  return <SignupPageContent />;
}
