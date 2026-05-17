import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileBox,
  Info,
  ArrowLeft,
  User,
  Clock,
  Layers,
  FileType,
  RotateCcw,
  Maximize2,
  Move,
  Share2,
  Download,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import ThreeViewer, { type ParsedMeshData } from "@/components/ThreeViewer";
import DxfViewerComponent from "@/components/DxfViewerComponent";
import DwgViewerComponent from "@/components/DwgViewerComponent";
import ImageViewer from "@/components/ImageViewer";
import VideoViewer from "@/components/VideoViewer";
import PdfViewer from "@/components/PdfViewer";
import WordViewer from "@/components/WordViewer";
import ExcelViewer from "@/components/ExcelViewer";
import ArchiveViewer from "@/components/ArchiveViewer";
import { parseFile, getFileExtension } from "@/lib/fileParser";

const SUPPORTED_3D = ["stp", "step", "stl", "obj", "3mf", "igs", "iges"];
const SUPPORTED_2D_DXF = ["dxf"];
const SUPPORTED_2D_DWG = ["dwg"];
const SUPPORTED_IMAGE = ["jpg", "jpeg", "png", "gif"];
const SUPPORTED_VIDEO = ["mp4", "mov", "webm", "avi", "mkv", "m4v", "3gp"];
const SUPPORTED_PDF = ["pdf"];
const SUPPORTED_WORD = ["doc", "docx"];
const SUPPORTED_EXCEL = ["xls", "xlsx"];
const SUPPORTED_ARCHIVE = ["zip", "rar"];

