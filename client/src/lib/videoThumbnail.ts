/**
 * Generate a thumbnail from a video file by capturing a frame at ~1 second.
 *
 * Strategy:
 *   1. Create a hidden <video> element with the file as source (object URL)
 *   2. Seek to 1 second (or 0.5s if video is very short)
 *   3. Draw the current frame onto a canvas
 *   4. Export as JPEG base64 (without data URL prefix)
 *
 * Returns base64 string or null if capture fails.
 */

const MAX_THUMB_WIDTH = 400;
const CAPTURE_TIMEOUT_MS = 15000; // 15 seconds max

/**
 * Core capture logic: given a video element that is already seeked,
 * draw the current frame to canvas and return base64.
 */
function drawVideoToBase64(video: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, MAX_THUMB_WIDTH / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1];
    return base64 && base64.length > 100 ? base64 : null;
  } catch (err) {
    console.warn("[VideoThumb] Canvas draw failed:", err);
    return null;
  }
}

/**
 * Generate thumbnail from a local File object (blob URL, no CORS issues).
 */
export function captureVideoThumbnail(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
    };

    const timer = setTimeout(() => {
      console.warn("[VideoThumb] Capture timed out");
      cleanup();
    }, CAPTURE_TIMEOUT_MS);

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const seekTime = video.duration > 2 ? 1 : video.duration * 0.5;
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      const base64 = drawVideoToBase64(video);
      clearTimeout(timer);
      resolved = true;
      resolve(base64);
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      console.warn("[VideoThumb] Video load error");
      clearTimeout(timer);
      cleanup();
    };

    video.src = url;
  });
}

/**
 * Generate thumbnail from a video URL using the backend proxy to avoid CORS.
 * The proxy at /api/proxy-video fetches the video from S3 and streams it back
 * through the same origin, so canvas is not tainted.
 */
export function captureVideoThumbnailFromUrl(videoUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
      video.removeAttribute("src");
      video.load();
    };

    const timer = setTimeout(() => {
      console.warn("[VideoThumb] URL capture timed out");
      cleanup();
    }, CAPTURE_TIMEOUT_MS);

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    // No crossOrigin needed since we're using same-origin proxy

    video.onloadedmetadata = () => {
      const seekTime = video.duration > 2 ? 1 : video.duration * 0.5;
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      const base64 = drawVideoToBase64(video);
      clearTimeout(timer);
      resolved = true;
      resolve(base64);
      video.removeAttribute("src");
      video.load();
    };

    video.onerror = (e) => {
      console.warn("[VideoThumb] URL video load error:", e);
      clearTimeout(timer);
      cleanup();
    };

    // Use backend proxy to avoid CORS issues
    const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;
    video.src = proxyUrl;
  });
}
