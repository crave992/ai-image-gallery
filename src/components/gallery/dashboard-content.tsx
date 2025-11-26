"use client";

import { useState, useMemo } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import {
  useImages,
  useUploadImage,
  useSignOut,
  useSearchImages,
  useDeleteMultipleImages,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import {
  LogOut,
  Upload,
  Palette,
  Trash2,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/components/gallery/dashboard-header";
import { DashboardSectionHeader } from "@/components/gallery/dashboard-section-header";
import { ImageGrid } from "@/components/gallery/image-grid";
import { SearchBar } from "@/components/gallery/search-bar";
import { ColorFilterDialog } from "@/components/gallery/color-filter-dialog";
import { UploadImagesDialog } from "@/components/upload/upload-images-dialog";
import { UploadProgressComponent } from "@/components/upload/upload-progress";
import { SearchBarSkeleton, Pagination } from "@/components/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UploadProgress } from "@/lib/client/image-service";
import type { SearchFilters } from "@/types";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { exportAsJSON } from "@/lib/shared/download-utils";
import { showErrorToast } from "@/lib/shared/toast-utils";

interface DashboardContentProps {
  user: User;
}

/**
 * Dashboard content component
 * Shows user's gallery and provides logout functionality
 */
export function DashboardContent({ user }: DashboardContentProps) {
  const { isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const { data: allImages } = useImages();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [colorFilterDialogOpen, setColorFilterDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [similarToImageId, setSimilarToImageId] = useState<number | undefined>(
    undefined
  );
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<number>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<
    Array<{
      imageId: number;
      originalPath: string;
      thumbnailPath: string;
    }>
  >([]);

  const searchFilters: SearchFilters = useMemo(
    () => ({
      textQuery: searchQuery || undefined,
      colorFilter: selectedColor || undefined,
      similarToImageId: similarToImageId,
    }),
    [searchQuery, selectedColor, similarToImageId]
  );

  const {
    images: filteredImages,
    isLoading: imagesLoading,
    filteredCount,
    totalCount,
  } = useSearchImages(searchFilters);

  const availableColors = useMemo(() => {
    if (!allImages) return [];
    const colorSet = new Set<string>();
    allImages.forEach((image) => {
      image.metadata?.colors?.forEach((color) => colorSet.add(color));
    });
    return Array.from(colorSet).sort();
  }, [allImages]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setSelectedImageIds(new Set());
  };

  const handleFindSimilar = (imageId: number) => {
    setSimilarToImageId(imageId);
    setSearchQuery("");
    setSelectedColor(null);
    setSelectedImage(imageId);
    setCurrentPage(1);
    setSelectedImageIds(new Set());
  };

  const handleColorClick = (color: string | null) => {
    setSelectedColor(color);
    setSimilarToImageId(undefined);
    setSelectedImage(null);
    setCurrentPage(1);
    setSelectedImageIds(new Set());
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedColor(null);
    setSimilarToImageId(undefined);
    setSelectedImage(null);
    setCurrentPage(1);
    setSelectedImageIds(new Set());
  };

  const totalPages = Math.ceil((filteredImages?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedImages = filteredImages?.slice(startIndex, endIndex) || [];

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedColor, similarToImageId]);

  const signOutMutation = useSignOut({
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
  });

  const uploadImageMutation = useUploadImage({
    onSuccess: () => {
      setUploadProgress([]);
    },
    onProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const handleSignOut = async () => {
    await signOutMutation.mutateAsync();
  };

  const handleUpload = (files: File[]) => {
    setUploadProgress(
      files.map((file) => ({
        filename: file.name,
        progress: 0,
        status: "uploading" as const,
      }))
    );

    uploadImageMutation.mutate({
      files,
      userId: user.id,
    });
  };

  const isLoading = signOutMutation.isPending || authLoading;

  const deleteMultipleMutation = useDeleteMultipleImages({
    onSuccess: () => {
      setSelectedImageIds(new Set());
    },
  });

  const handleDeleteSelected = () => {
    if (selectedImageIds.size === 0) return;

    const toDelete =
      allImages
        ?.filter((img) => selectedImageIds.has(img.id))
        .map((img) => ({
          imageId: img.id,
          originalPath: img.original_path,
          thumbnailPath: img.thumbnail_path,
        })) || [];

    if (toDelete.length === 0) return;

    setImagesToDelete(toDelete);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (imagesToDelete.length > 0) {
      deleteMultipleMutation.mutate(imagesToDelete);
      setShowDeleteDialog(false);
      setImagesToDelete([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedImageIds.size === filteredImages.length) {
      setSelectedImageIds(new Set());
    } else {
      setSelectedImageIds(new Set(filteredImages.map((img) => img.id)));
    }
  };

  return (
    <div className={cn("w-full px-4 py-4 sm:px-6 sm:py-6")}>
      <DashboardHeader user={user}>
        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={isLoading}
          size="sm"
          className={cn("h-9 px-3 sm:px-4", "text-xs sm:text-sm")}
        >
          <LogOut className={cn("h-4 w-4")} />
          Sign Out
        </Button>
      </DashboardHeader>

      <Card className={cn("mt-4 bg-card")}>
        <CardContent>
          <div className="space-y-4">
            {imagesLoading ? (
              <SearchBarSkeleton />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="flex-1 w-full">
                    <SearchBar
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search by tags or description..."
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setColorFilterDialogOpen(true)}
                      size="sm"
                      className={cn(
                        "h-9 px-3 sm:px-4 flex-1 sm:flex-initial",
                        "text-xs sm:text-sm"
                      )}
                    >
                      <Palette className="h-4 w-4" />
                      Filter by Color
                      {selectedColor && (
                        <span
                          className="ml-2 w-3 h-3 sm:w-4 sm:h-4 rounded border border-border flex-shrink-0"
                          style={{ backgroundColor: selectedColor }}
                          title={selectedColor}
                        />
                      )}
                    </Button>
                    {(searchQuery || selectedColor || similarToImageId) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className={cn(
                          "h-9 px-3 sm:px-4 flex-1 sm:flex-initial",
                          "text-xs sm:text-sm"
                        )}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
                {(searchQuery || selectedColor || similarToImageId) && (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Showing {filteredCount} of {totalCount} images
                    </div>
                    {filteredImages && filteredImages.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExportDialog(true)}
                        className={cn(
                          "h-8 px-3 text-xs sm:text-sm",
                          "flex items-center gap-2"
                        )}
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Export JSON</span>
                        <span className="sm:hidden">Export</span>
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 bg-card">
        <DashboardSectionHeader
          title="Your Gallery"
          description={
            similarToImageId
              ? "Similar images"
              : `${filteredCount} image${
                  filteredCount !== 1 ? "s" : ""
                } in your collection${
                  totalPages > 1
                    ? ` (Page ${currentPage} of ${totalPages})`
                    : ""
                }`
          }
          action={
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(true)}
              disabled={uploadImageMutation.isPending}
              size="sm"
              className={cn(
                "h-9 px-3 sm:px-4 flex-1 sm:flex-initial",
                "text-xs sm:text-sm"
              )}
            >
              <Upload className="h-4 w-4" />
              Upload Images
            </Button>
          }
        />
        <CardContent>
          {selectedImageIds.size === 0 && (
            <div className="mb-4 p-2 sm:p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground">
                💡 Select images using checkboxes to delete them
              </p>
            </div>
          )}
          {selectedImageIds.size > 0 && (
            <div
              className={cn(
                "mb-4 p-3 bg-muted rounded-lg border",
                theme.flex.between
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {selectedImageIds.size} image
                  {selectedImageIds.size !== 1 ? "s" : ""} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-7 px-2 text-xs"
                >
                  {selectedImageIds.size === filteredImages.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={
                  deleteMultipleMutation.isPending ||
                  selectedImageIds.size === 0
                }
                className={cn("h-9 px-4", "text-xs sm:text-sm")}
              >
                {deleteMultipleMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </>
                )}
              </Button>
            </div>
          )}
          <ImageGrid
            images={paginatedImages}
            isLoading={imagesLoading}
            selectedImageId={selectedImage}
            onImageClick={(image) => setSelectedImage(image?.id || null)}
            onFindSimilar={handleFindSimilar}
            onColorFilter={handleColorClick}
            selectedImageIds={selectedImageIds}
            onSelectionChange={setSelectedImageIds}
          />
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <UploadImagesDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
        isUploading={uploadImageMutation.isPending}
      />

      <ColorFilterDialog
        open={colorFilterDialogOpen}
        onOpenChange={setColorFilterDialogOpen}
        selectedColor={selectedColor}
        onColorSelect={handleColorClick}
        availableColors={availableColors}
      />

      <UploadProgressComponent
        progress={uploadProgress}
        onClose={() => setUploadProgress([])}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {imagesToDelete.length} image
              {imagesToDelete.length !== 1 ? "s" : ""}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Search Results</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to export {filteredCount} image
              {filteredCount !== 1 ? "s" : ""} as JSON? This will download a
              file containing all search results and metadata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowExportDialog(false);
                try {
                  const exportData = filteredImages.map((img) => ({
                    id: img.id,
                    filename: img.filename,
                    uploaded_at: img.uploaded_at,
                    metadata: img.metadata
                      ? {
                          description: img.metadata.description,
                          tags: img.metadata.tags,
                          colors: img.metadata.colors,
                          ai_processing_status:
                            img.metadata.ai_processing_status,
                        }
                      : null,
                  }));
                  await exportAsJSON(
                    {
                      searchQuery: searchQuery || null,
                      colorFilter: selectedColor || null,
                      similarToImageId: similarToImageId || null,
                      totalCount,
                      filteredCount,
                      exportedAt: new Date().toISOString(),
                      images: exportData,
                    },
                    `image-gallery-export-${
                      new Date().toISOString().split("T")[0]
                    }.json`
                  );
                } catch (error) {
                  showErrorToast(
                    "Export Failed",
                    "Failed to export search results. Please try again."
                  );
                }
              }}
            >
              Export
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
