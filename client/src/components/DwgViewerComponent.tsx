import { useEffect, useRef, useState } from "react";

interface DwgViewerComponentProps {
  fileBuffer: ArrayBuffer | null;
  fileName?: string;
  className?: string;
  onParsed?: (info: { entityCount: number; layerCount: number }) => void;
}

/**
 * Hide cad-simple-viewer's built-in UI elements (close button, command bar, dropdowns)
 * so they don't clash with our own UI.
 */
function hideCadViewerUI(container: HTMLElement) {
  const style = document.createElement("style");
  style.textContent = `
    .ml-cli-container {
      display: none !important;
    }
    .ml-ccl-overlay {
      display: none !important;
    }
  `;
  container.appendChild(style);
}

/**
 * Global singleton tracker for AcApDocManager.
 * The library enforces a single instance, so we must destroy and recreate
 * when mounting in a different container (e.g. navigating from Home to ShareView).
 */
let globalDocManager: any = null;
let globalContainer: HTMLElement | null = null;

export default function DwgViewerComponent({
  fileBuffer,
  fileName,
  className,
  onParsed,
}: DwgViewerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!fileBuffer || !containerRef.current) return;

    let cancelled = false;

    const loadDwg = async () => {
      setIsLoading(true);
      setError(null);
      setIsReady(false);
      setProgress("正在初始化 CAD 查看器...");

      try {
        setProgress("正在加载 CAD 引擎...");
        const { AcApDocManager } = await import("@mlightcad/cad-simple-viewer");

        if (cancelled) return;

        setProgress("正在初始化渲染引擎...");

        const currentContainer = containerRef.current!;

        // If the singleton was created with a different container (e.g. user
        // navigated from Home → ShareView), we must destroy and recreate it.
        // AcApDocManager is a strict singleton — calling createInstance when
        // one already exists throws. We detect this via our own tracking vars.
        if (globalDocManager && globalContainer !== currentContainer) {
          try {
            // Try to destroy the old instance so we can create a fresh one
            // bound to the new container.
            if (typeof globalDocManager.destroy === "function") {
              globalDocManager.destroy();
            } else if (typeof globalDocManager.dispose === "function") {
              globalDocManager.dispose();
            }
          } catch {
            // ignore destroy errors
          }

          // Force-clear the internal singleton reference so createInstance works
          try {
            (AcApDocManager as any)._instance = null;
          } catch {
            // ignore
          }

          globalDocManager = null;
          globalContainer = null;
        }

        if (!globalDocManager) {
          try {
            AcApDocManager.createInstance({
              container: currentContainer,
              autoResize: true,
              baseUrl:
                "https://d2xsxph8kpxj0f.cloudfront.net/310519663486221484/3j4sFbGUefQfhYED2wtVaa/",
            });
            globalDocManager = AcApDocManager.instance;
            globalContainer = currentContainer;
          } catch (e: any) {
            // Instance might already exist — try to reuse it
            if (
              e.message?.includes("already") ||
              e.message?.includes("singleton")
            ) {
              globalDocManager = AcApDocManager.instance;
              globalContainer = currentContainer;
            } else {
              throw e;
            }
          }
        }

        if (cancelled) return;

        setProgress("正在解析 DWG 文件...");

        const options = {
          minimumChunkSize: 1000,
          readOnly: true,
        };

        const success = await AcApDocManager.instance.openDocument(
          fileName || "drawing.dwg",
          fileBuffer,
          options
        );

        if (cancelled) return;

        if (success) {
          setIsReady(true);
          setIsLoading(false);
          setProgress("");

          // Try to get entity/layer info
          try {
            const doc = AcApDocManager.instance.curDocument;
            if (doc && onParsed) {
              const db = doc.database as any;
              const entityCount =
                db?.modelSpace?.length ??
                db?.getModelSpace?.()?.length ??
                0;
              const layerCount =
                db?.layerTable?.length ??
                db?.getLayerTable?.()?.length ??
                0;
              onParsed({ entityCount, layerCount });
            }
          } catch {
            if (onParsed) {
              onParsed({ entityCount: 0, layerCount: 0 });
            }
          }

          // Zoom to fit after rendering completes
          try {
            setTimeout(() => {
              if (!cancelled) {
                try {
                  AcApDocManager.instance.curView?.zoomToFitDrawing();
                } catch {
                  // Zoom is optional
                }
              }
            }, 800);
          } catch {
            // Zoom is optional
          }

          // Hide cad-simple-viewer's built-in UI
          if (containerRef.current) {
            hideCadViewerUI(containerRef.current);
          }
        } else {
          throw new Error(
            "DWG 文件加载失败。可能原因：\n" +
              "1. 文件版本不兼容\n" +
              "2. 文件已损坏或加密\n" +
              "3. 文件包含不支持的内容"
          );
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
  }, [fileBuffer, fileName, onParsed]);

  // Cleanup on unmount — reset the singleton so next mount gets a fresh instance
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        try {
          const { AcApDocManager } = await import("@mlightcad/cad-simple-viewer");
          if (globalDocManager) {
            if (typeof globalDocManager.destroy === "function") {
              globalDocManager.destroy();
            } else if (typeof globalDocManager.dispose === "function") {
              globalDocManager.dispose();
            }
          }
          try {
            (AcApDocManager as any)._instance = null;
          } catch {
            // ignore
          }
        } catch {
          // ignore
        }
        globalDocManager = null;
        globalContainer = null;
      };
      cleanup();
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full ${className || ""}`}
      style={{ minHeight: "400px" }}
    >
      {/* CAD Viewer Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          minHeight: "400px",
          background: "#1e1e2e",
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-medium text-foreground">{progress}</p>
          {fileName && (
            <p className="text-xs text-muted-foreground mt-2 max-w-[300px] truncate">
              {fileName}
            </p>
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

      {/* Hint */}
      {isReady && !isLoading && !error && (
        <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs text-muted-foreground border shadow-sm z-10">
          滚轮缩放 · 左键拖拽平移
        </div>
      )}
    </div>
  );
}
