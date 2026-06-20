import { useEffect, useState, useCallback, useMemo } from "react";
import { Table, Search, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface CsvViewerProps {
  file: File;
  onInfo?: (info: { rows: number; cols: number; headers: string[] }) => void;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current.trim());
        current = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        row.push(current.trim());
        if (row.some((cell) => cell !== "")) {
          rows.push(row);
        }
        row = [];
        current = "";
        if (char === "\r") i++; // skip \n
      } else {
        current += char;
      }
    }
  }

  // Last row
  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

export default function CsvViewer({ file, onInfo }: CsvViewerProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    let cancelled = false;
    const loadCSV = async () => {
      try {
        setLoading(true);
        setError(null);

        const text = await file.text();
        if (cancelled) return;

        const rows = parseCSV(text);
        if (rows.length === 0) {
          setHeaders([]);
          setData([]);
          onInfo?.({ rows: 0, cols: 0, headers: [] });
          setLoading(false);
          return;
        }

        // First row as headers
        const headerRow = rows[0];
        const dataRows = rows.slice(1);

        setHeaders(headerRow);
        setData(dataRows);
        setCurrentPage(1);

        onInfo?.({
          rows: dataRows.length,
          cols: headerRow.length,
          headers: headerRow,
        });

        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "CSV 文件加载失败");
          setLoading(false);
        }
      }
    };
    loadCSV();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 15, 200)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 15, 50)), []);
  const fitPage = useCallback(() => setScale(100), []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/20">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">正在解析 CSV 文件...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/20">
        <Table className="w-12 h-12 text-destructive/50 mb-3" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (headers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/20">
        <Table className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">CSV 文件为空</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Table className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            CSV 表格 ({data.length} 行 × {headers.length} 列)
          </span>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-7 pr-2 py-1 text-xs border rounded bg-background w-32 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            className="p-1 hover:bg-muted rounded"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
            {scale}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1 hover:bg-muted rounded"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={fitPage}
            className="p-1 hover:bg-muted rounded"
            title="适应"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-2">
        <div
          style={{ fontSize: `${scale}%` }}
          className="min-w-full"
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-2 py-1.5 text-left text-xs font-medium text-muted-foreground w-10">
                  #
                </th>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="border border-border px-2 py-1.5 text-left text-xs font-semibold whitespace-nowrap"
                  >
                    {header || `列${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="border border-border px-2 py-1 text-xs text-muted-foreground">
                    {(currentPage - 1) * rowsPerPage + rowIdx + 1}
                  </td>
                  {headers.map((_, colIdx) => (
                    <td
                      key={colIdx}
                      className="border border-border px-2 py-1 text-xs whitespace-nowrap max-w-[300px] truncate"
                      title={row[colIdx] || ""}
                    >
                      {row[colIdx] || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30">
          <span className="text-xs text-muted-foreground">
            {searchTerm && `筛选结果: ${filteredData.length} 行 | `}
            第 {currentPage}/{totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 hover:bg-muted rounded disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 hover:bg-muted rounded disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
