import { useEffect, useState, useMemo } from "react";
import {
  FileBox,
  Folder,
  FolderOpen,
  FileText,
  Image,
  Film,
  FileCode,
  Archive,
  ChevronRight,
  ChevronDown,
  Package,
  Download,
  Search,
  X,
} from "lucide-react";
import { trpc } from "../lib/trpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ArchiveEntry {
  path: string;
  name: string;
  size: number;
  isDir: boolean;
  compressedSize?: number;
}

interface ArchiveViewerProps {
  file: File | null;
  s3Url?: string;
  onInfo?: (info: { totalFiles: number; totalSize: number; format: string }) => void;
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  compressedSize?: number;
  children: TreeNode[];
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext))
    return <Image className="w-4 h-4 text-green-500 shrink-0" />;
  if (["mp4", "mov", "avi", "mkv", "webm", "m4v"].includes(ext))
    return <Film className="w-4 h-4 text-purple-500 shrink-0" />;
  if (["stp", "step", "stl", "dxf", "dwg", "iges", "igs", "obj", "3mf"].includes(ext))
    return <FileBox className="w-4 h-4 text-blue-500 shrink-0" />;
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"].includes(ext))
    return <FileText className="w-4 h-4 text-amber-500 shrink-0" />;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return <Archive className="w-4 h-4 text-orange-500 shrink-0" />;
  if (["js", "ts", "py", "c", "cpp", "h", "java", "html", "css", "json", "xml"].includes(ext))
    return <FileCode className="w-4 h-4 text-cyan-500 shrink-0" />;
  return <FileText className="w-4 h-4 text-muted-foreground shrink-0" />;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildTree(entries: ArchiveEntry[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();
  const sorted = [...entries].sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.path.localeCompare(b.path);
  });
  for (const entry of sorted) {
    const parts = entry.path.replace(/\/$/, "").split("/").filter(Boolean);
    let current = root;
    let path = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      path += (path ? "/" : "") + part;
      const isLast = i === parts.length - 1;
      let node = map.get(path);
      if (!node) {
        node = {
          name: part,
          path,
          isDir: entry.isDir || !isLast,
          size: isLast ? entry.size : 0,
          compressedSize: isLast ? entry.compressedSize : 0,
          children: [],
        };
        map.set(path, node);
        current.push(node);
      }
      current = node.children;
    }
  }
  return root;
}

