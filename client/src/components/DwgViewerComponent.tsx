import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

export interface DwgViewerHandle {
  captureScreenshot: () => Promise<string | null>;
}

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
 * We keep a module-level reference to the AcApDocManager module so we don't
 * need to dynamic-import it again during cleanup.
 */
let cachedModule: any = null;

/**
 * Properly destroy the singleton AcApDocManager instance.
 * The library's destroy() is async and sets _instance = undefined internally.
 * We must await it before creating a new instance.
 */
async function destroySingleton(): Promise<void> {
  if (!cachedModule) return;
  const { AcApDocManager } = cachedModule;
  const inst = (AcApDocManager as any)._instance;
  if (inst) {
    try {
      await inst.destroy(); // async — sets AcApDocManager._instance = undefined
    } catch {
      // If destroy fails, force-clear the singleton reference
      (AcApDocManager as any)._instance = undefined;
    }
  }
}

/**
 * Monkey-patch HTMLCanvasElement.prototype.getContext within a container
 * to force preserveDrawingBuffer: true for WebGL contexts.
 * This allows us to capture screenshots from the CAD viewer's canvas.
 *
 * Returns a cleanup function that restores the original getContext.
 */
function patchGetContextForPreserveBuffer(): () => void {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  (HTMLCanvasElement.prototype as any).getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    options?: any
  ) {
    if (
      contextId === "webgl" ||
      contextId === "webgl2" ||
      contextId === "experimental-webgl"
    ) {
      const patchedOptions = {
        ...(options || {}),
        preserveDrawingBuffer: true,
      };
      return (originalGetContext as any).call(this, contextId, patchedOptions);
    }
    return (originalGetContext as any).call(this, contextId, options);
  };

  return () => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  };
}

const DwgViewerComponent = forwardRef<DwgViewerHandle, DwgViewerComponentProps>(
  function DwgViewerComponent({ fileBuffer, fileName, className, onParsed }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Expose captureScreenshot method via ref
    useImperativeHandle(ref, () => ({
      captureScreenshot: async () => {
        const container = containerRef.current;
        if (!container) return null;

        // Find the largest canvas in the container
        const canvases = container.querySelectorAll("canvas");
        let bestCanvas: HTMLCanvasElement | null = null;
        let bestArea = 0;
        canvases.forEach((c) => {
          const area = c.width * c.height;
          if (area > bestArea) {
            bestArea = area;
            bestCanvas = c;
          }
        });

        if (!bestCanvas || bestArea === 0) return null;

        const canvas = bestCanvas as HTMLCanvasElement;

        // With preserveDrawingBuffer: true (patched), toDataURL should work directly
        try {
          const dataUrl = canvas.toDataURL("image/png");
          if (dataUrl && dataUrl.length > 1000) {
            return dataUrl;
          }
        } catch (err) {
          console.warn("DWG canvas toDataURL failed:", err);
        }

        // Fallback: try readPixels
        try {
          const gl =
            canvas.getContext("webgl2") ||
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");

          if (gl) {
            const glCtx = gl as WebGLRenderingContext;
            const width = canvas.width;
            const height = canvas.height;

            const pixels = new Uint8Array(width * height * 4);
            glCtx.readPixels(
              0,
              0,
              width,
              height,
              glCtx.RGBA,
              glCtx.UNSIGNED_BYTE,
              pixels
            );

            // Check if we got meaningful content
            let hasContent = false;
            const bgR = 0x1e,
              bgG = 0x1e,
              bgB = 0x2e;
            for (let i = 0; i < pixels.length; i += 400) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              const a = pixels[i + 3];
              if (a > 0) {
                const diffR = Math.abs(r - bgR);
                const diffG = Math.abs(g - bgG);
                const diffB = Math.abs(b - bgB);
                if (diffR > 20 || diffG > 20 || diffB > 20) {
                  hasContent = true;
                  break;
                }
              }
            }

            if (hasContent) {
              const tempCanvas = document.createElement("canvas");
              tempCanvas.width = width;
              tempCanvas.height = height;
              const ctx = tempCanvas.getContext("2d")!;
              const imageData = ctx.createImageData(width, height);

              for (let y = 0; y < height; y++) {
                const srcRow = (height - 1 - y) * width * 4;
                const dstRow = y * width * 4;
                for (let x = 0; x < width * 4; x++) {
                  imageData.data[dstRow + x] = pixels[srcRow + x];
                }
              }

              ctx.putImageData(imageData, 0, 0);
              return tempCanvas.toDataURL("image/png");
            }
          }
        } catch (err) {
          console.warn("DWG WebGL readPixels failed:", err);
        }

        return null;
      },
    }));

    useEffect(() => {
      if (!fileBuffer || !containerRef.current) return;

      let cancelled = false;
      let unpatchGetContext: (() => void) | null = null;

      const loadDwg = async () => {
        setIsLoading(true);
        setError(null);
        setIsReady(false);
        setProgress("正在初始化 CAD 查看器...");

        try {
          setProgress("正在加载 CAD 引擎...");
          const mod = await import("@mlightcad/cad-simple-viewer");
          cachedModule = mod;
          const { AcApDocManager } = mod;

          if (cancelled) return;

          setProgress("正在初始化渲染引擎...");

          const currentContainer = containerRef.current!;

          // Always destroy any existing singleton first, then create fresh.
          if ((AcApDocManager as any)._instance) {
            await destroySingleton();
          }

          if (cancelled) return;

          // Clear any leftover DOM content from a previous instance
          currentContainer
            .querySelectorAll("canvas, .ml-cli-container, .ml-ccl-overlay")
            .forEach((el) => el.remove());

          // Monkey-patch getContext to force preserveDrawingBuffer: true
          // This is needed so we can capture screenshots from the WebGL canvas later
          unpatchGetContext = patchGetContextForPreserveBuffer();

          AcApDocManager.createInstance({
            container: currentContainer,
            autoResize: true,
            baseUrl:
              "https://d2xsxph8kpxj0f.cloudfront.net/310519663486221484/3j4sFbGUefQfhYED2wtVaa/cad-data/",
            webworkerFileUrls: {
              dwgParser: "/assets/libredwg-parser-worker.js",
              dxfParser: "/assets/dxf-parser-worker.js",
              mtextRender: "/assets/mtext-renderer-worker.js",
            },
          });

          // Restore original getContext after the CAD viewer has created its canvas
          if (unpatchGetContext) {
            unpatchGetContext();
            unpatchGetContext = null;
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
            setTimeout(() => {
              if (!cancelled) {
                try {
                  AcApDocManager.instance?.curView?.zoomToFitDrawing();
                } catch {
                  // Zoom is optional
                }
              }
            }, 800);

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
        } finally {
          // Ensure we always restore getContext even if an error occurs
          if (unpatchGetContext) {
            unpatchGetContext();
          }
        }
      };

      loadDwg();

      return () => {
        cancelled = true;
        if (unpatchGetContext) {
          unpatchGetContext();
        }
      };
    }, [fileBuffer, fileName]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        destroySingleton();
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
);

export default DwgViewerComponent;
