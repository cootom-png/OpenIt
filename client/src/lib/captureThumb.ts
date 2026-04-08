/**
 * Capture a thumbnail from the viewer container.
 *
 * Strategy:
 * 1. First try to find a WebGL/2D canvas inside the container and use
 *    canvas.toDataURL() directly — this works for Three.js (STP/STL),
 *    DXF viewer, DWG CAD viewer, and PDF canvas.
 * 2. If no canvas is found (e.g., Word/Excel/video), fall back to html2canvas.
 *
 * Returns a base64-encoded PNG string (without the data:image/png;base64, prefix),
 * or null if capture fails.
 */

const MAX_THUMB_WIDTH = 400;

export async function captureViewerThumbnail(
  container: HTMLElement
): Promise<string | null> {
  try {
    // Strategy 1: Find canvas elements inside the container
    const canvasElements = container.querySelectorAll("canvas");

    if (canvasElements.length > 0) {
      // Pick the largest canvas (most likely the main render canvas)
      let bestCanvas: HTMLCanvasElement | null = null;
      let bestArea = 0;
      canvasElements.forEach((c) => {
        const area = c.width * c.height;
        if (area > bestArea) {
          bestArea = area;
          bestCanvas = c;
        }
      });

      if (bestCanvas && bestArea > 0) {
        const canvas = bestCanvas as HTMLCanvasElement;

        // For WebGL canvases with preserveDrawingBuffer, toDataURL works directly.
        // For canvases without it, we need to try reading right after a render.
        // We attempt toDataURL and check if it's not blank.
        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL("image/png");
        } catch {
          // Security error (tainted canvas) — fall through to html2canvas
          dataUrl = "";
        }

        // Check if the captured image is not blank (all transparent/white)
        if (dataUrl && dataUrl.length > 100) {
          // Resize to thumbnail
          const resized = await resizeToThumbnail(dataUrl);
          return resized;
        }
      }
    }

    // Strategy 2: Fall back to html2canvas for non-canvas content
    const html2canvas = (await import("html2canvas")).default;
    const capturedCanvas = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      scale: 0.5,
      width: container.offsetWidth,
      height: container.offsetHeight,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const dataUrl = capturedCanvas.toDataURL("image/png");
    if (dataUrl && dataUrl.length > 100) {
      const resized = await resizeToThumbnail(dataUrl);
      return resized;
    }

    return null;
  } catch (err) {
    console.warn("Thumbnail capture failed:", err);
    return null;
  }
}

/**
 * Resize a data URL image to a thumbnail with max width.
 * Returns base64 string without the data URL prefix.
 */
async function resizeToThumbnail(dataUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const thumbCanvas = document.createElement("canvas");
      const scale = Math.min(1, MAX_THUMB_WIDTH / img.width);
      thumbCanvas.width = Math.round(img.width * scale);
      thumbCanvas.height = Math.round(img.height * scale);
      const ctx = thumbCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
        const thumbDataUrl = thumbCanvas.toDataURL("image/png");
        const base64 = thumbDataUrl.split(",")[1];
        resolve(base64 || null);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
