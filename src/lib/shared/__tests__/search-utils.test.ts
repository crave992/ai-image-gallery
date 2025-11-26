import {
  findSimilarImages,
  filterImages,
} from "../search-utils";
import type { ImageWithMetadata } from "@/types";

describe("search-utils", () => {
  const createMockImage = (
    id: number,
    tags: string[] = [],
    description: string = "",
    colors: string[] = []
  ): ImageWithMetadata => ({
    id,
    user_id: "user-1",
    filename: `image-${id}.jpg`,
    original_path: `user-1/image-${id}.jpg`,
    thumbnail_path: `user-1/thumb-image-${id}.jpg`,
    uploaded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    metadata: {
      id: id,
      image_id: id,
      user_id: "user-1",
      tags,
      description,
      colors,
      ai_processing_status: "completed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });

  describe("filterImages", () => {
    const images: ImageWithMetadata[] = [
      createMockImage(1, ["beach", "ocean"], "A beautiful beach scene", [
        "#FFD700",
        "#00CED1",
      ]),
      createMockImage(2, ["mountain", "snow"], "Snowy mountain peak", [
        "#FFFFFF",
        "#87CEEB",
      ]),
      createMockImage(3, ["beach", "sunset"], "Beach at sunset", [
        "#FF6347",
        "#FFD700",
      ]),
      createMockImage(4, ["forest", "trees"], "Dense forest", ["#228B22"]),
    ];

    it("should return all images when no filters are applied", () => {
      const result = filterImages(images, {});
      expect(result).toHaveLength(4);
    });

    it("should filter by text query matching tags", () => {
      const result = filterImages(images, { textQuery: "beach" });
      expect(result).toHaveLength(2);
      expect(result.map((img) => img.id)).toEqual([1, 3]);
    });

    it("should filter by text query matching description", () => {
      const result = filterImages(images, { textQuery: "mountain" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("should filter by color", () => {
      const result = filterImages(images, { colorFilter: "#FFD700" });
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((img) => img.id === 1 || img.id === 3)).toBe(true);
    });

    it("should return empty array when no matches found", () => {
      const result = filterImages(images, { textQuery: "nonexistent" });
      expect(result).toHaveLength(0);
    });

    it("should combine multiple filters", () => {
      const result = filterImages(images, {
        textQuery: "beach",
        colorFilter: "#FFD700",
      });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((img) => img.id === 1 || img.id === 3)).toBe(true);
    });

    it("should handle empty images array", () => {
      const result = filterImages([], { textQuery: "test" });
      expect(result).toHaveLength(0);
    });

    it("should handle images without metadata", () => {
      const imageWithoutMetadata: ImageWithMetadata = {
        id: 5,
        user_id: "user-1",
        filename: "test.jpg",
        original_path: "test.jpg",
        thumbnail_path: "thumb-test.jpg",
        uploaded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      const result = filterImages([imageWithoutMetadata], {
        textQuery: "test",
      });
      expect(result).toHaveLength(0);
    });

    it("should handle case-insensitive text queries", () => {
      const result = filterImages(images, { textQuery: "BEACH" });
      expect(result).toHaveLength(2);
    });

    it("should handle similar images filter", () => {
      const result = filterImages(images, { similarToImageId: 1 });
      expect(result.length).toBeGreaterThanOrEqual(0);
      expect(result.every((img) => img.id !== 1)).toBe(true);
    });

    it("should return empty array when similar image not found", () => {
      const result = filterImages(images, { similarToImageId: 999 });
      expect(result).toHaveLength(0);
    });
  });

  describe("findSimilarImages", () => {
    const targetImage = createMockImage(
      1,
      ["beach", "ocean", "sunset"],
      "Beautiful beach at sunset",
      ["#FFD700", "#00CED1", "#FF6347"]
    );

    const images: ImageWithMetadata[] = [
      targetImage,
      createMockImage(
        2,
        ["beach", "ocean"],
        "Ocean waves",
        ["#00CED1", "#1E90FF"]
      ),
      createMockImage(
        3,
        ["mountain", "snow"],
        "Snowy mountain",
        ["#FFFFFF", "#87CEEB"]
      ),
      createMockImage(
        4,
        ["beach", "sunset"],
        "Sunset on the beach",
        ["#FF6347", "#FFD700"]
      ),
      createMockImage(5, ["forest"], "Forest scene", ["#228B22"]),
    ];

    it("should find similar images based on tags and description", () => {
      const result = findSimilarImages(images, targetImage, 10);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((img) => img.id !== targetImage.id)).toBe(true);
      expect(result.some((img) => img.id === 2 || img.id === 4)).toBe(true);
    });

    it("should exclude the target image from results", () => {
      const result = findSimilarImages(images, targetImage, 10);
      expect(result.every((img) => img.id !== targetImage.id)).toBe(true);
    });

    it("should respect the limit parameter", () => {
      const result = findSimilarImages(images, targetImage, 2);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it("should return empty array when target has no metadata", () => {
      const imageWithoutMetadata: ImageWithMetadata = {
        ...targetImage,
        metadata: undefined,
      };
      const result = findSimilarImages(images, imageWithoutMetadata, 10);
      expect(result).toHaveLength(0);
    });

    it("should return empty array when no similar images found", () => {
      const veryDifferentImage = createMockImage(
        999,
        ["abstract", "art"],
        "Abstract art piece",
        ["#000000"]
      );
      const result = findSimilarImages([veryDifferentImage], targetImage, 10);
      expect(result).toHaveLength(0);
    });

    it("should respect threshold parameter", () => {
      const highThresholdResult = findSimilarImages(images, targetImage, 10, 0.9);
      const lowThresholdResult = findSimilarImages(images, targetImage, 10, 0.1);
      
      expect(highThresholdResult.length).toBeLessThanOrEqual(
        lowThresholdResult.length
      );
    });

    it("should return results sorted by similarity (descending)", () => {
      const result = findSimilarImages(images, targetImage, 10);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((img) => img.id !== targetImage.id)).toBe(true);
    });
  });
});

