"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import type { ImageWithMetadata } from "@/types";
import { createSupabaseClient } from "@/lib/client/supabase-client";
import { ImageDialog } from "@/components/gallery/image-dialog";
import { ImageGridSkeleton } from "@/components/shared/skeletons/image-grid-skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  images: ImageWithMetadata[];
  isLoading?: boolean;
  selectedImageId?: number | null;
  onImageClick?: (image: ImageWithMetadata | null) => void;
  onFindSimilar?: (imageId: number) => void;
  onColorFilter?: (color: string) => void;
  selectedImageIds?: Set<number>;
  onSelectionChange?: (selectedIds: Set<number>) => void;
}

/**
 * Image grid component with animations
 * No useEffect - uses useMemo for thumbnail URLs and React Query for original URLs
 */
export function ImageGrid({
  images,
  isLoading = false,
  selectedImageId,
  onImageClick,
  onFindSimilar,
  onColorFilter,
  selectedImageIds = new Set(),
  onSelectionChange,
}: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageWithMetadata | null>(
    null
  );

  const handleImageClick = useCallback((image: ImageWithMetadata) => {
    setSelectedImage(image);
    onImageClick?.(image);
  }, [onImageClick]);

  const handleCheckboxChange = useCallback((imageId: number, checked: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelection = new Set(selectedImageIds);
    if (checked) {
      newSelection.add(imageId);
    } else {
      newSelection.delete(imageId);
    }
    onSelectionChange(newSelection);
  }, [selectedImageIds, onSelectionChange]);

  const handleCardClick = useCallback((image: ImageWithMetadata, event: React.MouseEvent) => {
    // If clicking on checkbox, don't open dialog
    if ((event.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    handleImageClick(image);
  }, [handleImageClick]);

  // Get thumbnail URLs (public, computed synchronously with useMemo)
  const thumbnailUrls = useMemo(() => {
    const supabase = createSupabaseClient();
    const urls: Record<number, string> = {};

    images.forEach((image) => {
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(image.thumbnail_path);
      urls[image.id] = publicUrl;
    });

    return urls;
  }, [images]);


  if (isLoading) {
    return <ImageGridSkeleton count={12} />;
  }

  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <ImageIcon
          className={cn("h-12 w-12 text-muted-foreground mx-auto mb-4")}
        />
        <p className={cn(theme.text.body.base, "mb-2")}>No images yet</p>
        <p className={theme.text.muted.base}>
          Start by uploading your first image to get AI-generated tags and
          descriptions
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        layout
        className={cn("grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4", "select-none")}
        style={{
          caretColor: "transparent",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        tabIndex={-1}
      >
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative",
                theme.aspect.square,
                "rounded-lg overflow-hidden bg-muted border",
                theme.transition.colors,
                "cursor-pointer",
                selectedImageId === image.id || selectedImageIds.has(image.id)
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/50"
              )}
              onClick={(e) => handleCardClick(image, e)}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedImageIds.has(image.id)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange(image.id, checked === true)
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="bg-background/90 backdrop-blur-sm"
                />
              </div>

              <div className="relative w-full h-full">
                {thumbnailUrls[image.id] ? (
                  <img
                    src={thumbnailUrls[image.id]}
                    alt={image.filename}
                    className={cn(
                      "w-full h-full object-cover",
                      selectedImageIds.has(image.id) && "opacity-75"
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full bg-muted animate-pulse",
                      theme.flex.center
                    )}
                  >
                    <ImageIcon
                      className={cn("h-8 w-8 text-muted-foreground")}
                    />
                  </div>
                )}
              </div>

              {/* Selection overlay */}
              {selectedImageIds.has(image.id) && (
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary" />
              )}

              {/* Processing badge */}
              {image.metadata?.ai_processing_status === "processing" && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  Processing...
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Image detail dialog */}
      <ImageDialog
        image={selectedImage}
        onClose={() => {
          setSelectedImage(null);
          onImageClick?.(null);
        }}
        onFindSimilar={onFindSimilar}
        onColorFilter={onColorFilter}
      />
    </>
  );
}
