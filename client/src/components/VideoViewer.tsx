import { useState, useRef, useCallback, useEffect } from "react";
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
  onVideoLoaded?: (info: {
    width: number;
    height: number;
    duration: number;
  }) => void;
}

export default function VideoViewer({
  videoUrl,
  fileName,
  onVideoLoaded,
}: VideoViewerProps) {
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
                    value={[isMuted ? 0 : volume]}
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                onClick={handleDownload}
                title="下载视频"
              >
                <Download className="w-4 h-4" />
              </Button>

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
