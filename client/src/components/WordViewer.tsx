import { useEffect, useState, useCallback, useRef } from "react";
import mammoth from "mammoth";
import { Download, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface WordViewerProps {
  file: File;
  hideDownload?: boolean;
  onInfo?: (info: {
    paragraphs: number;
    images: number;
    tables: number;
  }) => void;
}

export default function WordViewer({ file, hideDownload, onInfo }: WordViewerProps) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(100);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const loadDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
            ],
          }
        );

        if (cancelled) return;

        setHtml(result.value);

        // Parse stats from HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = result.value;
        const paragraphs = tempDiv.querySelectorAll("p").length;
        const images = tempDiv.querySelectorAll("img").length;
        const tables = tempDiv.querySelectorAll("table").length;

        onInfo?.({ paragraphs, images, tables });
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Word 文件加载失败");
          setLoading(false);
        }
      }
    };
    loadDoc();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const zoomIn = useCallback(
    () => setScale((s) => Math.min(s + 15, 200)),
    []
  );
  const zoomOut = useCallback(
    () => setScale((s) => Math.max(s - 15, 50)),
    []
  );
  const fitPage = useCallback(() => setScale(100), []);

  const downloadFile = useCallback(() => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [file]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            正在解析 Word 文档...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30">
        <div className="text-center text-destructive">
          <p className="text-sm">Word 加载失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-muted/20">
      {/* Document content */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <div
          ref={contentRef}
          className="bg-white shadow-lg rounded-sm max-w-[800px] w-full"
          style={{
            padding: `${40 * (scale / 100)}px ${60 * (scale / 100)}px`,
            transform: `scale(${scale / 100})`,
            transformOrigin: "top center",
          }}
        >
          <style>{`
            .word-content h1 { font-size: 24px; font-weight: 700; margin: 16px 0 8px; color: #1a1a1a; }
            .word-content h2 { font-size: 20px; font-weight: 600; margin: 14px 0 6px; color: #1a1a1a; }
            .word-content h3 { font-size: 16px; font-weight: 600; margin: 12px 0 4px; color: #1a1a1a; }
            .word-content p { font-size: 14px; line-height: 1.8; margin: 4px 0; color: #333; }
            .word-content table { border-collapse: collapse; width: 100%; margin: 12px 0; }
            .word-content td, .word-content th { border: 1px solid #ddd; padding: 8px 12px; font-size: 13px; }
            .word-content th { background: #f5f5f5; font-weight: 600; }
            .word-content img { max-width: 100%; height: auto; margin: 8px 0; }
            .word-content ul, .word-content ol { padding-left: 24px; margin: 8px 0; }
            .word-content li { font-size: 14px; line-height: 1.8; color: #333; }
            .word-content strong { font-weight: 600; }
            .word-content em { font-style: italic; }
          `}</style>
          <div
            className="word-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur border-t">
        <span className="text-xs text-muted-foreground">
          缩放: {scale}%
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={fitPage}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="重置缩放"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          {!hideDownload && (
            <button
              onClick={downloadFile}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title="下载"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
