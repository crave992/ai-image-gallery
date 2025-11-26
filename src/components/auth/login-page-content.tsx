"use client";

import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Login page content component (Client Component)
 * No useEffect - uses AuthRedirect component for redirects
 */
export function LoginPageContent() {
  return (
    <AuthRedirect redirectTo="/dashboard">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <AuthFormWrapper
        title="AI Image Gallery"
        description="Upload images, get AI-generated tags and descriptions"
      >
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </AuthFormWrapper>
    </AuthRedirect>
  );
}
