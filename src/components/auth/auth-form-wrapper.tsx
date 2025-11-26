import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface AuthFormWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Server Component: Reusable wrapper for authentication forms
 * Provides consistent styling and layout
 * No client-side interactivity needed
 */
export function AuthFormWrapper({
  title,
  description,
  children,
}: AuthFormWrapperProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background",
        theme.container.base
      )}
    >
      <Card className={cn("w-full max-w-md bg-card")}>
        <CardHeader className={theme.card.header}>
          <CardTitle className={cn(theme.text.heading.h2, "text-center")}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-center">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
