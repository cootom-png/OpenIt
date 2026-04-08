import { useEffect, useRef, useState, useCallback } from "react";

const LIBREDWG_WASM_CDN_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663486221484/3j4sFbGUefQfhYED2wtVaa/libredwg-web_f6ecd986.wasm";

interface DwgViewerComponentProps {
  fileBuffer: ArrayBuffer | null;
  fileName?: string;
  className?: string;
  onParsed?: (info: { entityCount: number; layerCount: number }) => void;
}

/**
 * Process the raw SVG from libredwg:
 * 1. Parse and extract/compute the real content bounding box
 * 2. Invert colors for dark background display (CAD convention)
 * 3. Return processed SVG and dimensions info
 */
function processDwgSvg(svgString: string): {
  svg: string;
  contentWidth: number;
  contentHeight: number;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  if (!svgEl) {
    return { svg: svgString, contentWidth: 800, contentHeight: 600 };
  }

  // Step 1: Determine the real content bounds
  // First try the existing viewBox
  let vb = svgEl.getAttribute("viewBox");
  let vbX = 0, vbY = 0, vbW = 0, vbH = 0;

  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n) && isFinite(n))) {
      [vbX, vbY, vbW, vbH] = parts;
    }
  }

  // If viewBox is missing or degenerate, try width/height attrs
  if (vbW <= 0 || vbH <= 0) {
    const w = parseFloat(svgEl.getAttribute("width") || "0");
    const h = parseFloat(svgEl.getAttribute("height") || "0");
    if (w > 0 && h > 0) {
      vbX = 0; vbY = 0; vbW = w; vbH = h;
    }
  }

  // If still nothing, scan geometry elements
  if (vbW <= 0 || vbH <= 0) {
    const bounds = scanGeometryBounds(svgEl);
    if (bounds) {
      const pad = Math.max(bounds.w, bounds.h) * 0.05;
      vbX = bounds.minX - pad;
      vbY = bounds.minY - pad;
      vbW = bounds.w + pad * 2;
      vbH = bounds.h + pad * 2;
    } else {
      // Fallback
      vbX = 0; vbY = 0; vbW = 800; vbH = 600;
    }
  }

  // Step 2: Add padding around content (5%)
  const padX = vbW * 0.05;
  const padY = vbH * 0.05;
  const finalVbX = vbX - padX;
  const finalVbY = vbY - padY;
  const finalVbW = vbW + padX * 2;
  const finalVbH = vbH + padY * 2;

  // Step 3: Set viewBox and remove fixed dimensions
  svgEl.setAttribute("viewBox", `${finalVbX} ${finalVbY} ${finalVbW} ${finalVbH}`);
  svgEl.removeAttribute("width");
  svgEl.removeAttribute("height");
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svgEl.style.overflow = "visible";

  // Step 4: Invert dark colors to light for visibility on dark background
  invertColorsForDarkBg(svgEl);

  const serializer = new XMLSerializer();
  return {
    svg: serializer.serializeToString(svgEl),
    contentWidth: finalVbW,
    contentHeight: finalVbH,
  };
}

/**
 * Scan all geometry elements to find actual content bounding box
 */
