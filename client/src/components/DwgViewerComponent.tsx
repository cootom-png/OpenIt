import { useEffect, useRef, useState, useCallback } from "react";

const LIBREDWG_WASM_CDN_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663486221484/3j4sFbGUefQfhYED2wtVaa/libredwg-web_f6ecd986.wasm";

interface DwgViewerComponentProps {
  fileBuffer: ArrayBuffer | null;
  fileName?: string;
  className?: string;
  onParsed?: (info: { entityCount: number; layerCount: number }) => void;
}

export default function DwgViewerComponent({
  fileBuffer,
  fileName,
  className,
  onParsed,
}: DwgViewerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  // Pan and zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((prev) => Math.max(0.1, Math.min(50, prev * delta)));
    },
    []
  );

  // Pan with left mouse button
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isPanningRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isPanningRef.current = true;
      lastPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPanningRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastPosRef.current.x;
    const dy = e.touches[0].clientY - lastPosRef.current.y;
    lastPosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleTouchEnd = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  useEffect(() => {
    if (!fileBuffer) return;

    let cancelled = false;

    const loadDwg = async () => {
      setIsLoading(true);
      setError(null);
      setSvgContent(null);
      resetView();
      setProgress("正在初始化 DWG 解析引擎...");

      try {
        // Dynamic import to avoid SSR issues
        setProgress("正在加载 LibreDWG WASM 引擎...");

        // We need to import the library and configure wasm path
        const libredwgModule = await import("@mlightcad/libredwg-web");
        const { LibreDwg, Dwg_File_Type } = libredwgModule;

        if (cancelled) return;

        // Create LibreDwg instance with custom wasm path
        setProgress("正在初始化 LibreDWG...");

        // Import createModule directly to control wasm loading
        const { createModule } = libredwgModule;

        // Use createModule with locateFile to point to our CDN wasm
        const wasmInstance = await createModule({
          locateFile: (filename: string) => {
            if (filename.endsWith(".wasm")) {
              return LIBREDWG_WASM_CDN_URL;
            }
            return filename;
          },
        });

        const libredwg = LibreDwg.createByWasmInstance(wasmInstance);

        if (cancelled) return;

        setProgress("正在解析 DWG 文件...");

        // Read DWG data
        const uint8Array = new Uint8Array(fileBuffer);
        const dwgData = libredwg.dwg_read_data(uint8Array, Dwg_File_Type.DWG);

        if (cancelled) return;

        setProgress("正在转换为数据库格式...");

        // Convert to DwgDatabase
        const db = libredwg.convert(dwgData);

        if (cancelled) return;

        setProgress("正在生成 SVG 预览...");

        // Use built-in dwg_to_svg method (uses SvgConverter internally)
        const svg = libredwg.dwg_to_svg(db);

        if (cancelled) return;

        // Extract info from database
        const entityCount: number = db.entities?.length ?? 0;
        const layerCount: number = db.tables?.LAYER?.entries?.length ?? 0;

        // Free memory
        libredwg.dwg_free(dwgData);

        setSvgContent(svg);
        setIsLoading(false);
        setProgress("");

        if (onParsed) {
          onParsed({ entityCount, layerCount });
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("DWG load error:", err);
          setError(
            err.message || "解析 DWG 文件失败，请确认文件格式正确"
          );
          setIsLoading(false);
          setProgress("");
        }
      }
    };

    loadDwg();

    return () => {
      cancelled = true;
    };
  }, [fileBuffer, resetView, onParsed]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#f0f4f8] ${className || ""}`}
      style={{ minHeight: "400px", cursor: isPanningRef.current ? "grabbing" : "grab" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* SVG content */}
      {svgContent && (
        <div
          ref={svgContainerRef}
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isPanningRef.current ? "none" : "transform 0.1s ease-out",
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-medium text-foreground">{progress}</p>
          {fileName && (
            <p className="text-xs text-muted-foreground mt-2">{fileName}</p>
          )}
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
          <div className="p-6 bg-destructive/10 text-destructive rounded-lg text-sm max-w-md text-center">
            <p className="font-medium mb-1">DWG 文件解析失败</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Zoom controls */}
      {svgContent && !isLoading && !error && (
        <div className="absolute bottom-3 right-3 flex gap-1 z-10">
          <button
            className="w-8 h-8 rounded bg-background/90 backdrop-blur-sm border shadow-sm flex items-center justify-center text-sm font-medium hover:bg-accent transition-colors"
            onClick={() => setScale((s) => Math.min(50, s * 1.2))}
            title="放大"
          >
            +
          </button>
          <button
            className="w-8 h-8 rounded bg-background/90 backdrop-blur-sm border shadow-sm flex items-center justify-center text-sm font-medium hover:bg-accent transition-colors"
            onClick={() => setScale((s) => Math.max(0.1, s / 1.2))}
            title="缩小"
          >
            -
          </button>
          <button
            className="w-8 h-8 rounded bg-background/90 backdrop-blur-sm border shadow-sm flex items-center justify-center text-xs hover:bg-accent transition-colors"
            onClick={resetView}
            title="重置视图"
          >
            1:1
          </button>
        </div>
      )}

      {/* Scale indicator */}
      {svgContent && !isLoading && !error && (
        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs text-muted-foreground border shadow-sm z-10">
          缩放: {(scale * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}
