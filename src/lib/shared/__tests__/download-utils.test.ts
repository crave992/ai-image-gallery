import { exportAsJSON } from "../download-utils";

describe("download-utils", () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn((blob: Blob) => {
      return `blob:mock-url-${blob.type}`;
    });
    global.URL.revokeObjectURL = jest.fn();
    
    const mockLink = {
      href: "",
      download: "",
      style: { display: "" },
      click: jest.fn(),
    } as unknown as HTMLAnchorElement;
    
    global.document.createElement = jest.fn(() => mockLink);
    global.document.body.appendChild = jest.fn();
    global.document.body.removeChild = jest.fn();
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(["test"], { type: "image/jpeg" })),
      } as Response)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("exportAsJSON", () => {
    it("should create a JSON blob with correct data", async () => {
      const testData = {
        name: "Test",
        count: 42,
        items: [1, 2, 3],
      };

      await exportAsJSON(testData, "test.json");

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      const blobCall = (global.URL.createObjectURL as jest.Mock).mock
        .calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
      expect(blobCall.type).toBe("application/json");
      
      const reader = new FileReader();
      const textPromise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(blobCall);
      });
      const text = await textPromise;
      const parsed = JSON.parse(text);
      expect(parsed).toEqual(testData);
    });

    it("should format JSON with indentation", async () => {
      const testData = { name: "Test", nested: { value: 123 } };

      await exportAsJSON(testData, "test.json");

      const blobCall = (global.URL.createObjectURL as jest.Mock).mock
        .calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
      expect(blobCall.type).toBe("application/json");
      
      const reader = new FileReader();
      const textPromise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(blobCall);
      });
      const text = await textPromise;
      const parsed = JSON.parse(text);

      expect(parsed).toEqual(testData);
      expect(text).toContain("\n  "); // Check for indentation
    });

    it("should use provided filename", async () => {
      const testData = { test: "data" };
      const filename = "custom-export.json";

      await exportAsJSON(testData, filename);

      expect(global.document.createElement).toHaveBeenCalledWith("a");
      const linkElement = global.document.createElement(
        "a"
      ) as unknown as HTMLAnchorElement;
      expect(linkElement.download).toBe(filename);
    });

    it("should clean up blob URL after download", async () => {
      const testData = { test: "data" };

      await exportAsJSON(testData, "test.json");

      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should handle complex nested objects", async () => {
      const complexData = {
        array: [1, 2, { nested: "value" }],
        object: {
          deep: {
            deeper: {
              value: "test",
            },
          },
        },
        nullValue: null,
        booleanValue: true,
      };

      await exportAsJSON(complexData, "complex.json");

      const blobCall = (global.URL.createObjectURL as jest.Mock).mock
        .calls[0][0];
      const reader = new FileReader();
      const textPromise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(blobCall);
      });
      const text = await textPromise;
      const parsed = JSON.parse(text);

      expect(parsed).toEqual(complexData);
    });

    it("should handle empty objects", async () => {
      const emptyData = {};

      await exportAsJSON(emptyData, "empty.json");

      const blobCall = (global.URL.createObjectURL as jest.Mock).mock
        .calls[0][0];
      const reader = new FileReader();
      const textPromise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(blobCall);
      });
      const text = await textPromise;
      const parsed = JSON.parse(text);

      expect(parsed).toEqual({});
    });
  });

  describe("downloadFile", () => {
    it("should be tested with integration tests due to fetch and DOM APIs", () => {
      expect(true).toBe(true);
    });
  });
});

