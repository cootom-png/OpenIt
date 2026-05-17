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
} from "lucide-react";

interface ArchiveEntry {
  path: string;
  name: string;
  size: number;
  isDir: boolean;
  compressedSize?: number;
}

interface ArchiveViewerProps {
  file: File | null;
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
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) {
    return <Image className="w-4 h-4 text-green-500 shrink-0" />;
  }
  if (["mp4", "mov", "avi", "mkv", "webm", "m4v"].includes(ext)) {
    return <Film className="w-4 h-4 text-purple-500 shrink-0" />;
  }
  if (["stp", "step", "stl", "dxf", "dwg", "iges", "igs", "obj", "3mf"].includes(ext)) {
    return <FileBox className="w-4 h-4 text-blue-500 shrink-0" />;
  }
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"].includes(ext)) {
    return <FileText className="w-4 h-4 text-amber-500 shrink-0" />;
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return <Archive className="w-4 h-4 text-orange-500 shrink-0" />;
  }
  if (["js", "ts", "py", "c", "cpp", "h", "java", "html", "css", "json", "xml"].includes(ext)) {
    return <FileCode className="w-4 h-4 text-cyan-500 shrink-0" />;
  }
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

  // Sort: directories first, then alphabetical
  const sorted = [...entries].sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.path.localeCompare(b.path);
  });

  for (const entry of sorted) {
    const parts = entry.path.replace(/\/$/, "").split("/");
    let currentPath = "";
    let parentChildren = root;

    for (let i = 0; i < parts.length; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        const node: TreeNode = {
          name: entry.name || parts[i],
          path: entry.path,
          isDir: entry.isDir,
          size: entry.size,
          compressedSize: entry.compressedSize,
          children: [],
        };
        // Avoid duplicates
        if (!map.has(currentPath)) {
          map.set(currentPath, node);
          parentChildren.push(node);
        }
      } else {
        // Ensure intermediate directories exist
        if (!map.has(currentPath)) {
          const dirNode: TreeNode = {
            name: parts[i],
            path: currentPath + "/",
            isDir: true,
            size: 0,
            children: [],
          };
          map.set(currentPath, dirNode);
          parentChildren.push(dirNode);
        }
        parentChildren = map.get(currentPath)!.children;
      }
    }
  }

  return root;
}

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (node.isDir) {
    return (
      <div>
        <div
          className="flex items-center gap-1.5 py-1 px-2 hover:bg-muted/50 rounded cursor-pointer select-none"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          {expanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="text-sm font-medium truncate">{node.name}</span>
          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
            {node.children.length} 项
          </span>
        </div>
        {expanded && (
          <div>
            {node.children.map((child, i) => (
              <TreeItem key={child.path + i} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 py-1 px-2 hover:bg-muted/30 rounded"
      style={{ paddingLeft: `${depth * 16 + 24}px` }}
    >
      {getFileIcon(node.name)}
      <span className="text-sm truncate flex-1" title={node.name}>
        {node.name}
      </span>
      <span className="text-xs text-muted-foreground shrink-0 ml-2">
        {formatSize(node.size)}
      </span>
    </div>
  );
}

async function parseZipFile(file: File): Promise<ArchiveEntry[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const entries: ArchiveEntry[] = [];

  zip.forEach((relativePath, zipEntry) => {
    const name = relativePath.split("/").filter(Boolean).pop() || relativePath;
    // Access internal _data for size info (not in public types)
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
  const { createExtractorFromData } = await import("node-unrar-js");

  const arrayBuffer = await file.arrayBuffer();
  const extractor = await createExtractorFromData({ data: arrayBuffer });
  const list = extractor.getFileList();
  const entries: ArchiveEntry[] = [];

  const fileHeaders = [...list.fileHeaders];
  for (const header of fileHeaders) {
    const pathStr = header.name;
    const name = pathStr.split(/[/\\]/).filter(Boolean).pop() || pathStr;
    entries.push({
      path: pathStr,
      name,
      size: header.unpSize || 0,
      isDir: header.flags?.directory || false,
      compressedSize: header.packSize || 0,
    });
  }

  return entries;
}

export default function ArchiveViewer({ file, onInfo }: ArchiveViewerProps) {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    const parse = async () => {
      setLoading(true);
      setError(null);
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        let result: ArchiveEntry[];

        if (ext === "zip") {
          result = await parseZipFile(file);
        } else if (ext === "rar") {
          result = await parseRarFile(file);
        } else {
          throw new Error(`不支持的压缩格式: .${ext}`);
        }

        setEntries(result);

        // Report info
        const fileEntries = result.filter((e) => !e.isDir);
        const totalSize = fileEntries.reduce((sum, e) => sum + e.size, 0);
        onInfo?.({
          totalFiles: fileEntries.length,
          totalSize,
          format: ext.toUpperCase(),
        });
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
      <div className="flex items-center gap-4 px-4 py-2.5 border-b bg-muted/30">
        <div className="flex items-center gap-1.5">
          <Archive className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {file?.name.split(".").pop()?.toUpperCase()} 压缩包
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{fileCount} 个文件</span>
          {dirCount > 0 && <span>{dirCount} 个文件夹</span>}
          <span>解压后 {formatSize(totalSize)}</span>
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-auto p-2">
        {tree.map((node, i) => (
          <TreeItem key={node.path + i} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}
