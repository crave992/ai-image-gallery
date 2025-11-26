import { cn } from "@/lib/utils";

interface ColorFilterSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Server Component: Skeleton loader for color filter
 */
export function ColorFilterSkeleton({
  count = 8,
  className,
}: ColorFilterSkeletonProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-lg border-2 border-border bg-muted animate-pulse"
        />
      ))}
    </div>
  );
}