function nodeMatchesSearch(node: TreeNode, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (node.name.toLowerCase().includes(q)) return true;
  return node.children.some((child) => nodeMatchesSearch(child, q));
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

function TreeItem({
  node,
  depth,
  searchQuery,
  forceExpand,
}: {
  node: TreeNode;
  depth: number;
  searchQuery: string;
  forceExpand: boolean;
}) {
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const isExpanded = manualExpanded !== null ? manualExpanded : forceExpand;

  useEffect(() => {
    setManualExpanded(null);
  }, [forceExpand]);

  if (node.isDir) {
    const visibleChildren = node.children.filter((c) => nodeMatchesSearch(c, searchQuery));
    if (
      searchQuery &&
      visibleChildren.length === 0 &&
      !node.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return null;
    }
    return (
      <div>
        <div
          className="flex items-center gap-1.5 py-1 px-2 hover:bg-muted/30 rounded cursor-pointer"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => setManualExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="text-sm truncate flex-1" title={node.name}>
            <HighlightText text={node.name} query={searchQuery} />
          </span>
        </div>
        {isExpanded && (
          <div>
            {visibleChildren.map((child, i) => (
              <TreeItem
                key={child.path + i}
                node={child}
                depth={depth + 1}
                searchQuery={searchQuery}
                forceExpand={forceExpand}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1.5 py-1 px-2 hover:bg-muted/30 rounded"
      style={{ paddingLeft: `${depth * 16 + 24}px` }}
    >
      {getFileIcon(node.name)}
      <span className="text-sm truncate flex-1" title={node.name}>
        <HighlightText text={node.name} query={searchQuery} />
      </span>
      <span className="text-xs text-muted-foreground shrink-0 ml-2">{formatSize(node.size)}</span>
    </div>
  );
}

async function parseZipFile(file: File): Promise<ArchiveEntry[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const entries: ArchiveEntry[] = [];
  zip.forEach((relativePath, zipEntry) => {
    const name = relativePath.split("/").filter(Boolean).pop() || relativePath;
    const internal = zipEntry as any;
    entries.push({
      path: relativePath,
      name,
      size: internal._data?.uncompressedSize || 0,
      isDir: zipEntry.dir,
      compressedSize: internal._data?.compressedSize || 0,
    });
  });
  return entries;
}

async function parseRarFile(file: File): Promise<ArchiveEntry[]> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  const response = await fetch("/api/parse-archive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buffer: base64, filename: file.name }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "解析失败" }));
    throw new Error(err.error || "RAR 文件解析失败");
  }
  const { entries: serverEntries } = await response.json();
  return serverEntries.map((e: any) => ({
    path: e.path,
    name: e.name,
    size: e.size || 0,
    isDir: e.isDir,
    compressedSize: 0,
  }));
}

export default function ArchiveViewer({ file, s3Url, onInfo }: ArchiveViewerProps) {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const extractArchive = trpc.archive.extractAndDownload.useMutation();

  const handleExtractDownload = async () => {
    if (!file) {
      alert("请先选择文件");
      return;
    }
    setExtracting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      if (ext === "zip") {
        // ZIP: extract client-side with JSZip and use File System Access API
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(file);

        // Check if File System Access API is supported (Chrome/Edge)
        if ("showDirectoryPicker" in window) {
          try {
            const dirHandle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
            // Create a subfolder with the archive name
            const baseName = file.name.replace(/\.[^.]+$/, "");
            const subDir = await dirHandle.getDirectoryHandle(baseName, { create: true });

            // Extract all files into the subfolder
            const fileEntries = Object.entries(zip.files).filter(([_, entry]) => !entry.dir);
            for (const [path, entry] of fileEntries) {
              // Create subdirectories as needed
              const parts = path.split("/").filter(Boolean);
              let currentDir = subDir;
              for (let i = 0; i < parts.length - 1; i++) {
                currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true });
              }
              // Write the file
              const fileName = parts[parts.length - 1];
              const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
              const writable = await fileHandle.createWritable();
              const content = await entry.async("uint8array");
              await writable.write(content);
              await writable.close();
            }
            alert(`解压完成！已将 ${fileEntries.length} 个文件解压到 "${baseName}" 文件夹`);
          } catch (fsErr: any) {
            if (fsErr.name === "AbortError") {
              // User cancelled the folder picker
              return;
            }
            throw fsErr;
          }
        } else {
          // Browser does not support File System Access API
          alert("当前浏览器不支持此功能，请使用 Chrome 或 Edge 浏览器进行解压下载。");
        }
      } else {
        // RAR/7z: not supported for client-side extraction, show message
        alert("RAR/7z 格式暂不支持解压下载，请使用本地解压软件");
      }
    } catch (err: any) {
      alert(`解压失败: ${err.message}`);
    } finally {
      setExtracting(false);
    }
  };

  useEffect(() => {
    if (!file) return;
    const parse = async () => {
      setLoading(true);
      setError(null);
      setSearchQuery("");
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        let result: ArchiveEntry[];
        if (ext === "zip") {
          result = await parseZipFile(file);
        } else if (ext === "rar" || ext === "7z") {
          result = await parseRarFile(file);
        } else {
          throw new Error(`不支持的压缩格式: .${ext}`);
        }
        setEntries(result);
        const fileEntries = result.filter((e) => !e.isDir);
        const totalSize = fileEntries.reduce((sum, e) => sum + e.size, 0);
        onInfo?.({ totalFiles: fileEntries.length, totalSize, format: ext.toUpperCase() });
      } catch (err: any) {
        setError(err.message || "解析压缩文件失败");
      } finally {
        setLoading(false);
      }
    };
    parse();
  }, [file]);

  const tree = useMemo(() => buildTree(entries), [entries]);
  const fileCount = useMemo(() => entries.filter((e) => !e.isDir).length, [entries]);
  const dirCount = useMemo(() => entries.filter((e) => e.isDir).length, [entries]);
  const totalSize = useMemo(
    () => entries.filter((e) => !e.isDir).reduce((sum, e) => sum + e.size, 0),
    [entries]
  );
  const matchCount = useMemo(() => {
    if (!searchQuery) return fileCount;
    return entries.filter(
      (e) => !e.isDir && e.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).length;
  }, [entries, searchQuery, fileCount]);

  const forceExpand = searchQuery.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/20">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">正在解析压缩文件...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/20">
        <Archive className="w-12 h-12 text-destructive/50 mb-3" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/20">
        <Package className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">压缩包为空</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-background">
      {/* Summary bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b bg-muted/30">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Archive className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {file?.name.split(".").pop()?.toUpperCase()} 压缩包
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {searchQuery ? (
                <span className="text-primary font-medium">
                  {matchCount} / {fileCount}
                </span>
              ) : (
                fileCount
              )}{" "}
              个文件
            </span>
            {dirCount > 0 && <span>{dirCount} 个文件夹</span>}
            <span>解压后 {formatSize(totalSize)}</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExtractDownload}
          disabled={extracting || !file}
          className="shrink-0"
        >
          <Download className="w-4 h-4 mr-2" />
          {extracting ? "解压中..." : "解压下载"}
        </Button>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 border-b bg-background">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8 pr-8 h-8 text-sm"
            placeholder="搜索文件名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-auto p-2">
        {tree.filter((node) => nodeMatchesSearch(node, searchQuery)).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">未找到匹配的文件</p>
            <p className="text-xs mt-1 opacity-70">关键字："{searchQuery}"</p>
          </div>
        ) : (
          tree
            .filter((node) => nodeMatchesSearch(node, searchQuery))
            .map((node, i) => (
              <TreeItem
                key={node.path + i}
                node={node}
                depth={0}
                searchQuery={searchQuery}
                forceExpand={forceExpand}
              />
            ))
        )}
      </div>
    </div>
  );
}
