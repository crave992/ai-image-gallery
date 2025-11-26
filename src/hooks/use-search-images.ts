"use client";

import { useMemo } from "react";
import { useImages } from "./use-images";
import { filterImages } from "@/lib/shared/search-utils";
import type { SearchFilters } from "@/types";
import type { ImageWithMetadata } from "@/types";

/**
 * Hook to search and filter images
 * @param filters - Search filters (text query, color filter, similar to image)
 * @returns Filtered images and loading state
 */
export function useSearchImages(filters: SearchFilters) {
  const { data: allImages, isLoading, error } = useImages();

  const filteredImages = useMemo(() => {
    if (!allImages) return [];

    // If no filters, return all images
    if (
      !filters.textQuery &&
      !filters.colorFilter &&
      !filters.similarToImageId
    ) {
      return allImages;
    }

    return filterImages(allImages, filters);
  }, [allImages, filters.textQuery, filters.colorFilter, filters.similarToImageId]);

  return {
    images: filteredImages,
    isLoading,
    error,
    totalCount: allImages?.length || 0,
    filteredCount: filteredImages.length,
  };
}

