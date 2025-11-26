/**
 * Database types for images
 */
export interface Image {
  id: number;
  user_id: string;
  filename: string;
  original_path: string;
  thumbnail_path: string;
  uploaded_at: string;
}

/**
 * Database types for image metadata
 */
export interface ImageMetadata {
  id: number;
  image_id: number;
  user_id: string;
  description: string | null;
  tags: string[];
  colors: string[];
  ai_processing_status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
}

/**
 * Combined image with metadata
 */
export interface ImageWithMetadata extends Image {
  metadata?: ImageMetadata;
}

/**
 * AI processing result
 */
export interface AIProcessingResult {
  tags: string[];
  description: string;
  colors: string[];
}