function scanGeometryBounds(svgEl: SVGSVGElement): {
  minX: number; minY: number; w: number; h: number;
} | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  function update(x: number, y: number) {
    if (isFinite(x) && isFinite(y)) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  svgEl.querySelectorAll("line").forEach((el) => {
    update(parseFloat(el.getAttribute("x1") || "0"), parseFloat(el.getAttribute("y1") || "0"));
    update(parseFloat(el.getAttribute("x2") || "0"), parseFloat(el.getAttribute("y2") || "0"));
  });

  svgEl.querySelectorAll("circle").forEach((el) => {
    const cx = parseFloat(el.getAttribute("cx") || "0");
    const cy = parseFloat(el.getAttribute("cy") || "0");
    const r = parseFloat(el.getAttribute("r") || "0");
    update(cx - r, cy - r);
    update(cx + r, cy + r);
  });

  svgEl.querySelectorAll("ellipse").forEach((el) => {
    const cx = parseFloat(el.getAttribute("cx") || "0");
    const cy = parseFloat(el.getAttribute("cy") || "0");
    const rx = parseFloat(el.getAttribute("rx") || "0");
    const ry = parseFloat(el.getAttribute("ry") || "0");
    update(cx - rx, cy - ry);
    update(cx + rx, cy + ry);
  });

  svgEl.querySelectorAll("rect").forEach((el) => {
    const x = parseFloat(el.getAttribute("x") || "0");
    const y = parseFloat(el.getAttribute("y") || "0");
    const w = parseFloat(el.getAttribute("width") || "0");
    const h = parseFloat(el.getAttribute("height") || "0");
    update(x, y);
    update(x + w, y + h);
  });

  svgEl.querySelectorAll("polyline, polygon").forEach((el) => {
    const points = el.getAttribute("points") || "";
    const nums = points.trim().split(/[\s,]+/).map(Number);
    for (let i = 0; i < nums.length - 1; i += 2) {
      update(nums[i], nums[i + 1]);
    }
  });

  svgEl.querySelectorAll("path").forEach((el) => {
    const d = el.getAttribute("d") || "";
    // Use a more careful regex to extract M/L/C coordinate pairs
    const commands = d.match(/[MLCSTQAHVZmlcstqahvz][^MLCSTQAHVZmlcstqahvz]*/g);
    if (commands) {
      for (const cmd of commands) {
        const nums = cmd.slice(1).match(/-?\d+\.?\d*/g);
        if (nums) {
          const letter = cmd[0];
          if (letter === 'H' || letter === 'h') {
            // Horizontal line - only x coordinate
            update(parseFloat(nums[0]), 0);
          } else if (letter === 'V' || letter === 'v') {
            // Vertical line - only y coordinate
            update(0, parseFloat(nums[0]));
          } else if (letter !== 'Z' && letter !== 'z') {
            // Other commands have x,y pairs
            for (let i = 0; i < nums.length - 1; i += 2) {
              update(parseFloat(nums[i]), parseFloat(nums[i + 1]));
            }
          }
        }
      }
    }
  });

  svgEl.querySelectorAll("text").forEach((el) => {
    const x = parseFloat(el.getAttribute("x") || "0");
    const y = parseFloat(el.getAttribute("y") || "0");
    update(x, y);
  });

  if (!isFinite(minX) || !isFinite(maxX) || maxX <= minX || maxY <= minY) {
    return null;
  }

  return { minX, minY, w: maxX - minX, h: maxY - minY };
}

/**
 * Invert dark/black colors to light colors for dark background display.
 * This modifies the SVG DOM in place.
 */
