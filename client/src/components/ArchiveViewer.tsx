import React, { useState, useMemo } from "react";
import { Archive, Download, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

interface ArchiveViewerProps {
  file?: File;
  s3Url?: string;
}

interface FileEntry {
  path: string;
  name: string;
  size: number;
  isDir: boolean;
  level: number;
  children?: FileEntry[];
}

export function ArchiveViewer({ file, s3Url }: ArchiveViewerProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [extracting, setExtracting] = useState(false);
  const extractArchive = trpc.archive.extractAndDownload.useMutation();

  const parseZipFile = async (zipFile: File): Promise<FileEntry[]> => {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(zipFile);

    const entries: FileEntry[] = [];
    const pathMap = new Map<string, FileEntry>();

    Object.entries(zip.files).forEach(([path, entry]) => {
      const parts = path.split("/").filter((p) => p);
      const isDir = entry.dir;

      let currentPath = "";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLastPart = i === parts.length - 1;
        const isDirectory = isDir || !isLastPart;

        if (!pathMap.has(currentPath)) {
          const newEntry: FileEntry = {
            path: currentPath,
            name: part,
            size: isLastPart ? entry._data?.uncompressedSize || 0 : 0,
            isDir: isDirectory,
            level: i,
            children: [],
          };

          if (parentPath) {
            const parent = pathMap.get(parentPath);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(newEntry);
            }
          } else {
            entries.push(newEntry);
          }

          pathMap.set(currentPath, newEntry);
        }
      }
    });

    return entries;
  };

  const fileTree = useMemo(() => {
    if (!file) return [];
    const parseFile = async () => {
      try {
        return await parseZipFile(file);
      } catch {
        return [];
      }
    };
    let result: FileEntry[] = [];
    parseFile().then((r) => (result = r));
    return result;
  }, [file]);

  const flattenTree = (entries: FileEntry[]): FileEntry[] => {
    const flat: FileEntry[] = [];
    const traverse = (items: FileEntry[]) => {
      items.forEach((item) => {
        flat.push(item);
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(entries);
    return flat;
  };

  const allFiles = useMemo(() => flattenTree(fileTree), [fileTree]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return allFiles;

    const query = searchQuery.toLowerCase();
    const matchedPaths = new Set<string>();
    const matchedFiles: FileEntry[] = [];

    allFiles.forEach((file) => {
      if (file.name.toLowerCase().includes(query)) {
        matchedFiles.push(file);
        let currentPath = file.path;
        while (currentPath) {
          matchedPaths.add(currentPath);
          const lastSlash = currentPath.lastIndexOf("/");
          currentPath = lastSlash > 0 ? currentPath.substring(0, lastSlash) : "";
        }
      }
    });

    const expandedSet = new Set(expandedDirs);
    matchedPaths.forEach((p) => expandedSet.add(p));
    setExpandedDirs(expandedSet);

    return matchedFiles;
  }, [searchQuery, allFiles, expandedDirs]);

  const fileCount = allFiles.filter((f) => !f.isDir).length;
  const dirCount = allFiles.filter((f) => f.isDir).length;
  const matchCount = filteredFiles.filter((f) => !f.isDir).length;
  const totalSize = allFiles
    .filter((f) => !f.isDir)
    .reduce((sum, f) => sum + f.size, 0);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
  };

  const toggleDir = (path: string) => {
    const newSet = new Set(expandedDirs);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    setExpandedDirs(newSet);
  };

  const renderTree = (items: FileEntry[], depth = 0): React.ReactNode[] => {
    return items
      .filter((item) => {
        if (!searchQuery) return true;
        if (!item.isDir) return filteredFiles.includes(item);
        return item.children?.some((child) => filteredFiles.includes(child));
      })
      .map((item) => (
        <div key={item.path} style={{ marginLeft: `${depth * 16}px` }}>
          <div className="flex items-center gap-2 py-1 px-2 hover:bg-muted rounded text-sm">
            {item.isDir ? (
              <>
                <button
                  onClick={() => toggleDir(item.path)}
                  className="p-0 h-4 w-4 flex items-center justify-center"
                >
                  <span className="text-xs">
                    {expandedDirs.has(item.path) ? "▼" : "▶"}
                  </span>
                </button>
                <span>📁</span>
                <span className="font-medium">{item.name}</span>
              </>
            ) : (
              <>
                <span className="w-4"></span>
                <span>📄</span>
                <span>
                  {searchQuery && item.name.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                    <>
                      {item.name.substring(
                        0,
                        item.name.toLowerCase().indexOf(searchQuery.toLowerCase())
                      )}
                      <mark className="bg-yellow-200 no-underline">
                        {item.name.substring(
                          item.name.toLowerCase().indexOf(searchQuery.toLowerCase()),
                          item.name.toLowerCase().indexOf(searchQuery.toLowerCase()) +
                            searchQuery.length
                        )}
                      </mark>
                      {item.name.substring(
                        item.name.toLowerCase().indexOf(searchQuery.toLowerCase()) +
                          searchQuery.length
                      )}
                    </>
                  ) : (
                    item.name
                  )}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatSize(item.size)}
                </span>
              </>
            )}
          </div>
          {item.isDir &&
            expandedDirs.has(item.path) &&
            item.children &&
            renderTree(item.children, depth + 1)}
        </div>
      ));
  };

  const handleExtractDownload = async () => {
    if (!file) {
      alert("请先选择文件");
      return;
    }
    setExtracting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      if (ext === "zip") {
        // ZIP: extract client-side with JSZip and download all files
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(file);

        // Extract and download all files
        const fileEntries = Object.entries(zip.files).filter(
          ([_, entry]) => !entry.dir
        );
        for (const [path, entry] of fileEntries) {
          const content = await entry.async("blob");
          const fileName = path.split("/").filter(Boolean).pop() || path;
          const url = URL.createObjectURL(content);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          // Small delay between downloads to avoid browser blocking
          await new Promise((r) => setTimeout(r, 500));
        }
        alert(`解压完成！已下载 ${fileEntries.length} 个文件到浏览器默认下载位置。`);
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

  if (!file) {
    return null;
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
          title="点击下载解压后的所有文件到浏览器默认下载位置"
        >
          <Download className="w-4 h-4 mr-2" />
          {extracting ? "解压中..." : "解压下载"}
        </Button>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 border-b bg-background">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索文件名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2.5 p-0 h-4 w-4 flex items-center justify-center hover:bg-muted rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-auto p-3">
        {filteredFiles.length === 0 && searchQuery ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            未找到匹配的文件
          </div>
        ) : (
          <div className="space-y-0">{renderTree(fileTree)}</div>
        )}
      </div>
    </div>
  );
}
