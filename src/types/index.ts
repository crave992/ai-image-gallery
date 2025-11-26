/**
 * User types
 */
export interface User {
  id: string;
  email: string;
  created_at: string;
}

/**
 * Auth user type (extends User with auth-specific fields)
 */
export interface AuthUser extends User {
  email: string;
}

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
  created_at: string;
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
  updated_at: string;
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

/**
 * Search filters interface
 */
export interface SearchFilters {
  textQuery?: string;
  colorFilter?: string;
  similarToImageId?: number;
}

