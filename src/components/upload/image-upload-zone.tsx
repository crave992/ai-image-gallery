"use client";

import { useCallback, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidImageFile } from "@/lib/client/image-utils";
import { Button } from "@/components/ui/button";
import { theme } from "@/lib/theme";

interface ImageUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
  className?: string;
}

/**
 * Drag and drop image upload zone component
 */
export function ImageUploadZone({
  onFilesSelected,
  isUploading = false,
  className,
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const validFiles = Array.from(files).filter((file) => {
        if (!isValidImageFile(file)) {
          alert(
            `${file.name} is not a valid image file. Only JPEG and PNG are supported.`
          );
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );


  return (
    <div className={cn(theme.space.md, className)}>
      <motion.div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative",
          theme.border.dashed,
          "rounded-lg",
          theme.padding.xl,
          theme.transition.base,
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 bg-muted/50",
          isUploading && "opacity-50 pointer-events-none"
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div
          className={cn(
            "flex flex-col items-center justify-center text-center",
            theme.space.md
          )}
        >
          <motion.div
            animate={{
              scale: isDragging ? 1.1 : 1,
              rotate: isDragging ? 5 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <Upload
              className={cn(
                "h-12 w-12",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </motion.div>

          <div>
            <p className={cn(theme.text.heading.h4, "font-semibold")}>
              {isDragging ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className={cn(theme.text.muted.base, "mt-1")}>
              or click to browse (JPEG, PNG)
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-2"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Select Images
          </Button>
        </div>
      </motion.div>

    </div>
  );
}
