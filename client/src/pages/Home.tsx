import { useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  RotateCcw,
  Maximize2,
  Move,
  FileBox,
  Clock,
  Layers,
  Info,
  FileType,
} from "lucide-react";
import ThreeViewer, { type ParsedMeshData } from "@/components/ThreeViewer";
import DxfViewerComponent from "@/components/DxfViewerComponent";
import DwgViewerComponent from "@/components/DwgViewerComponent";
import { parseFile, getFileExtension } from "@/lib/fileParser";

type FileStatus = "idle" | "loading" | "parsing" | "ready" | "error";
type ViewerMode = "3d" | "2d-dxf" | "2d-dwg" | null;

const SUPPORTED_3D = ["stp", "step", "stl"];
const SUPPORTED_2D_DXF = ["dxf"];
const SUPPORTED_2D_DWG = ["dwg"];
const ALL_SUPPORTED = [...SUPPORTED_3D, ...SUPPORTED_2D_DXF, ...SUPPORTED_2D_DWG];
const ACCEPT_STRING = ALL_SUPPORTED.map((e) => `.${e}`).join(",");

export default function Home() {
  const [meshData, setMeshData] = useState<ParsedMeshData | null>(null);
  const [dxfFileUrl, setDxfFileUrl] = useState<string | null>(null);
  const [dwgFileBuffer, setDwgFileBuffer] = useState<ArrayBuffer | null>(null);
  const [viewerMode, setViewerMode] = useState<ViewerMode>(null);
  const [status, setStatus] = useState<FileStatus>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [parseTime, setParseTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [meshCount, setMeshCount] = useState<number>(0);
  const [vertexCount, setVertexCount] = useState<number>(0);
  const [dwgInfo, setDwgInfo] = useState<{ entityCount: number; layerCount: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const ext = getFileExtension(file.name);

    if (!ALL_SUPPORTED.includes(ext)) {
      setStatus("error");
      setErrorMsg(
        `不支持的文件格式: .${ext}，请上传 ${ALL_SUPPORTED.map((e) => `.${e}`).join("、")} 文件`
      );
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setErrorMsg("");
    setMeshData(null);
    setDxfFileUrl(null);
    setDwgFileBuffer(null);
    setDwgInfo(null);

    if (SUPPORTED_2D_DWG.includes(ext)) {
      // DWG file - use DwgViewer (libredwg-web WASM → SVG)
      setViewerMode("2d-dwg");
      setStatus("parsing");

      try {
        const buffer = await file.arrayBuffer();
        setDwgFileBuffer(buffer);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载 DWG 文件时发生错误");
      }
    } else if (SUPPORTED_2D_DXF.includes(ext)) {
      // DXF file - use DxfViewer
      setViewerMode("2d-dxf");
      setStatus("parsing");

      try {
        const blobUrl = URL.createObjectURL(file);
        setDxfFileUrl(blobUrl);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载 DXF 文件时发生错误");
      }
    } else {
      // 3D file - use ThreeViewer
      setViewerMode("3d");
      setStatus("parsing");

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

  const fileExt = useMemo(() => getFileExtension(fileName), [fileName]);
  const is2DFile = useMemo(
    () => SUPPORTED_2D_DXF.includes(fileExt) || SUPPORTED_2D_DWG.includes(fileExt),
    [fileExt]
  );

  // Reset file input value so the same file can be re-selected
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }, []);

  const handleDwgParsed = useCallback(
    (info: { entityCount: number; layerCount: number }) => {
      setDwgInfo(info);
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input - always in DOM */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <FileBox className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                CORITON 康瑞通
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                3D / CAD 文件预览测试
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Badge variant="secondary" className="text-xs">
              3D: STP / STEP / STL
            </Badge>
            <Badge variant="outline" className="text-xs">
              CAD: DXF / DWG
            </Badge>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: Viewer Area */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div
                className={`relative ${
                  status === "ready"
                    ? "h-[calc(100vh-220px)] min-h-[500px]"
                    : ""
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
                    onClick={triggerFileInput}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      上传 3D / CAD 文件
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                      将文件拖拽到此处，或点击选择文件
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-xs text-muted-foreground font-medium">
                          3D:
                        </span>
                        <Badge variant="outline">.STP</Badge>
                        <Badge variant="outline">.STEP</Badge>
                        <Badge variant="outline">.STL</Badge>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-xs text-muted-foreground font-medium">
                          CAD:
                        </span>
                        <Badge variant="outline">.DXF</Badge>
                        <Badge variant="outline">.DWG</Badge>
                      </div>
                    </div>
                    {status === "error" && (
                      <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm max-w-md text-center">
                        {errorMsg}
                      </div>
                    )}
                  </div>
                ) : status === "parsing" && viewerMode === "3d" ? (
                  <div
                    className="flex flex-col items-center justify-center bg-muted/30"
                    style={{ minHeight: "500px" }}
                  >
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      正在解析文件...
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {fileName} ({formatFileSize(fileSize)})
                    </p>
                    <p className="text-muted-foreground text-xs mt-2">
                      首次加载 STEP 文件需要初始化 WASM 引擎，可能需要几秒钟
                    </p>
                  </div>
                ) : viewerMode === "2d-dwg" ? (
                  <DwgViewerComponent
                    fileBuffer={dwgFileBuffer}
                    fileName={fileName}
                    onParsed={handleDwgParsed}
                  />
                ) : viewerMode === "2d-dxf" ? (
                  <DxfViewerComponent fileUrl={dxfFileUrl} />
                ) : (
                  <ThreeViewer meshData={meshData} />
                )}
              </div>
            </Card>

            {/* Controls hint */}
            {status === "ready" && (
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                {viewerMode === "3d" ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5" />
                      左键拖拽平移
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      滚轮缩放
                    </span>
                  </>
                )}
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">文件名</span>
                      <span
                        className="font-medium truncate ml-2 max-w-[180px]"
                        title={fileName}
                      >
                        {fileName}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">文件大小</span>
                      <span className="font-medium">
                        {formatFileSize(fileSize)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">格式</span>
                      <Badge variant="secondary" className="text-xs">
                        {fileExt.toUpperCase()}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">类型</span>
                      <Badge
                        variant={is2DFile ? "outline" : "secondary"}
                        className="text-xs"
                      >
                        {is2DFile ? (
                          <span className="flex items-center gap-1">
                            <FileType className="w-3 h-3" />
                            2D CAD 图纸
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            3D 模型
                          </span>
                        )}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    请先上传 3D 或 CAD 文件
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Model Stats (3D only) */}
            {status === "ready" && viewerMode === "3d" && (
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
                    <span className="font-medium">
                      {vertexCount.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      解析耗时
                    </span>
                    <span className="font-medium">
                      {(parseTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* DXF Info (2D DXF only) */}
            {status === "ready" && viewerMode === "2d-dxf" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileType className="w-4 h-4" />
                    图纸信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">渲染引擎</span>
                    <span className="font-medium">DXF Viewer (WebGL)</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">视图类型</span>
                    <span className="font-medium">2D 正交投影</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* DWG Info (2D DWG only) */}
            {status === "ready" && viewerMode === "2d-dwg" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileType className="w-4 h-4" />
                    图纸信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">渲染引擎</span>
                    <span className="font-medium">LibreDWG (WASM → SVG)</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">视图类型</span>
                    <span className="font-medium">2D 矢量图</span>
                  </div>
                  {dwgInfo && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">实体数量</span>
                        <span className="font-medium">
                          {dwgInfo.entityCount.toLocaleString()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">图层数量</span>
                        <span className="font-medium">{dwgInfo.layerCount}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upload another file */}
            {status === "ready" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={triggerFileInput}
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
                  <li>
                    <span className="font-medium text-foreground">3D 文件</span>
                    ：支持 STP/STEP 和 STL 格式
                  </li>
                  <li>
                    <span className="font-medium text-foreground">CAD 图纸</span>
                    ：支持 DXF 和 DWG 格式
                  </li>
                  <li>• STEP 文件使用 WASM 引擎在浏览器端解析</li>
                  <li>• DXF 文件使用 WebGL 引擎直接渲染 2D 图纸</li>
                  <li>• DWG 文件使用 LibreDWG WASM 引擎解析并转为 SVG 预览</li>
                  <li>• 3D 模型：左键旋转 / 滚轮缩放 / 右键平移</li>
                  <li>• 2D 图纸：左键平移 / 滚轮缩放</li>
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
