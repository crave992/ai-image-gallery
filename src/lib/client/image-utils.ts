"use client";

/**
 * Client-side image utilities
 */

/**
 * Validates if file is a supported image format
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  return validTypes.includes(file.type.toLowerCase());
}

/**
 * Generates a thumbnail from an image file
 * @param file - Image file to create thumbnail from
 * @param size - Thumbnail size (default: 300x300)
 * @returns Promise resolving to Blob of thumbnail
 */
export function generateThumbnail(
  file: File,
  size: number = 300
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Calculate dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > size) {
            height = (height * size) / width;
            width = size;
          }
        } else {
          if (height > size) {
            width = (width * size) / height;
            height = size;
          }
        }

        canvas.width = size;
        canvas.height = size;

        // Center the image on canvas
        const x = (size - width) / 2;
        const y = (size - height) / 2;

        // Fill with white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        // Draw image
        ctx.drawImage(img, x, y, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create thumbnail"));
            }
          },
          "image/jpeg",
          0.9
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Generates a unique filename with timestamp
 */
export function generateUniqueFilename(
  originalFilename: string,
  userId: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = getFileExtension(originalFilename);
  return `${userId}/${timestamp}-${random}.${extension}`;
}

