import { useEffect, useRef, useCallback, useState } from "react";
import { Color } from "three";

interface DxfViewerComponentProps {
  fileUrl: string | null;
  className?: string;
}

export default function DxfViewerComponent({
  fileUrl,
  className,
}: DxfViewerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [layerCount, setLayerCount] = useState(0);

  const destroyViewer = useCallback(() => {
    if (viewerRef.current) {
      try {
        viewerRef.current.Destroy();
      } catch (e) {
        // ignore
      }
      viewerRef.current = null;
    }
    // Clear container
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }
  }, []);

  useEffect(() => {
    if (!fileUrl || !containerRef.current) return;

    let cancelled = false;

    const loadDxf = async () => {
      setIsLoading(true);
      setError(null);
      setProgress("正在初始化 DXF 渲染引擎...");

      try {
        // Dynamic import to avoid SSR issues
        const { DxfViewer } = await import("dxf-viewer");

        if (cancelled) return;

        // Destroy previous viewer
        destroyViewer();

        // Create new viewer
        const viewer = new DxfViewer(containerRef.current!, {
          clearColor: new Color("#f0f4f8"),
          autoResize: true,
          colorCorrection: true,
          blackWhiteInversion: true,
          antialias: true,
          sceneOptions: {
            wireframeMesh: true,
          },
        });

        viewerRef.current = viewer;

        // Subscribe to events
        viewer.Subscribe("loaded", () => {
          if (cancelled) return;
          setIsLoading(false);
          setProgress("");
          // Get layers info
          const layers = viewer.GetLayers(false);
          setLayerCount(Array.isArray(layers) ? layers.length : 0);
        });

        viewer.Subscribe("message", (msg: any) => {
          console.log("[DXF Viewer]", msg);
        });

        // Load DXF file
        setProgress("正在加载 DXF 文件...");
        await viewer.Load({
          url: fileUrl,
          fonts: [],
          progressCbk: (
            phase: string,
            processedSize: number,
            totalSize: number
          ) => {
            if (cancelled) return;
            switch (phase) {
              case "fetch":
                if (totalSize > 0) {
                  const pct = Math.round((processedSize / totalSize) * 100);
                  setProgress(`正在下载文件... ${pct}%`);
                } else {
                  setProgress(
                    `正在下载文件... ${(processedSize / 1024).toFixed(0)} KB`
                  );
                }
                break;
              case "parse":
                setProgress("正在解析 DXF 数据...");
                break;
              case "prepare":
                setProgress("正在准备渲染场景...");
                break;
              case "font":
                setProgress("正在加载字体...");
                break;
            }
          },
        });
      } catch (err: any) {
        if (!cancelled) {
          console.error("DXF load error:", err);
          setError(err.message || "加载 DXF 文件失败");
          setIsLoading(false);
          setProgress("");
        }
      }
    };

    loadDxf();

    return () => {
      cancelled = true;
      destroyViewer();
    };
  }, [fileUrl, destroyViewer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyViewer();
    };
  }, [destroyViewer]);

  return (
    <div className={`relative w-full h-full ${className || ""}`} style={{ minHeight: "400px" }}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-medium text-foreground">{progress}</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
          <div className="p-6 bg-destructive/10 text-destructive rounded-lg text-sm max-w-md text-center">
            <p className="font-medium mb-1">DXF 文件加载失败</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Layer count badge */}
      {!isLoading && !error && layerCount > 0 && (
        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs text-muted-foreground border shadow-sm z-10">
          图层: {layerCount}
        </div>
      )}
    </div>
  );
}