type ViewerMode = "3d" | "2d-dxf" | "2d-dwg" | "image" | "video" | "pdf" | "word" | "excel" | "archive" | null;
type FileStatus = "idle" | "loading" | "parsing" | "ready" | "error";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d: Date | string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export default function ShareView() {
  const params = useParams<{ token: string }>();
  const token = params.token || "";

  const { data: sharedFile, isLoading, error } = trpc.share.getByToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // Viewer state
  const [meshData, setMeshData] = useState<ParsedMeshData | null>(null);
  const [dxfFileUrl, setDxfFileUrl] = useState<string | null>(null);
  const [dwgFileBuffer, setDwgFileBuffer] = useState<ArrayBuffer | null>(null);
  const [viewerMode, setViewerMode] = useState<ViewerMode>(null);
  const [status, setStatus] = useState<FileStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [meshCount, setMeshCount] = useState(0);
  const [vertexCount, setVertexCount] = useState(0);
  const [parseTime, setParseTime] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ width: number; height: number; duration: number } | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pages: number; width: number; height: number; title?: string; author?: string } | null>(null);
  const [wordInfo, setWordInfo] = useState<{ paragraphs: number; images: number; tables: number } | null>(null);
  const [excelInfo, setExcelInfo] = useState<{ sheets: number; sheetNames: string[]; rows: number; cols: number } | null>(null);
  const [dwgInfo, setDwgInfo] = useState<{ entityCount: number; layerCount: number } | null>(null);

  const fileExt = useMemo(() => sharedFile ? sharedFile.fileExt.toLowerCase() : "", [sharedFile]);

  // Load file from S3 URL when shared file data is available
  useEffect(() => {
    if (!sharedFile?.s3Url || !fileExt) return;

    const loadFile = async () => {
      try {
        setStatus("loading");

        const ext = fileExt;

        if (SUPPORTED_IMAGE.includes(ext)) {
          setViewerMode("image");
          setImageUrl(sharedFile.s3Url);
          setStatus("ready");
        } else if (SUPPORTED_VIDEO.includes(ext)) {
          setViewerMode("video");
          setVideoUrl(sharedFile.s3Url);
          setStatus("ready");
        } else if (SUPPORTED_PDF.includes(ext)) {
          setViewerMode("pdf");
          const resp = await fetch(sharedFile.s3Url);
          const blob = await resp.blob();
          const file = new File([blob], sharedFile.fileName, { type: "application/pdf" });
          setDocFile(file);
          setStatus("ready");
        } else if (SUPPORTED_WORD.includes(ext)) {
          setViewerMode("word");
          const resp = await fetch(sharedFile.s3Url);
          const blob = await resp.blob();
          const file = new File([blob], sharedFile.fileName);
          setDocFile(file);
          setStatus("ready");
        } else if (SUPPORTED_EXCEL.includes(ext)) {
          setViewerMode("excel");
          const resp = await fetch(sharedFile.s3Url);
          const blob = await resp.blob();
          const file = new File([blob], sharedFile.fileName);
          setDocFile(file);
          setStatus("ready");
        } else if (SUPPORTED_ARCHIVE.includes(ext)) {
          setViewerMode("archive");
          const resp = await fetch(sharedFile.s3Url);
          const blob = await resp.blob();
          const file = new File([blob], sharedFile.fileName + "." + ext);
          setDocFile(file);
          setStatus("ready");
        } else if (SUPPORTED_2D_DXF.includes(ext)) {
          setViewerMode("2d-dxf");
          setDxfFileUrl(sharedFile.s3Url);
          setStatus("ready");
        } else if (SUPPORTED_2D_DWG.includes(ext)) {
          setViewerMode("2d-dwg");
          const resp = await fetch(sharedFile.s3Url);
          const buffer = await resp.arrayBuffer();
          setDwgFileBuffer(buffer);
          setStatus("ready");
        } else if (SUPPORTED_3D.includes(ext)) {
          setViewerMode("3d");
          setStatus("parsing");
          const resp = await fetch(sharedFile.s3Url);
          const blob = await resp.blob();
          const file = new File([blob], sharedFile.fileName);
          const { data, parseTime: pt } = await parseFile(file);
          setMeshData(data);
          setParseTime(pt);
          setMeshCount(data.meshes.length);
          let totalVerts = 0;
          data.meshes.forEach((m) => { totalVerts += m.attributes.position.array.length / 3; });
          setVertexCount(totalVerts);
          setStatus("ready");
        } else {
          setStatus("error");
          setErrorMsg("不支持预览此文件格式");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载文件失败");
      }
    };

    loadFile();
  }, [sharedFile?.s3Url, fileExt]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">加载分享文件...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedFile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <FileBox className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <h2 className="text-lg font-semibold mb-2">链接无效</h2>
            <p className="text-sm text-muted-foreground mb-4">
              该分享链接无效或已被关闭，请联系文件所有者获取新的链接。
            </p>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if share has expired
  if (sharedFile.expired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-orange-400" />
            <h2 className="text-lg font-semibold mb-2">分享已过期</h2>
            <p className="text-sm text-muted-foreground mb-2">
              该分享链接已超过有效期，无法查看文件内容。
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              请联系文件所有者重新开启分享。
            </p>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const is3D = SUPPORTED_3D.includes(fileExt);
  const isDxf = SUPPORTED_2D_DXF.includes(fileExt);
  const isDwg = SUPPORTED_2D_DWG.includes(fileExt);
  const is2D = isDxf || isDwg;
  const isImage = SUPPORTED_IMAGE.includes(fileExt);
  const isVideo = SUPPORTED_VIDEO.includes(fileExt);
  const isPdf = SUPPORTED_PDF.includes(fileExt);
  const isWord = SUPPORTED_WORD.includes(fileExt);
  const isExcel = SUPPORTED_EXCEL.includes(fileExt);
  const isArchive = SUPPORTED_ARCHIVE.includes(fileExt);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                首页
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">文件分享</span>
            </div>
          </div>

        </div>
      </header>

      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left: Viewer */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className={`relative ${status === "ready" ? "min-h-[400px] h-[60vh]" : "min-h-[300px]"} bg-muted/20`}>
                {status === "loading" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">正在加载文件...</p>
                    </div>
                  </div>
                )}
                {status === "parsing" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">正在解析 3D 模型...</p>
                    </div>
                  </div>
                )}
                {status === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <FileBox className="w-10 h-10 mx-auto mb-3 text-red-400" />
                      <p className="text-sm text-red-500">{errorMsg}</p>
                    </div>
                  </div>
                )}
                {status === "ready" && (
                  <>
                    {viewerMode === "pdf" && docFile ? (
                      <PdfViewer file={docFile} onInfo={(info) => setPdfInfo(info)} />
                    ) : viewerMode === "word" && docFile ? (
                      <WordViewer file={docFile} onInfo={(info) => setWordInfo(info)} />
                    ) : viewerMode === "excel" && docFile ? (
                      <ExcelViewer file={docFile} onInfo={(info) => setExcelInfo(info)} />
                    ) : viewerMode === "archive" && docFile ? (
                      <ArchiveViewer file={docFile} />
                    ) : viewerMode === "video" ? (
                      <VideoViewer videoUrl={videoUrl} fileName={sharedFile.fileName} onVideoLoaded={(info) => setVideoInfo(info)} />
                    ) : viewerMode === "image" ? (
                      <ImageViewer imageUrl={imageUrl} fileName={sharedFile.fileName} onImageLoaded={(info) => setImageInfo(info)} />
                    ) : viewerMode === "2d-dwg" ? (
                      <DwgViewerComponent fileBuffer={dwgFileBuffer} fileName={sharedFile.fileName} onParsed={(info) => setDwgInfo(info)} />
                    ) : viewerMode === "2d-dxf" ? (
                      <DxfViewerComponent fileUrl={dxfFileUrl} />
                    ) : viewerMode === "3d" ? (
                      <ThreeViewer meshData={meshData} />
                    ) : null}
                  </>
                )}
              </div>
            </Card>

            {/* Controls hint */}
            {status === "ready" && (
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                {viewerMode === "3d" ? (
                  <>
                    <span className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />左键旋转</span>
                    <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5" />滚轮缩放</span>
                    <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" />右键平移</span>
                  </>
                ) : viewerMode === "image" ? (
                  <>
                    <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" />拖拽平移</span>
                    <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5" />滚轮缩放</span>
                  </>
                ) : is2D ? (
                  <>
                    <span className="flex items-center gap-1.5"><Move className="w-3.5 h-3.5" />左键平移</span>
                    <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5" />滚轮缩放</span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-4">
            {/* Shared by */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">分享者：</span>
                  <span className="font-medium">{sharedFile.ownerNickname}</span>
                </div>
              </CardContent>
            </Card>

            {/* File Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  文件信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">文件名</span>
                  <span className="font-medium truncate ml-2 max-w-[150px]" title={sharedFile.fileName}>
                    {sharedFile.fileName}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">大小</span>
                  <span className="font-medium">{formatFileSize(sharedFile.fileSize)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">格式</span>
                  <Badge variant="secondary" className="text-xs">{fileExt.toUpperCase()}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">类别</span>
                  <Badge variant="outline" className="text-xs">
                    {is3D ? "3D 模型" : is2D ? "CAD 图纸" : isImage ? "图片" : isVideo ? "视频" : isPdf ? "PDF" : isWord ? "Word" : isExcel ? "Excel" : "文件"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />上传时间</span>
                  <span className="text-xs">{formatDate(sharedFile.createdAt)}</span>
                </div>
                {sharedFile.shareExpiresAt && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />分享到期</span>
                      <span className={`text-xs ${new Date(sharedFile.shareExpiresAt) < new Date() ? 'text-red-500' : new Date(sharedFile.shareExpiresAt).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000 ? 'text-orange-500' : 'text-green-600'}`}>
                        {formatDate(sharedFile.shareExpiresAt)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 3D Model Stats */}
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
                    <span className="font-medium">{vertexCount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">解析耗时</span>
                    <span className="font-medium">{(parseTime / 1000).toFixed(2)}s</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* DWG Info */}
            {status === "ready" && viewerMode === "2d-dwg" && dwgInfo && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileType className="w-4 h-4" />
                    图纸信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">实体数量</span>
                    <span className="font-medium">{dwgInfo.entityCount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">图层数量</span>
                    <span className="font-medium">{dwgInfo.layerCount}</span>
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Download button (only if allowDownload is true) */}
            {sharedFile.allowDownload && sharedFile.s3Url && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <a href={sharedFile.s3Url} target="_blank" rel="noopener noreferrer" download={sharedFile.fileName}>
                    <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4" />
                      下载文件
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    文件所有者已允许下载此文件
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Branding */}
            <Card className="bg-muted/30">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  由 <span className="font-medium text-foreground">CORITON 康瑞通</span> 提供文件预览服务
                </p>
                <Link href="/">
                  <Button variant="link" size="sm" className="text-xs mt-1">
                    了解更多
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
