import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Download,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoViewerProps {
  videoUrl: string | null;
  fileName: string;
  hideDownload?: boolean;
  onVideoLoaded?: (info: {
    width: number;
    height: number;
    duration: number;
  }) => void;
}

export interface VideoViewerHandle {
  /** Capture current video frame as JPEG base64 (without data: prefix). Returns null on failure. */
  captureFrame: () => Promise<string | null>;
}

const MAX_THUMB_WIDTH = 400;

/**
 * Build a same-origin proxy URL for a given video URL to avoid CORS/canvas taint.
 */
function getProxyUrl(url: string): string {
  return `/api/proxy-video?url=${encodeURIComponent(url)}`;
}

/**
 * Draw a video element's current frame to canvas and return base64.
 * Returns null if the canvas is tainted or draw fails.
 */
function drawVideoToBase64(video: HTMLVideoElement): string | null {
  if (video.videoWidth === 0 || video.videoHeight === 0) return null;
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
    // This will throw SecurityError if canvas is tainted by cross-origin video
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1];
    return base64 && base64.length > 100 ? base64 : null;
  } catch {
    return null;
  }
}

/**
 * Load a video through proxy, seek to a specific time, and capture frame.
 */
function captureViaProxy(originalUrl: string, seekTime: number): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    let done = false;

    const finish = (result: string | null) => {
      if (done) return;
      done = true;
      console.log("[VideoViewer] captureViaProxy finished, result:", result ? `base64(${result.length})` : "null");
      resolve(result);
      video.removeAttribute("src");
      video.load();
    };

    const timer = setTimeout(() => {
      console.warn("[VideoViewer] Proxy capture timed out after 45s");
      finish(null);
    }, 45000);

    video.onloadedmetadata = () => {
      console.log("[VideoViewer] Proxy video metadata loaded:", video.videoWidth, "x", video.videoHeight, "duration:", video.duration);
      const t = Math.min(seekTime, video.duration > 2 ? 1 : video.duration * 0.5);
      video.currentTime = t;
    };

    video.onseeked = () => {
      clearTimeout(timer);
      console.log("[VideoViewer] Proxy video seeked, capturing frame...");
      const base64 = drawVideoToBase64(video);
      finish(base64);
    };

    video.onerror = () => {
      clearTimeout(timer);
      console.warn("[VideoViewer] Proxy video load error:", video.error?.code, video.error?.message);
      finish(null);
    };

    const proxyUrl = getProxyUrl(originalUrl);
    console.log("[VideoViewer] Starting proxy capture, URL:", proxyUrl.substring(0, 100));
    video.src = proxyUrl;
  });
}

const VideoViewer = forwardRef<VideoViewerHandle, VideoViewerProps>(
  ({ videoUrl, fileName, hideDownload, onVideoLoaded }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Expose captureFrame method (async to support proxy fallback)
    useImperativeHandle(ref, () => ({
      captureFrame: async () => {
        const video = videoRef.current;

        // If video element is loaded and has dimensions, try direct capture first
        if (video && video.videoWidth > 0 && video.readyState >= 2) {
          // Strategy 1: Try direct canvas draw (works for same-origin / blob URLs)
          const direct = drawVideoToBase64(video);
          if (direct) return direct;
          console.log("[VideoViewer] Direct capture failed (CORS?), trying proxy...");
        } else {
          console.log("[VideoViewer] Video not ready yet, going directly to proxy...");
        }

        // Strategy 2: Load through proxy to avoid CORS taint
        // This is the primary path for cross-origin (S3/CloudFront) videos
        if (videoUrl) {
          const seekTime = (video && video.currentTime > 0) ? video.currentTime : 1;
          return captureViaProxy(videoUrl, seekTime);
        }

        return null;
      },
    }), [videoUrl]);

    // Format time as mm:ss
    const formatTime = (seconds: number) => {
      if (isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle video metadata loaded
    const handleLoadedMetadata = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      setDuration(video.duration);
      setIsLoaded(true);
      onVideoLoaded?.({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
    }, [onVideoLoaded]);

    // Handle time update
    const handleTimeUpdate = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      setCurrentTime(video.currentTime);
    }, []);

    // Handle video ended
    const handleEnded = useCallback(() => {
      setIsPlaying(false);
    }, []);

    // Toggle play/pause
    const togglePlay = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }, []);

    // Toggle mute
    const toggleMute = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }, []);

    // Handle seek
    const handleSeek = useCallback((value: number[]) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = value[0];
      setCurrentTime(value[0]);
    }, []);

    // Handle volume change
    const handleVolumeChange = useCallback((value: number[]) => {
      const video = videoRef.current;
      if (!video) return;
      video.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }, []);

    // Skip forward/backward
    const skip = useCallback((seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(
        0,
        Math.min(video.duration, video.currentTime + seconds)
      );
    }, []);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;
      if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => setIsFullscreen(true));
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }, []);

    // Handle download
    const handleDownload = useCallback(() => {
      if (!videoUrl) return;
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = fileName;
      a.click();
    }, [videoUrl, fileName]);

    // Auto-hide controls
    const resetHideTimer = useCallback(() => {
      setShowControls(true);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      if (isPlaying) {
        hideControlsTimer.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    }, [isPlaying]);

    // Listen for fullscreen change
    useEffect(() => {
      const handleFsChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener("fullscreenchange", handleFsChange);
      return () =>
        document.removeEventListener("fullscreenchange", handleFsChange);
    }, []);

    // Show controls when paused
    useEffect(() => {
      if (!isPlaying) {
        setShowControls(true);
        if (hideControlsTimer.current) {
          clearTimeout(hideControlsTimer.current);
        }
      }
    }, [isPlaying]);

    if (!videoUrl) return null;

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full bg-black flex items-center justify-center group"
        onMouseMove={resetHideTimer}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        style={{ minHeight: "500px" }}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-w-full max-h-full object-contain"
          style={{
            width: isFullscreen ? "100%" : "auto",
            height: isFullscreen ? "100%" : "100%",
          }}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onClick={togglePlay}
          playsInline
          preload="metadata"
        />

        {/* Play overlay (shown when paused and loaded) */}
        {isLoaded && !isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mb-4" />
            <p className="text-white/80 text-sm">加载视频中...</p>
          </div>
        )}

        {/* Controls overlay */}
        {isLoaded && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-3 px-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Progress bar */}
            <div className="mb-3">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_.bg-primary]:bg-white"
              />
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" fill="white" />
                  ) : (
                    <Play className="w-4 h-4" fill="white" />
                  )}
                </Button>

                {/* Skip backward */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => skip(-10)}
                  title="后退 10 秒"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                {/* Skip forward */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => skip(10)}
                  title="前进 10 秒"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>

                {/* Volume */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                    onClick={toggleMute}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.05}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5 [&_[role=slider]]:bg-white [&_.bg-primary]:bg-white"
                    />
                  </div>
                </div>

                {/* Time display */}
                <span className="text-white text-xs ml-2 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Restart */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                  title="重新播放"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                {/* Download */}
                {!hideDownload && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                    onClick={handleDownload}
                    title="下载视频"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "退出全屏" : "全屏"}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

VideoViewer.displayName = "VideoViewer";

export default VideoViewer;
