/**
 * Downloads a file from a URL
 * Fetches the file as a blob to ensure proper download behavior
 * @param url - The URL to download from
 * @param filename - The filename for the downloaded file
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

/**
 * Exports data as JSON file
 * @param data - The data to export
 * @param filename - The filename for the exported JSON file
 */
export async function exportAsJSON(data: unknown, filename: string): Promise<void> {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  try {
    await downloadFile(url, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

