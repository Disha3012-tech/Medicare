/**
 * Downloads a file from a URL.
 * First tries to download via fetch and blob creation to handle cross-origin renaming.
 * Falls back to opening the link in a new tab if fetch fails.
 */
export async function downloadFile(url: string, filename: string) {
  try {
    const accessToken = localStorage.getItem("access_token");
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Failed to fetch file");
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Direct download failed, falling back to opening in a new tab:", error);
    // Fallback: Open in new window so user can save-as manually
    window.open(url, "_blank");
  }
}
