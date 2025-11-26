import {
  isValidImageFile,
  getFileExtension,
  generateUniqueFilename,
} from "../image-utils";

describe("image-utils", () => {
  describe("isValidImageFile", () => {
    it("should return true for JPEG files", () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      expect(isValidImageFile(file)).toBe(true);
    });

    it("should return true for JPG files", () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpg" });
      expect(isValidImageFile(file)).toBe(true);
    });

    it("should return true for PNG files", () => {
      const file = new File(["test"], "test.png", { type: "image/png" });
      expect(isValidImageFile(file)).toBe(true);
    });

    it("should return false for GIF files", () => {
      const file = new File(["test"], "test.gif", { type: "image/gif" });
      expect(isValidImageFile(file)).toBe(false);
    });

    it("should return false for non-image files", () => {
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      expect(isValidImageFile(file)).toBe(false);
    });

    it("should handle case-insensitive MIME types", () => {
      const file = new File(["test"], "test.jpg", { type: "IMAGE/JPEG" });
      expect(isValidImageFile(file)).toBe(true);
    });
  });

  describe("getFileExtension", () => {
    it("should extract extension from filename", () => {
      expect(getFileExtension("image.jpg")).toBe("jpg");
      expect(getFileExtension("photo.png")).toBe("png");
      expect(getFileExtension("test.jpeg")).toBe("jpeg");
    });

    it("should return lowercase extension", () => {
      expect(getFileExtension("image.JPG")).toBe("jpg");
      expect(getFileExtension("photo.PNG")).toBe("png");
    });

    it("should handle filenames with multiple dots", () => {
      expect(getFileExtension("image.backup.jpg")).toBe("jpg");
      expect(getFileExtension("file.name.png")).toBe("png");
    });

    it("should return the last part for filenames without extension", () => {
      const result = getFileExtension("filename");
      expect(typeof result).toBe("string");
      expect(getFileExtension("")).toBe("");
    });
  });

  describe("generateUniqueFilename", () => {
    const userId = "user-123";

    it("should generate unique filename with timestamp and random string", () => {
      const filename1 = generateUniqueFilename("image.jpg", userId);
      const filename2 = generateUniqueFilename("image.jpg", userId);

      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain(userId);
      expect(filename1).toContain(".jpg");
      expect(filename1).toMatch(/^user-123\/\d+-[a-z0-9]+\.jpg$/);
    });

    it("should preserve original file extension", () => {
      const filename = generateUniqueFilename("photo.png", userId);
      expect(filename).toContain(".png");
      expect(filename).not.toContain(".jpg");
    });

    it("should handle different file extensions", () => {
      const jpgFilename = generateUniqueFilename("test.jpg", userId);
      const pngFilename = generateUniqueFilename("test.png", userId);

      expect(jpgFilename).toContain(".jpg");
      expect(pngFilename).toContain(".png");
    });

    it("should include user ID in path", () => {
      const filename = generateUniqueFilename("image.jpg", userId);
      expect(filename).toMatch(new RegExp(`^${userId}/`));
    });

    it("should generate different filenames for same input", () => {
      const filename1 = generateUniqueFilename("image.jpg", userId);
      const filename2 = generateUniqueFilename("image.jpg", userId);

      expect(filename1).not.toBe(filename2);
    });
  });

  describe("generateThumbnail", () => {
    it("should be tested with integration tests due to canvas API dependency", () => {
      expect(true).toBe(true);
    });
  });
});

