import { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCw, Maximize, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  imageUrl: string | null;
  fileName?: string;
  hideDownload?: boolean;
  onImageLoaded?: (info: { width: number; height: number }) => void;
}

export default function ImageViewer({
  imageUrl,
  fileName,
  hideDownload,
  onImageLoaded,
}: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset state when image changes
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
  }, [imageUrl]);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current && onImageLoaded) {
      onImageLoaded({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
    setImageLoaded(true);
  }, [onImageLoaded]);

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s * 1.25, 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(s / 1.25, 0.1));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  const handleFit = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = fileName || "image";
    a.click();
  }, [imageUrl, fileName]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(Math.max(s * delta, 0.1), 10));
  }, []);

  // Drag to pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!imageUrl) return null;

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Image container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-[#f8f8f8] cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ minHeight: "500px" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* White background for image preview */}
        <div className="absolute inset-0 bg-white" />
        <img
          ref={imgRef}
          src={imageUrl}
          alt={fileName || "Preview"}
          className="relative max-w-none select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.2s ease",
            maxWidth: scale === 1 && rotation % 180 === 0 ? "100%" : "none",
            maxHeight: scale === 1 && rotation % 180 === 0 ? "100%" : "none",
            objectFit: "contain",
          }}
          onLoad={handleImageLoad}
          draggable={false}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border px-2 py-1.5">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="放大">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="缩小">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRotate} title="旋转 90°">
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFit} title="适应窗口">
          <Maximize className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        {!hideDownload && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="下载">
            <Download className="w-4 h-4" />
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-1 min-w-[45px] text-center">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}
