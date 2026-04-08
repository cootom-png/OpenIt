/**
 * Capture a thumbnail from the viewer container.
 *
 * Strategy:
 * 1. Find the largest canvas inside the container.
 * 2. For WebGL canvases (DWG CAD viewer, DXF viewer, Three.js):
 *    - If preserveDrawingBuffer is true (Three.js), toDataURL works directly.
 *    - If not (DWG CAD viewer), we hook into the WebGL context's rendering
 *      by using requestAnimationFrame to capture right after the next paint.
 *      We force a re-render by resizing slightly, then capture in the RAF callback.
 * 3. If no canvas found, fall back to html2canvas (Word/Excel/video).
 *
 * Returns a base64-encoded PNG string (without the data:image/png;base64, prefix),
 * or null if capture fails.
 */

const MAX_THUMB_WIDTH = 400;

/**
 * Check if a canvas has a WebGL context with preserveDrawingBuffer enabled.
 */
function hasPreservedBuffer(canvas: HTMLCanvasElement): boolean {
  try {
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (gl) {
      return (gl as WebGLRenderingContext).getContextAttributes()
        ?.preserveDrawingBuffer === true;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Check if a data URL represents a non-blank image.
 * A blank WebGL canvas produces a very short data URL or all-black pixels.
 */
function isBlankDataUrl(dataUrl: string): boolean {
  // Very short data URLs are definitely blank
  if (!dataUrl || dataUrl.length < 200) return true;
  return false;
}

/**
 * Capture a WebGL canvas that does NOT have preserveDrawingBuffer.
 * We use a trick: read pixels via WebGL readPixels in a requestAnimationFrame
 * callback, which runs right after the browser composites the frame.
 */
function captureWebGLCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
  return new Promise((resolve) => {
    // Try multiple frames to ensure we catch a rendered frame
    let attempts = 0;
    const maxAttempts = 5;

    function tryCapture() {
      attempts++;
      requestAnimationFrame(() => {
        try {
          const gl =
            (canvas.getContext("webgl2", { preserveDrawingBuffer: false }) as WebGL2RenderingContext | null) ||
            (canvas.getContext("webgl", { preserveDrawingBuffer: false }) as WebGLRenderingContext | null);

          if (!gl) {
            resolve(null);
            return;
          }

          const width = canvas.width;
          const height = canvas.height;

          if (width === 0 || height === 0) {
            resolve(null);
            return;
          }

          // Read pixels from the WebGL framebuffer
          const pixels = new Uint8Array(width * height * 4);
          gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

          // Check if the image is not all black/transparent
          let hasContent = false;
          // Sample every 100th pixel for speed
          for (let i = 0; i < pixels.length; i += 400) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];
            // If any pixel is not black and not fully transparent
            if (a > 0 && (r > 10 || g > 10 || b > 10)) {
              hasContent = true;
              break;
            }
          }

          if (!hasContent && attempts < maxAttempts) {
            // Try again next frame
            setTimeout(tryCapture, 200);
            return;
          }

          if (!hasContent) {
            resolve(null);
            return;
          }

          // Convert pixels to canvas (WebGL pixels are bottom-up, need to flip)
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const ctx = tempCanvas.getContext("2d")!;
          const imageData = ctx.createImageData(width, height);

          // Flip vertically (WebGL readPixels returns bottom-to-top)
          for (let y = 0; y < height; y++) {
            const srcRow = (height - 1 - y) * width * 4;
            const dstRow = y * width * 4;
            for (let x = 0; x < width * 4; x++) {
              imageData.data[dstRow + x] = pixels[srcRow + x];
            }
          }

          ctx.putImageData(imageData, 0, 0);
          const dataUrl = tempCanvas.toDataURL("image/png");
          resolve(dataUrl);
        } catch (err) {
          console.warn("WebGL readPixels capture failed:", err);
          if (attempts < maxAttempts) {
            setTimeout(tryCapture, 200);
          } else {
            resolve(null);
          }
        }
      });
    }

    tryCapture();
  });
}

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

        // Check if this is a WebGL canvas with preserveDrawingBuffer
        if (hasPreservedBuffer(canvas)) {
          // Direct toDataURL works
          try {
            const dataUrl = canvas.toDataURL("image/png");
            if (!isBlankDataUrl(dataUrl)) {
              return await resizeToThumbnail(dataUrl);
            }
          } catch {
            // Fall through
          }
        }

        // Try WebGL readPixels approach (works for DWG CAD viewer without preserveDrawingBuffer)
        const webglDataUrl = await captureWebGLCanvas(canvas);
        if (webglDataUrl && !isBlankDataUrl(webglDataUrl)) {
          return await resizeToThumbnail(webglDataUrl);
        }

        // Last resort: try toDataURL anyway (might work for 2D canvases like PDF)
        try {
          const dataUrl = canvas.toDataURL("image/png");
          if (!isBlankDataUrl(dataUrl)) {
            return await resizeToThumbnail(dataUrl);
          }
        } catch {
          // Fall through to html2canvas
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
      return await resizeToThumbnail(dataUrl);
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
        // Draw white background first (for transparent canvases)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
        ctx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
        const thumbDataUrl = thumbCanvas.toDataURL("image/jpeg", 0.85);
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
