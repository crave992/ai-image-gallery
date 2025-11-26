import { cn } from "@/lib/utils";

interface ImageGridSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Server Component: Skeleton loader for image grid
 * Shows placeholder cards while images are loading
 */
export function ImageGridSkeleton({
  count = 12,
  className,
}: ImageGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ImageCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Server Component: Skeleton loader for individual image card
 */
function ImageCardSkeleton() {
  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden bg-muted border border-border animate-pulse">
      <div className="w-full h-full bg-gradient-to-br from-muted via-muted/50 to-muted" />
    </div>
  );
}
