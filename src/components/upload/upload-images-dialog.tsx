"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { ImageUploadZone } from "@/components/upload/image-upload-zone";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface UploadImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
}

/**
 * Upload images dialog component
 * Contains drag & drop zone and upload/cancel buttons
 */
export function UploadImagesDialog({
  open,
  onOpenChange,
  onUpload,
  isUploading = false,
}: UploadImagesDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const newFiles = files.filter((f) => !existingNames.has(f.name));
      return [...prev, ...newFiles];
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadClick = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one image to upload.");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmUpload = () => {
    setShowConfirmDialog(false);
    onUpload(selectedFiles);
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isUploading) {
      setSelectedFiles([]);
    }
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className={cn(theme.dialog.content, "p-3 sm:p-6")}>
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
            <DialogDescription>
              Select images to upload (JPEG, PNG supported)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <ImageUploadZone
              onFilesSelected={handleFilesSelected}
              isUploading={isUploading}
            />

            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm font-medium text-foreground">
                    Selected Files ({selectedFiles.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isUploading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {file.name}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn("flex justify-end gap-2 pt-4 border-t", theme.flex.colMobile)}>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
                className={cn(theme.button.touch, "w-full sm:w-auto text-sm sm:text-base")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading || selectedFiles.length === 0}
                className={cn(theme.button.touch, "w-full sm:w-auto text-sm sm:text-base")}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Confirm Upload
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to upload {selectedFiles.length} image
              {selectedFiles.length !== 1 ? "s" : ""}? This will save them to
              your gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpload}>
              Yes, Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

