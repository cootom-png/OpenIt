import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { Download, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ExcelViewerProps {
  file: File;
  onInfo?: (info: {
    sheets: number;
    sheetNames: string[];
    rows: number;
    cols: number;
  }) => void;
}

type SheetData = {
  name: string;
  headers: string[];
  rows: (string | number | null)[][];
  merges: XLSX.Range[];
};

export default function ExcelViewer({ file, onInfo }: ExcelViewerProps) {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(100);

  useEffect(() => {
    let cancelled = false;
    const loadExcel = async () => {
      try {
        setLoading(true);
        setError(null);
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        if (cancelled) return;

        const parsedSheets: SheetData[] = workbook.SheetNames.map((name) => {
          const ws = workbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json<(string | number | null)[]>(
            ws,
            { header: 1, defval: null }
          );

          // Get headers (first row) and data rows
          const headers =
            jsonData.length > 0
              ? (jsonData[0] as any[]).map((h) =>
                  h !== null && h !== undefined ? String(h) : ""
                )
              : [];
          const rows = jsonData.slice(1) as (string | number | null)[][];

          // Get merges
          const merges = ws["!merges"] || [];

          return { name, headers, rows, merges };
        });

        setSheets(parsedSheets);
        setActiveSheet(0);

        // Report info
        const firstSheet = parsedSheets[0];
        onInfo?.({
          sheets: parsedSheets.length,
          sheetNames: parsedSheets.map((s) => s.name),
          rows: firstSheet ? firstSheet.rows.length + 1 : 0,
          cols: firstSheet ? firstSheet.headers.length : 0,
        });

        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Excel 文件加载失败");
          setLoading(false);
        }
      }
    };
    loadExcel();
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

  const currentSheet = sheets[activeSheet];

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            正在解析 Excel 文件...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30">
        <div className="text-center text-destructive">
          <p className="text-sm">Excel 加载失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-muted/20">
      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div className="flex items-center gap-0 border-b bg-background/80 overflow-x-auto">
          {sheets.map((sheet, idx) => (
            <button
              key={sheet.name}
              onClick={() => setActiveSheet(idx)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                idx === activeSheet
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {/* Table content */}
      <div className="flex-1 overflow-auto p-2">
        {currentSheet && (
          <div
            style={{
              transform: `scale(${scale / 100})`,
              transformOrigin: "top left",
            }}
          >
            <table className="border-collapse text-sm w-max">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 w-10 text-center">
                    #
                  </th>
                  {currentSheet.headers.map((header, colIdx) => (
                    <th
                      key={colIdx}
                      className="sticky top-0 z-10 bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 text-left whitespace-nowrap max-w-[300px] truncate"
                    >
                      {header || String.fromCharCode(65 + colIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentSheet.rows.slice(0, 1000).map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-blue-50/50">
                    <td className="bg-slate-50 border border-slate-300 px-3 py-1 text-xs text-slate-400 text-center font-mono">
                      {rowIdx + 2}
                    </td>
                    {currentSheet.headers.map((_, colIdx) => (
                      <td
                        key={colIdx}
                        className="border border-slate-200 px-3 py-1 text-xs text-slate-700 whitespace-nowrap max-w-[300px] truncate"
                      >
                        {row[colIdx] !== null && row[colIdx] !== undefined
                          ? String(row[colIdx])
                          : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {currentSheet.rows.length > 1000 && (
              <div className="text-center py-3 text-xs text-muted-foreground">
                仅显示前 1000 行（共 {currentSheet.rows.length} 行）
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur border-t">
        <span className="text-xs text-muted-foreground">
          {currentSheet
            ? `${currentSheet.rows.length + 1} 行 × ${currentSheet.headers.length} 列`
            : ""}
          {" · "}缩放: {scale}%
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
