import { cn } from "@/lib/utils";

interface SearchBarSkeletonProps {
  className?: string;
}

/**
 * Server Component: Skeleton loader for search bar
 */
export function SearchBarSkeleton({ className }: SearchBarSkeletonProps) {
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
    </div>
  );
}
