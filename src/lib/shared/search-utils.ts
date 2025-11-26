import type { ImageWithMetadata, SearchFilters } from "@/types";

/**
 * Calculate semantic similarity between two tags (handles plurals, variations)
 * @param tag1 - First tag
 * @param tag2 - Second tag
 * @returns Similarity score between 0 and 1
 */
function tagSemanticSimilarity(tag1: string, tag2: string): number {
  const t1 = tag1.toLowerCase().trim();
  const t2 = tag2.toLowerCase().trim();

  if (t1 === t2) return 1.0;

  if (t1.includes(t2) || t2.includes(t1)) {
    const shorter = Math.min(t1.length, t2.length);
    const longer = Math.max(t1.length, t2.length);
    return shorter / longer;
  }

  const root1 = t1.replace(/s$|es$|ing$|ed$/, "");
  const root2 = t2.replace(/s$|es$|ing$|ed$/, "");
  if (root1 === root2 && root1.length > 2) return 0.8;

  const words1 = t1.split(/[\s-_]+/);
  const words2 = t2.split(/[\s-_]+/);
  const commonWords = words1.filter((w) => words2.includes(w));
  if (commonWords.length > 0) {
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  return 0;
}

/**
 * Calculate improved cosine similarity between two tag arrays with semantic matching
 * Uses lenient matching to include broader categories
 * @param tags1 - First array of tags
 * @param tags2 - Second array of tags
 * @returns Similarity score between 0 and 1
 */
function cosineSimilarityTags(
  tags1: string[],
  tags2: string[]
): number {
  if (tags1.length === 0 || tags2.length === 0) return 0;

  const exactMatches = tags1.filter((tag) =>
    tags2.some((t) => t.toLowerCase() === tag.toLowerCase())
  ).length;

  let semanticScore = 0;
  let maxPairs = 0;

  tags1.forEach((tag1) => {
    const bestMatch = Math.max(
      ...tags2.map((tag2) => tagSemanticSimilarity(tag1, tag2))
    );
    semanticScore += bestMatch;
    maxPairs++;
  });

  const avgSemanticSim = maxPairs > 0 ? semanticScore / maxPairs : 0;
  const exactMatchRatio = exactMatches / Math.max(tags1.length, tags2.length);
  const baseSimilarity = exactMatchRatio * 0.5 + avgSemanticSim * 0.5;
  const hasAnyMatch = exactMatches > 0 || avgSemanticSim > 0.1;
  const bonus = hasAnyMatch ? 0.1 : 0;
  
  return Math.min(1.0, baseSimilarity + bonus);
}

/**
 * Convert RGB to LAB color space for perceptual color matching
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns LAB color values [L, a, b]
 */
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x + 16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y + 16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z + 16 / 116);

  const L = 116 * y - 16;
  const a = 500 * (x - y);
  const b_lab = 200 * (y - z);

  return [L, a, b_lab];
}

/**
 * Calculate color similarity using LAB color space (perceptually uniform)
 * This provides better color matching that aligns with human perception
 * @param color1 - First color in hex format (#RRGGBB)
 * @param color2 - Second color in hex format (#RRGGBB)
 * @returns Similarity score between 0 and 1 (1 = identical, 0 = very different)
 */
function colorSimilarity(color1: string, color2: string): number {
  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  try {
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);

    const [L1, a1, b1_lab] = rgbToLab(r1, g1, b1);
    const [L2, a2, b2_lab] = rgbToLab(r2, g2, b2);

    const deltaE = Math.sqrt(
      Math.pow(L1 - L2, 2) + Math.pow(a1 - a2, 2) + Math.pow(b1_lab - b2_lab, 2)
    );

    const similarity = Math.max(0, 1 - deltaE / 50);

    return similarity;
  } catch {
    return 0;
  }
}

/**
 * Calculate text similarity between two descriptions using word overlap
 * @param desc1 - First description
 * @param desc2 - Second description
 * @returns Similarity score between 0 and 1
 */
