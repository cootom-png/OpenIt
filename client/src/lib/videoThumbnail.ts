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
const CAPTURE_TIMEOUT_MS = 10000; // 10 seconds max

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

    // Timeout safety net
    const timer = setTimeout(() => {
      console.warn("[VideoThumb] Capture timed out");
      cleanup();
    }, CAPTURE_TIMEOUT_MS);

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    // Required for cross-origin videos (S3 URLs)
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      // Seek to 1s or half the duration if video is very short
      const seekTime = video.duration > 2 ? 1 : video.duration * 0.5;
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");

        // Scale down to thumbnail size
        const scale = Math.min(1, MAX_THUMB_WIDTH / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          clearTimeout(timer);
          cleanup();
          return;
        }

        // Draw black background first
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw the video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64 = dataUrl.split(",")[1];

        clearTimeout(timer);
        resolved = true;
        resolve(base64 && base64.length > 100 ? base64 : null);

        // Cleanup
        video.removeAttribute("src");
        video.load();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn("[VideoThumb] Canvas draw failed:", err);
        clearTimeout(timer);
        cleanup();
      }
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
 * Generate a thumbnail from a video URL (e.g. S3 URL).
 * Used for generating thumbnails from already-uploaded videos.
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
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      const seekTime = video.duration > 2 ? 1 : video.duration * 0.5;
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, MAX_THUMB_WIDTH / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          clearTimeout(timer);
          cleanup();
          return;
        }

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64 = dataUrl.split(",")[1];

        clearTimeout(timer);
        resolved = true;
        resolve(base64 && base64.length > 100 ? base64 : null);

        video.removeAttribute("src");
        video.load();
      } catch (err) {
        console.warn("[VideoThumb] URL canvas draw failed:", err);
        clearTimeout(timer);
        cleanup();
      }
    };

    video.onerror = () => {
      console.warn("[VideoThumb] URL video load error");
      clearTimeout(timer);
      cleanup();
    };

    video.src = videoUrl;
  });
}
