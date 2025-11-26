"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  AlertCircle,
  Search,
  Download,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { ImageDialogSkeleton } from "@/components/shared/skeletons/image-dialog-skeleton";
import type { ImageWithMetadata } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { useImageUrl } from "@/hooks/use-image-url";
import { useRetryAIProcessing, useImages, useUpdateImageMetadata } from "@/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { downloadFile } from "@/lib/shared/download-utils";
import { Input } from "@/components/ui/input";
import { showErrorToast } from "@/lib/shared/toast-utils";

interface ImageDialogProps {
  image: ImageWithMetadata | null;
  onClose: () => void;
  onFindSimilar?: (imageId: number) => void;
  onColorFilter?: (color: string) => void;
}

/**
 * Image dialog component
 * Fetches signed URL on-demand when dialog opens
 */
export function ImageDialog({
  image,
  onClose,
  onFindSimilar,
  onColorFilter,
}: ImageDialogProps) {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: imageUrls,
    isLoading: loadingOriginal,
    error: urlError,
  } = useImageUrl({
    thumbnailPath: image?.thumbnail_path || "",
    originalPath: image?.original_path || "",
    enabled: !!image,
  });

  const { data: allImages, refetch: refetchImages } = useImages();

  const latestImage = useMemo(() => {
    if (!image || !allImages) return image;
    return allImages.find((img) => img.id === image.id) || image;
  }, [image, allImages]);

  useEffect(() => {
    if (image) {
      refetchImages();
    }
  }, [image?.id, refetchImages]);

  useEffect(() => {
    if (!image) return;

    const processingStatus = latestImage?.metadata?.ai_processing_status;
    const isProcessing =
      processingStatus === "processing" || processingStatus === "pending";

    if (isProcessing) {
      const interval = setInterval(() => {
        refetchImages();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [image, latestImage?.metadata?.ai_processing_status, refetchImages]);

  const retryAIMutation = useRetryAIProcessing({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });

  const updateMetadataMutation = useUpdateImageMetadata({
    onSuccess: () => {
      setIsEditingTags(false);
    },
  });

  const currentImage = useMemo(() => {
    if (!image) return null;
    return latestImage || image;
  }, [image, latestImage]);

  useEffect(() => {
    if (image && currentImage) {
      const tags = currentImage.metadata?.tags || [];
      setEditedTags([...tags]);
      setIsEditingTags(false);
    }
  }, [image?.id, currentImage?.metadata?.tags]);

  const handleDownloadClick = () => {
    setShowDownloadDialog(true);
  };

  const handleConfirmDownload = async () => {
    setShowDownloadDialog(false);
    if (imageUrls?.original && currentImage) {
      try {
        await downloadFile(imageUrls.original, currentImage.filename);
      } catch (error) {
        showErrorToast("Download Failed", "Failed to download image. Please try again.");
      }
    }
  };

  const handleStartEditTags = () => {
    if (currentImage) {
      setEditedTags([...(currentImage.metadata?.tags || [])]);
      setIsEditingTags(true);
    }
  };

  const handleCancelEditTags = () => {
    setIsEditingTags(false);
    setEditedTags([]);
  };

  const handleSaveTags = () => {
    if (currentImage) {
      updateMetadataMutation.mutate({
        imageId: currentImage.id,
        tags: editedTags.filter((tag) => tag.trim().length > 0),
      });
    }
  };

  const handleAddTag = () => {
    setEditedTags([...editedTags, ""]);
  };

  const handleRemoveTag = (index: number) => {
    setEditedTags(editedTags.filter((_, i) => i !== index));
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...editedTags];
    newTags[index] = value;
    setEditedTags(newTags);
  };

  if (!image || !currentImage) return null;

  const processingStatus = currentImage.metadata?.ai_processing_status;
  const isProcessing = processingStatus === "processing";
  const isFailed = processingStatus === "failed";
  const isCompleted = processingStatus === "completed";
  const isPending = processingStatus === "pending";
  const hasNoMetadata = !currentImage.metadata;

  const hasMetadata =
    currentImage.metadata &&
    (currentImage.metadata.description ||
      (currentImage.metadata.tags && currentImage.metadata.tags.length > 0) ||
      (currentImage.metadata.colors &&
        currentImage.metadata.colors.length > 0));

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(theme.dialog.content, "p-3 sm:p-6")}>
        <DialogHeader className="relative pr-10 sm:pr-12">
          <DialogTitle className="flex items-center justify-between flex-wrap gap-2">
            <span className="flex-1 min-w-0 truncate">{currentImage.filename}</span>
            <div className="flex items-center gap-2 flex-wrap">
              {imageUrls?.original && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadClick}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">AI Processing...</span>
                </div>
              )}
              {isFailed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => retryAIMutation.mutate(currentImage.id)}
                  disabled={retryAIMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      retryAIMutation.isPending ? "animate-spin" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">Retry AI</span>
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Uploaded on{" "}
            {new Date(currentImage.uploaded_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loadingOriginal || !imageUrls ? (
            <ImageDialogSkeleton />
          ) : (
            <>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                {urlError || imageLoadError ? (
                  <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-4">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-foreground text-center">
                      Failed to load image
                    </p>
                  </div>
                ) : (
                  <img
                    src={imageUrls.original}
                    alt={currentImage.filename}
                    className="w-full h-full object-contain"
                    onError={() => setImageLoadError(true)}
                    onLoad={() => setImageLoadError(false)}
                  />
                )}
              </div>

              {isProcessing && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertTitle>AI Analysis in Progress</AlertTitle>
                  <AlertDescription>
                    Analyzing image content, generating tags, description, and
                    extracting colors...
                  </AlertDescription>
                </Alert>
              )}

              {isFailed && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>AI Processing Failed</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      {currentImage.metadata?.description ||
                        "Failed to analyze image. Please check your GEMINI_API_KEY."}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryAIMutation.mutate(currentImage.id)}
                      disabled={retryAIMutation.isPending}
                      className="ml-4"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          retryAIMutation.isPending ? "animate-spin" : ""
                        }`}
                      />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {hasMetadata && currentImage.metadata && (
                <div className="space-y-4">
                  {currentImage.metadata.description && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-foreground">
                      AI Description
                    </h4>
                    <p className="text-sm text-foreground bg-muted p-3 rounded-lg border">
                      {currentImage.metadata.description}
                    </p>
                  </div>
                  )}

                  {currentImage.metadata.tags !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">
                          AI Tags ({isEditingTags ? editedTags.length : currentImage.metadata.tags.length})
                        </h4>
                        {!isEditingTags ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleStartEditTags}
                            className="h-7 px-2 text-xs"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEditTags}
                              disabled={updateMetadataMutation.isPending}
                              className="h-7 px-2 text-xs"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={handleSaveTags}
                              disabled={updateMetadataMutation.isPending}
                              className="h-7 px-2 text-xs"
                            >
                              {updateMetadataMutation.isPending ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3 mr-1" />
                              )}
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                      {isEditingTags ? (
                        <div className="space-y-2">
                          {editedTags.map((tag, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Input
                                value={tag}
                                onChange={(e) => handleTagChange(i, e.target.value)}
                                placeholder="Enter tag"
                                className="flex-1 text-sm"
                                disabled={updateMetadataMutation.isPending}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveTag(i)}
                                disabled={updateMetadataMutation.isPending}
                                className="h-9 w-9 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleAddTag}
                            disabled={updateMetadataMutation.isPending}
                            className="w-full text-xs"
                          >
                            + Add Tag
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {currentImage.metadata.tags.length > 0 ? (
                            currentImage.metadata.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No tags available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {currentImage.metadata.colors &&
                    currentImage.metadata.colors.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">
                          Dominant Colors ({currentImage.metadata.colors.length}
                          )
                        </h4>
                        <div className="flex gap-3 items-center">
                          {currentImage.metadata.colors.map((color, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center gap-1"
                            >
                              <button
                                type="button"
                                className="w-12 h-12 rounded-lg border-2 border-border shadow-sm cursor-pointer hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary"
                                style={{ backgroundColor: color }}
                                title={`Click to filter by ${color}`}
                                onClick={() => {
                                  if (onColorFilter) {
                                    onColorFilter(color);
                                    onClose();
                                  }
                                }}
                                aria-label={`Filter by color ${color}`}
                              />
                              <span className="text-xs text-muted-foreground font-mono">
                                {color}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {hasMetadata && onFindSimilar && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        onClick={() => onFindSimilar(currentImage.id)}
                        className={cn("w-full flex items-center justify-center gap-2", theme.button.touch, "text-sm sm:text-base")}
                      >
                        <Search className="h-4 w-4" />
                        Find Similar Images
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {isPending &&
                !isProcessing &&
                !isFailed &&
                !isCompleted &&
                !hasMetadata && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>AI Analysis Pending</AlertTitle>
                    <AlertDescription>
                      AI analysis will start automatically. This may take a few
                      moments.
                    </AlertDescription>
                  </Alert>
                )}

              {hasNoMetadata &&
                !isProcessing &&
                !isFailed &&
                !isPending &&
                !isCompleted &&
                !hasMetadata && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>Initializing AI Analysis</AlertTitle>
                    <AlertDescription>
                      Setting up image analysis. Processing will begin
                      shortly...
                    </AlertDescription>
                  </Alert>
                )}
            </>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download Image</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to download "{currentImage?.filename}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDownload}>
              Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
