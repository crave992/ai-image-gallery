import { cn } from "@/lib/utils";

interface ImageDialogSkeletonProps {
  className?: string;
}

/**
 * Server Component: Skeleton loader for image dialog
 * Shows placeholder while image and metadata are loading
 */
export function ImageDialogSkeleton({ className }: ImageDialogSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Image skeleton */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted animate-pulse">
        <div className="w-full h-full bg-gradient-to-br from-muted via-muted/50 to-muted" />
      </div>

      {/* Metadata skeletons */}
      <div className="space-y-4">
        {/* Description skeleton */}
        <div>
          <div className="h-4 w-32 bg-muted rounded mb-2 animate-pulse" />
          <div className="h-20 w-full bg-muted/50 rounded-lg border animate-pulse" />
        </div>

        {/* Tags skeleton */}
        <div>
          <div className="h-4 w-24 bg-muted rounded mb-2 animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-16 bg-muted rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Colors skeleton */}
        <div>
          <div className="h-4 w-28 bg-muted rounded mb-2 animate-pulse" />
          <div className="flex gap-3 items-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-lg border-2 border-border bg-muted animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
