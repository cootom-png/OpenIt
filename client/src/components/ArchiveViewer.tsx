import React, { useState, useMemo, useEffect } from "react";
import { Archive, Download, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [fileTree, setFileTree] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const getFileExt = (f: File) => f.name.split(".").pop()?.toLowerCase() || "";

  // Parse ZIP files client-side with JSZip
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
            size: isLastPart && !isDirectory ? (entry as any)._data?.uncompressedSize || 0 : 0,
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

  // Parse RAR/7z files server-side with libarchive-wasm
  const parseArchiveServerSide = async (archiveFile: File): Promise<FileEntry[]> => {
    const arrayBuffer = await archiveFile.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    const response = await fetch("/api/parse-archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buffer: base64, filename: archiveFile.name }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to parse archive");
    }

    const { entries: rawEntries } = await response.json();

    // Build tree structure from flat entries
    const tree: FileEntry[] = [];
    const pathMap = new Map<string, FileEntry>();

    rawEntries.forEach((raw: { path: string; name: string; size: number; isDir: boolean }) => {
      const parts = raw.path.replace(/\/$/, "").split(/[\/\\]/).filter(Boolean);

      let currentPath = "";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLastPart = i === parts.length - 1;
        const isDirectory = raw.isDir || !isLastPart;

        if (!pathMap.has(currentPath)) {
          const newEntry: FileEntry = {
            path: currentPath,
            name: part,
            size: isLastPart ? raw.size : 0,
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
            tree.push(newEntry);
          }

          pathMap.set(currentPath, newEntry);
        }
      }
    });

    return tree;
  };

  useEffect(() => {
    if (!file) {
      setFileTree([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const ext = getFileExt(file);
    const parsePromise = ext === "zip" ? parseZipFile(file) : parseArchiveServerSide(file);

    parsePromise
      .then((entries) => {
        if (!cancelled) setFileTree(entries);
      })
      .catch((err) => {
        console.error("Archive parse error:", err);
        if (!cancelled) setFileTree([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
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

    allFiles.forEach((f) => {
      if (f.name.toLowerCase().includes(query)) {
        matchedFiles.push(f);
        let currentPath = f.path;
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
  }, [searchQuery, allFiles]);

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

  const getDownloadLocationTip = (): string => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      return `\n\n\u6587\u4ef6\u4f4d\u7f6e: \u6253\u5f00 [\u6587\u4ef6] App -> \u6d4f\u89c8 -> \u4e0b\u8f7d`;
    } else if (/Android/.test(ua)) {
      return `\n\n\u6587\u4ef6\u4f4d\u7f6e: \u6587\u4ef6\u7ba1\u7406\u5668 -> Download \u6587\u4ef6\u5939`;
    } else if (/Mac/.test(ua)) {
      return `\n\n\u6587\u4ef6\u4f4d\u7f6e: Finder -> \u4e0b\u8f7d (Downloads)`;
    } else if (/Win/.test(ua)) {
      return `\n\n\u6587\u4ef6\u4f4d\u7f6e: \u6b64\u7535\u8111 -> \u4e0b\u8f7d (\u6216\u6d4f\u89c8\u5668\u8bbe\u7f6e\u7684\u4e0b\u8f7d\u76ee\u5f55)`;
    }
    return "";
  };

  const handleExtractDownload = async () => {
    if (!file) {
      alert("请先选择文件");
      return;
    }
    setExtracting(true);
    try {
      const ext = getFileExt(file);

      if (ext === "zip") {
        // ZIP: extract client-side with JSZip and download all files
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(file);

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
          await new Promise((r) => setTimeout(r, 500));
        }
        alert(`解压完成！已下载 ${fileEntries.length} 个文件。${getDownloadLocationTip()}`);
      } else {
        // RAR/7z: send to server for extraction, then download each file
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        const response = await fetch("/api/extract-archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buffer: base64, filename: file.name }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Extraction failed");
        }

        const result = await response.json();

        if (result.files && result.files.length > 0) {
          // Download each extracted file
          for (const f of result.files) {
            const binaryStr = atob(f.data);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            const blob = new Blob([bytes]);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = f.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            await new Promise((r) => setTimeout(r, 500));
          }
          alert(`解压完成！已下载 ${result.files.length} 个文件。${getDownloadLocationTip()}`);
        } else {
          alert("压缩包内没有可解压的文件");
        }
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
              {getFileExt(file).toUpperCase()} 压缩包
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
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            正在解析压缩包...
          </div>
        ) : filteredFiles.length === 0 && searchQuery ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            未找到匹配的文件
          </div>
        ) : fileTree.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            压缩包内没有文件
          </div>
        ) : (
          <div className="space-y-0">{renderTree(fileTree)}</div>
        )}
      </div>
    </div>
  );
}
