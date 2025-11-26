"use client";

import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { ThemeToggle } from "@/components/shared/theme-toggle";

/**
 * Signup page content component (Client Component)
 * No useEffect - uses AuthRedirect component for redirects
 */
export function SignupPageContent() {
  return (
    <AuthRedirect redirectTo="/dashboard">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <AuthFormWrapper
        title="Create an Account"
        description="Sign up to start uploading and managing your images"
      >
        <SignupForm />
      </AuthFormWrapper>
    </AuthRedirect>
  );
}
