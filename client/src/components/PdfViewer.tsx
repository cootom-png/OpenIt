import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  RotateCw,
} from "lucide-react";

// Set worker path for pdfjs-dist v4.x
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: File;
  onInfo?: (info: {
    pages: number;
    width: number;
    height: number;
    title?: string;
    author?: string;
  }) => void;
}

export default function PdfViewer({ file, onInfo }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        const arrayBuffer = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/cmaps/",
          cMapPacked: true,
        }).promise;

        if (cancelled) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setScale(1);
        setRotation(0);

        // Get metadata
        const metadata = await doc.getMetadata();
        const firstPage = await doc.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });

        const info: any = metadata?.info || {};
        onInfo?.({
          pages: doc.numPages,
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
          title: info.Title || undefined,
          author: info.Author || undefined,
        });

        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "PDF 加载失败");
          setLoading(false);
        }
      }
    };
    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [file]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;
    const renderPage = async () => {
      try {
        // Cancel previous render
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(currentPage);
        if (cancelled) return;

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        // Calculate scale to fit container
        const container = containerRef.current;
        let fitScale = scale;
        if (container && scale === 1) {
          const viewport = page.getViewport({ scale: 1, rotation });
          const containerWidth = container.clientWidth - 40;
          const containerHeight = container.clientHeight - 40;
          const scaleX = containerWidth / viewport.width;
          const scaleY = containerHeight / viewport.height;
          fitScale = Math.min(scaleX, scaleY, 2);
        } else {
          fitScale = scale;
        }

        const viewport = page.getViewport({ scale: fitScale, rotation });

        // Set canvas size with device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        ctx.scale(dpr, dpr);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
          canvas: canvas,
        } as any);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException" && !cancelled) {
          console.error("PDF render error:", err);
        }
      }
    };

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPage, scale, rotation]);

  const zoomIn = useCallback(() => setScale((s) => Math.min(s * 1.25, 5)), []);
  const zoomOut = useCallback(
    () => setScale((s) => Math.max(s / 1.25, 0.25)),
    []
  );
  const fitPage = useCallback(() => setScale(1), []);
  const rotate = useCallback(
    () => setRotation((r) => (r + 90) % 360),
    []
  );
  const prevPage = useCallback(
    () => setCurrentPage((p) => Math.max(p - 1, 1)),
    []
  );
  const nextPage = useCallback(
    () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    [totalPages]
  );

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
          <p className="text-sm text-muted-foreground">正在加载 PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30">
        <div className="text-center text-destructive">
          <p className="text-sm">PDF 加载失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-muted/20">
      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-4"
      >
        <canvas
          ref={canvasRef}
          className="shadow-lg"
          style={{ background: "white" }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur border-t">
        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="上一页"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="下一页"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & tools */}
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
            title="适应页面"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={rotate}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="旋转"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={downloadFile}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="下载"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
