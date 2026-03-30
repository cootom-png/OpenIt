import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, RotateCcw, Maximize2, Move, FileBox, Clock, Layers, Info } from "lucide-react";
import ThreeViewer, { type ParsedMeshData } from "@/components/ThreeViewer";
import { parseFile, getFileExtension } from "@/lib/fileParser";

type FileStatus = "idle" | "loading" | "parsing" | "ready" | "error";

export default function Home() {
  const [meshData, setMeshData] = useState<ParsedMeshData | null>(null);
  const [status, setStatus] = useState<FileStatus>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [parseTime, setParseTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [meshCount, setMeshCount] = useState<number>(0);
  const [vertexCount, setVertexCount] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const ext = getFileExtension(file.name);
    if (!["stp", "step", "stl"].includes(ext)) {
      setStatus("error");
      setErrorMsg(`不支持的文件格式: .${ext}，请上传 .stp、.step 或 .stl 文件`);
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setStatus("parsing");
    setErrorMsg("");
    setMeshData(null);

    try {
      const { data, parseTime: pt } = await parseFile(file);
      setMeshData(data);
      setParseTime(pt);
      setMeshCount(data.meshes.length);

      let totalVerts = 0;
      data.meshes.forEach((m) => {
        totalVerts += m.attributes.position.array.length / 3;
      });
      setVertexCount(totalVerts);

      setStatus("ready");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "解析文件时发生错误");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <FileBox className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">CORITON 康瑞通</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">3D 文件预览测试</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            支持 STP / STEP / STL
          </Badge>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: 3D Viewer */}
          <div className="space-y-4">
            {/* Upload Area / Viewer */}
            <Card className="overflow-hidden">
              <div
                className={`relative ${
                  status === "ready" ? "h-[calc(100vh-220px)] min-h-[500px]" : ""
                }`}
              >
                {status === "idle" || status === "error" ? (
                  <div
                    className={`p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                      isDragOver
                        ? "bg-primary/5 border-2 border-dashed border-primary"
                        : "bg-muted/30 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    style={{ minHeight: "500px" }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".stp,.step,.stl"
                      className="hidden"
                      onChange={handleInputChange}
                    />
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      上传 3D 文件
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                      将 STP、STEP 或 STL 文件拖拽到此处，或点击选择文件
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">.STP</Badge>
                      <Badge variant="outline">.STEP</Badge>
                      <Badge variant="outline">.STL</Badge>
                    </div>
                    {status === "error" && (
                      <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm max-w-md text-center">
                        {errorMsg}
                      </div>
                    )}
                  </div>
                ) : status === "parsing" ? (
                  <div
                    className="flex flex-col items-center justify-center bg-muted/30"
                    style={{ minHeight: "500px" }}
                  >
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      正在解析 3D 文件...
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {fileName} ({formatFileSize(fileSize)})
                    </p>
                    <p className="text-muted-foreground text-xs mt-2">
                      首次加载 STEP 文件需要初始化 WASM 引擎，可能需要几秒钟
                    </p>
                  </div>
                ) : (
                  <ThreeViewer meshData={meshData} />
                )}
              </div>
            </Card>

            {/* Controls hint */}
            {status === "ready" && (
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  左键拖拽旋转
                </span>
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  滚轮缩放
                </span>
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5" />
                  右键拖拽平移
                </span>
              </div>
            )}
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-4">
            {/* File Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  文件信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {status === "ready" ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">文件名</span>
                        <span className="font-medium truncate ml-2 max-w-[180px]" title={fileName}>
                          {fileName}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">文件大小</span>
                        <span className="font-medium">{formatFileSize(fileSize)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">格式</span>
                        <Badge variant="secondary" className="text-xs">
                          {getFileExtension(fileName).toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">请先上传 3D 文件</p>
                )}
              </CardContent>
            </Card>

            {/* Model Stats */}
            {status === "ready" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    模型统计
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">零件数量</span>
                    <span className="font-medium">{meshCount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">顶点数</span>
                    <span className="font-medium">{vertexCount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      解析耗时
                    </span>
                    <span className="font-medium">{(parseTime / 1000).toFixed(2)}s</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload another file */}
            {status === "ready" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                上传其他文件
              </Button>
            )}

            {/* Tips */}
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium mb-2">操作提示</h4>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• 支持 STP/STEP 和 STL 格式的 3D 文件</li>
                  <li>• STEP 文件会在浏览器中实时解析（使用 WASM）</li>
                  <li>• 鼠标左键拖拽旋转模型</li>
                  <li>• 鼠标滚轮缩放模型</li>
                  <li>• 鼠标右键拖拽平移视角</li>
                  <li>• 大文件解析可能需要较长时间</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