function descriptionSimilarity(desc1: string, desc2: string): number {
  if (!desc1 || !desc2) return 0;

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const words1 = normalize(desc1);
  const words2 = normalize(desc2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;

  return intersection.size / union.size;
}

/**
 * Calculate overall similarity between two images based on tags, colors, and description
 * Uses lenient matching to include broader categories (games, beaches, people, etc.)
 * @param image1 - First image
 * @param image2 - Second image
 * @returns Similarity score between 0 and 1
 */
function calculateImageSimilarity(
  image1: ImageWithMetadata,
  image2: ImageWithMetadata
): number {
  const tags1 = image1.metadata?.tags || [];
  const tags2 = image2.metadata?.tags || [];
  const colors1 = image1.metadata?.colors || [];
  const colors2 = image2.metadata?.colors || [];
  const desc1 = image1.metadata?.description || "";
  const desc2 = image2.metadata?.description || "";

  const tagSim = cosineSimilarityTags(tags1, tags2);

  let colorSim = 0;
  if (colors1.length > 0 && colors2.length > 0) {
    const similarities: number[] = [];
    colors1.forEach((color1) => {
      const avgSim =
        colors2.reduce(
          (sum, color2) => sum + colorSimilarity(color1, color2),
          0
        ) / colors2.length;
      similarities.push(avgSim);
    });
    colorSim =
      similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  }

  const descSim = descriptionSimilarity(desc1, desc2);
  const similarity = tagSim * 0.5 + descSim * 0.3 + colorSim * 0.2;

  const matchCount = [tagSim > 0.2, descSim > 0.15, colorSim > 0.3].filter(
    Boolean
  ).length;
  const boost = matchCount >= 1 ? 1.15 : 1.0;

  return Math.min(1.0, similarity * boost);
}

/**
 * Filter images based on text query (searches tags and description)
 * @param images - Array of images to filter
 * @param query - Search query string
 * @returns Filtered images
 */
function filterByText(
  images: ImageWithMetadata[],
  query: string
): ImageWithMetadata[] {
  if (!query.trim()) return images;

  const lowerQuery = query.toLowerCase().trim();

  return images.filter((image) => {
    const tags = image.metadata?.tags || [];
    const description = image.metadata?.description || "";

    const tagMatch = tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );

    const descriptionMatch = description.toLowerCase().includes(lowerQuery);

    return tagMatch || descriptionMatch;
  });
}

/**
 * Filter images by color similarity
 * @param images - Array of images to filter
 * @param targetColor - Target color in hex format (#RRGGBB)
 * @param threshold - Minimum similarity threshold (0-1), default 0.5
 * @returns Filtered images sorted by similarity
 */
function filterByColor(
  images: ImageWithMetadata[],
  targetColor: string,
  threshold: number = 0.75
): ImageWithMetadata[] {
  if (images.length === 0) return [];

  const filtered = images
    .map((image) => {
      const colors = image.metadata?.colors || [];
      if (colors.length === 0) return null;

      const similarities = colors.map((color) =>
        colorSimilarity(targetColor, color)
      );
      const maxSimilarity = Math.max(...similarities);

      if (maxSimilarity < threshold) return null;

      return { image, similarity: maxSimilarity };
    })
    .filter(
      (item): item is { image: ImageWithMetadata; similarity: number } =>
        item !== null
    )
    .sort((a, b) => b.similarity - a.similarity)
    .map((item) => item.image);

  return filtered;
}

/**
 * Find similar images to a given image
 * Uses lenient matching to include broader categories (games, beaches, people, etc.)
 * @param images - Array of all images
 * @param targetImage - Image to find similar ones for
 * @param limit - Maximum number of results, default 10
 * @param threshold - Minimum similarity threshold (0-1), default 0.15 (lower for broader matches)
 * @returns Array of similar images sorted by similarity
 */
export function findSimilarImages(
  images: ImageWithMetadata[],
  targetImage: ImageWithMetadata,
  limit: number = 10,
  threshold: number = 0.15
): ImageWithMetadata[] {
  const otherImages = images.filter((img) => img.id !== targetImage.id);

  if (!targetImage.metadata) {
    return [];
  }

  const similarities = otherImages
    .map((image) => ({
      image,
      similarity: calculateImageSimilarity(targetImage, image),
    }))
    .filter((item) => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((item) => item.image);

  return similarities;
}

/**
 * Filter and search images based on multiple criteria
 * @param images - Array of images to filter
 * @param filters - Search filters
 * @returns Filtered images
 */
export function filterImages(
  images: ImageWithMetadata[],
  filters: SearchFilters
): ImageWithMetadata[] {
  let filtered = [...images];

  if (filters.textQuery) {
    filtered = filterByText(filtered, filters.textQuery);
  }

  if (filters.colorFilter) {
    filtered = filterByColor(filtered, filters.colorFilter, 0.75);
  }

  if (filters.similarToImageId) {
    const targetImage = images.find(
      (img) => img.id === filters.similarToImageId
    );
    if (targetImage) {
      filtered = findSimilarImages(filtered, targetImage);
    } else {
      filtered = [];
    }
  }

  return filtered;
}

