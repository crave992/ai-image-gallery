import type { User } from "@/types";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: User;
  children?: ReactNode;
}

/**
 * Server Component: Dashboard header with user info
 * Pure presentational component - no interactivity
 */
export function DashboardHeader({ user, children }: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b bg-card sticky top-0 z-40",
        "px-4 py-3 sm:px-6 sm:py-4"
      )}
    >
      <div className={cn("flex items-center justify-between gap-3")}>
        <div className="flex-1 min-w-0">
          <h1 className={cn(theme.text.heading.h2, "truncate")}>Dashboard</h1>
          <p
            className={cn(
              theme.text.muted.base,
              "mt-0.5 truncate text-xs sm:text-sm"
            )}
          >
            Welcome back, {user.email}
          </p>
        </div>
        <div className={cn("flex items-center gap-2 flex-shrink-0")}>
          <ThemeToggle />
          {children && <div className="flex items-center">{children}</div>}
        </div>
      </div>
    </div>
  );
}