function invertColorsForDarkBg(svgEl: SVGSVGElement) {
  const darkColors = new Set([
    "rgb(0, 0, 0)", "rgb(0,0,0)", "#000000", "#000", "black",
    "rgb(1, 1, 1)", "rgb(2, 2, 2)", // near-black
  ]);

  function isNearBlack(color: string): boolean {
    if (darkColors.has(color.trim().toLowerCase())) return true;
    // Check rgb(r,g,b) where all values < 50
    const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      if (r < 50 && g < 50 && b < 50) return true;
    }
    return false;
  }

  const lightColor = "#e0e0e0";
  const textColor = "#c0c0c0";

  // Process all elements with stroke/fill
  svgEl.querySelectorAll("*").forEach((el) => {
    const stroke = el.getAttribute("stroke");
    const fill = el.getAttribute("fill");
    const style = el.getAttribute("style");

    if (stroke && isNearBlack(stroke)) {
      el.setAttribute("stroke", lightColor);
    }
    if (fill && isNearBlack(fill)) {
      // For text, use text color; for shapes, use light color
      el.setAttribute("fill", el.tagName === "text" ? textColor : lightColor);
    }

    // Handle inline styles
    if (style) {
      let newStyle = style;
      // Replace stroke colors in style
      newStyle = newStyle.replace(/stroke\s*:\s*([^;]+)/gi, (match, val) => {
        if (isNearBlack(val.trim())) return `stroke: ${lightColor}`;
        return match;
      });
      // Replace fill colors in style
      newStyle = newStyle.replace(/fill\s*:\s*([^;]+)/gi, (match, val) => {
        if (isNearBlack(val.trim())) return `fill: ${lightColor}`;
        return match;
      });
      if (newStyle !== style) {
        el.setAttribute("style", newStyle);
      }
    }
  });

  // Set default stroke for elements that have no stroke set
  const geometryTags = ["line", "path", "polyline", "polygon", "circle", "ellipse"];
  geometryTags.forEach((tag) => {
    svgEl.querySelectorAll(tag).forEach((el) => {
      if (!el.getAttribute("stroke") && !el.getAttribute("style")?.includes("stroke")) {
        el.setAttribute("stroke", lightColor);
      }
    });
  });
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
  const [contentDims, setContentDims] = useState<{
    w: number;
    h: number;
  } | null>(null);

  // Pan and zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom - zoom toward cursor position
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => {
      const newScale = Math.max(0.05, Math.min(100, prev * factor));
      return newScale;
    });
  }, []);

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
      setContentDims(null);
      resetView();
      setProgress("正在初始化 DWG 解析引擎...");

      try {
        setProgress("正在加载 LibreDWG WASM 引擎...");

        const libredwgModule = await import("@mlightcad/libredwg-web");
        const { LibreDwg, Dwg_File_Type, createModule } = libredwgModule;

        if (cancelled) return;

        setProgress("正在下载 WASM 引擎...");

        const wasmResponse = await fetch(LIBREDWG_WASM_CDN_URL);
        if (!wasmResponse.ok) {
          throw new Error(`WASM 引擎下载失败 (HTTP ${wasmResponse.status})`);
        }
        const wasmBinary = await wasmResponse.arrayBuffer();

        if (cancelled) return;

        setProgress("正在初始化 LibreDWG...");

        // Suppress console noise during WASM init
        const originalConsoleError = console.error;
        const originalConsoleLog = console.log;
        const suppressedMessages = [
          "falling back to ArrayBuffer",
          "wasm streaming compile failed",
        ];

        console.error = (...args: any[]) => {
          const msg = args.join(" ");
          if (suppressedMessages.some((s) => msg.includes(s))) return;
          originalConsoleError.apply(console, args);
        };

        const wasmInstance = await createModule({
          wasmBinary,
          locateFile: (filename: string) => {
            if (filename.endsWith(".wasm")) {
              return LIBREDWG_WASM_CDN_URL;
            }
            return filename;
          },
        });

        console.error = originalConsoleError;
        console.log = originalConsoleLog;

        const libredwg = LibreDwg.createByWasmInstance(wasmInstance);

        if (cancelled) return;

        setProgress("正在解析 DWG 文件...");

        // Suppress the "Open dwg file with error code" log
        console.log = (...args: any[]) => {
          const msg = args.join(" ");
          if (msg.includes("Open dwg file with error code")) return;
          originalConsoleLog.apply(console, args);
        };

        const uint8Array = new Uint8Array(fileBuffer);
        const dwgData = libredwg.dwg_read_data(uint8Array, Dwg_File_Type.DWG);

        console.log = originalConsoleLog;

        if (!dwgData) {
          throw new Error(
            "DWG 文件解析失败。可能原因：\n" +
              "1. 文件版本过新（仅支持 R13-R2018）\n" +
              "2. 文件已损坏或加密\n" +
              "3. 文件包含不支持的自定义对象"
          );
        }

        if (cancelled) return;

        setProgress("正在转换为数据库格式...");

        const db = libredwg.convert(dwgData);

        if (!db) {
          throw new Error("DWG 数据转换失败，文件可能包含不兼容的内容");
        }

        if (cancelled) return;

        setProgress("正在生成 SVG 预览...");

        const svg = libredwg.dwg_to_svg(db);

        if (cancelled) return;

        if (!svg || svg.trim().length === 0) {
          throw new Error(
            "SVG 生成为空，DWG 文件可能不包含可显示的图形内容"
          );
        }

        // Process SVG for proper display
        const { svg: processedSvg, contentWidth, contentHeight } = processDwgSvg(svg);

        // Extract info
        const entityCount: number = db.entities?.length ?? 0;
        const layerCount: number = db.tables?.LAYER?.entries?.length ?? 0;

        // Free memory
        try {
          libredwg.dwg_free(dwgData);
        } catch {
          // Ignore cleanup errors
        }

        setSvgContent(processedSvg);
        setContentDims({ w: contentWidth, h: contentHeight });
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

  // Compute the aspect-ratio-aware dimensions for the SVG wrapper
  const getSvgWrapperStyle = useCallback((): React.CSSProperties => {
    if (!contentDims || !containerRef.current) {
      return { width: "100%", height: "100%", position: "absolute", inset: "20px" };
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const cW = containerRect.width - 40; // 20px padding each side
    const cH = containerRect.height - 40;

    if (cW <= 0 || cH <= 0) {
      return { width: "100%", height: "100%", position: "absolute", inset: "20px" };
    }

    const contentAR = contentDims.w / contentDims.h;
    const containerAR = cW / cH;

    let svgW: number, svgH: number;

    if (contentAR > containerAR) {
      // Content is wider than container - fit to width
      svgW = cW;
      svgH = cW / contentAR;
    } else {
      // Content is taller than container - fit to height
      svgH = cH;
      svgW = cH * contentAR;
    }

    return {
      width: `${svgW}px`,
      height: `${svgH}px`,
      position: "absolute",
      left: `${20 + (cW - svgW) / 2}px`,
      top: `${20 + (cH - svgH) / 2}px`,
    };
  }, [contentDims]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#1a1a2e] ${className || ""}`}
      style={{
        minHeight: "400px",
        cursor: isPanningRef.current ? "grabbing" : "grab",
      }}
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
          style={{
            ...getSvgWrapperStyle(),
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isPanningRef.current
              ? "none"
              : "transform 0.1s ease-out",
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
            <p className="whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}

      {/* Zoom controls */}
      {svgContent && !isLoading && !error && (
        <div className="absolute bottom-3 right-3 flex gap-1 z-10">
          <button
            className="w-8 h-8 rounded bg-background/90 backdrop-blur-sm border shadow-sm flex items-center justify-center text-sm font-medium hover:bg-accent transition-colors"
            onClick={() => setScale((s) => Math.min(100, s * 1.3))}
            title="放大"
          >
            +
          </button>
          <button
            className="w-8 h-8 rounded bg-background/90 backdrop-blur-sm border shadow-sm flex items-center justify-center text-sm font-medium hover:bg-accent transition-colors"
            onClick={() => setScale((s) => Math.max(0.05, s / 1.3))}
            title="缩小"
          >
            -
          </button>
          <button
            className="w-8 h-8 rounded bg-background/90 backdrop-blur-sm border shadow-sm flex items-center justify-center text-xs hover:bg-accent transition-colors"
            onClick={resetView}
            title="适应窗口"
          >
            ⊞
          </button>
        </div>
      )}

      {/* Scale indicator */}
      {svgContent && !isLoading && !error && (
        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs text-muted-foreground border shadow-sm z-10">
          缩放: {(scale * 100).toFixed(0)}%
          {contentDims && (
            <span className="ml-2 opacity-70">
              | 图幅: {contentDims.w.toFixed(0)} × {contentDims.h.toFixed(0)}
            </span>
          )}
        </div>
      )}

      {/* SVG styles for vector rendering */}
      <style>{`
        .dwg-svg-container svg,
        div[dangerouslysetinnerhtml] svg {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
      `}</style>
    </div>
  );
}
