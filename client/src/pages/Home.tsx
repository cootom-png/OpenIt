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
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { Link } from "wouter";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { useAuth } from "@/_core/hooks/useAuth";
import ThreeViewer, { type ParsedMeshData } from "@/components/ThreeViewer";
import DxfViewerComponent from "@/components/DxfViewerComponent";
import DwgViewerComponent from "@/components/DwgViewerComponent";
import ImageViewer from "@/components/ImageViewer";
import VideoViewer from "@/components/VideoViewer";
import PdfViewer from "@/components/PdfViewer";
import WordViewer from "@/components/WordViewer";
import ExcelViewer from "@/components/ExcelViewer";
import { parseFile, getFileExtension } from "@/lib/fileParser";
import { trpc } from "@/lib/trpc";

type FileStatus = "idle" | "loading" | "parsing" | "ready" | "error";
type ViewerMode = "3d" | "2d-dxf" | "2d-dwg" | "image" | "video" | "pdf" | "word" | "excel" | null;

const SUPPORTED_3D = ["stp", "step", "stl"];
const SUPPORTED_2D_DXF = ["dxf"];
const SUPPORTED_2D_DWG = ["dwg"];
const SUPPORTED_IMAGE = ["jpg", "jpeg", "png", "gif"];
const SUPPORTED_VIDEO = ["mp4", "mov", "webm", "avi", "mkv", "m4v", "3gp"];
const SUPPORTED_PDF = ["pdf"];
const SUPPORTED_WORD = ["doc", "docx"];
const SUPPORTED_EXCEL = ["xls", "xlsx"];
const ALL_SUPPORTED = [...SUPPORTED_3D, ...SUPPORTED_2D_DXF, ...SUPPORTED_2D_DWG, ...SUPPORTED_IMAGE, ...SUPPORTED_VIDEO, ...SUPPORTED_PDF, ...SUPPORTED_WORD, ...SUPPORTED_EXCEL];
// On iOS Safari, the accept attribute greys out files with unrecognized MIME types
// (e.g. .stp, .dwg, .dxf). We use a broad accept to allow all files, then validate
// the extension in handleFile() instead.
const ACCEPT_STRING = "*/*";

/** Header auth buttons — shows login/register or user dropdown */
function HeaderAuth() {
  const { user: oauthUser } = useAuth();
  const { emailUser, isLoggedIn, isAdmin: isEmailAdmin, logout, isPending } = useEmailAuth();

  const isOAuthAdmin = oauthUser?.role === "admin";
  const showAdmin = isOAuthAdmin || isEmailAdmin;

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span className="max-w-[120px] truncate">{emailUser?.nickname}</span>
          {isPending && (
            <Badge variant="outline" className="text-[10px] py-0 px-1 text-yellow-600 border-yellow-300">待审核</Badge>
          )}
        </div>
        {showAdmin && (
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">管理</span>
            </Button>
          </Link>
        )}
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground" onClick={logout}>
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">退出</span>
        </Button>
      </div>
    );
  }

  // Also check OAuth user
  if (oauthUser) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span className="max-w-[120px] truncate">{oauthUser.name || oauthUser.email}</span>
        </div>
        {isOAuthAdmin && (
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">管理</span>
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Link href="/login">
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
          <LogIn className="w-3.5 h-3.5" />
          登录
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm" className="h-8 gap-1 text-xs">
          <UserPlus className="w-3.5 h-3.5" />
          注册
        </Button>
      </Link>
    </div>
  );
}

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ width: number; height: number; duration: number } | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pages: number; width: number; height: number; title?: string; author?: string } | null>(null);
  const [wordInfo, setWordInfo] = useState<{ paragraphs: number; images: number; tables: number } | null>(null);
  const [excelInfo, setExcelInfo] = useState<{ sheets: number; sheetNames: string[]; rows: number; cols: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recordUpload = trpc.fileUpload.record.useMutation();

  const handleFile = useCallback(async (file: File) => {
    const ext = getFileExtension(file.name);

    // Determine category for tracking
    const getCategory = (ext: string) => {
      if (SUPPORTED_3D.includes(ext)) return "3d";
      if (SUPPORTED_2D_DXF.includes(ext) || SUPPORTED_2D_DWG.includes(ext)) return "cad";
      if (SUPPORTED_IMAGE.includes(ext)) return "image";
      if (SUPPORTED_VIDEO.includes(ext)) return "video";
      if (SUPPORTED_PDF.includes(ext) || SUPPORTED_WORD.includes(ext) || SUPPORTED_EXCEL.includes(ext)) return "document";
      return "unknown";
    };

    if (!ALL_SUPPORTED.includes(ext)) {
      // Record unsupported file upload for analytics
      recordUpload.mutate({
        fileName: file.name,
        fileExt: ext,
        fileSize: file.size,
        mimeType: file.type || undefined,
        category: "unknown",
        isSupported: false,
      });
      setStatus("error");
      setErrorMsg(
        `不支持的文件格式: .${ext}，请上传 ${ALL_SUPPORTED.map((e) => `.${e}`).join("、")} 文件`
      );
      return;
    }

    // Record supported file upload
    recordUpload.mutate({
      fileName: file.name,
      fileExt: ext,
      fileSize: file.size,
      mimeType: file.type || undefined,
      category: getCategory(ext),
      isSupported: true,
    });

    setFileName(file.name);
    setFileSize(file.size);
    setErrorMsg("");
    setMeshData(null);
    setDxfFileUrl(null);
    setDwgFileBuffer(null);
    setDwgInfo(null);
    setImageUrl(null);
    setImageInfo(null);
    setVideoUrl(null);
    setVideoInfo(null);
    setDocFile(null);
    setPdfInfo(null);
    setWordInfo(null);
    setExcelInfo(null);

    if (SUPPORTED_PDF.includes(ext)) {
      // PDF file - use PdfViewer
      setViewerMode("pdf");
      setStatus("parsing");
      try {
        setDocFile(file);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载 PDF 文件时发生错误");
      }
    } else if (SUPPORTED_WORD.includes(ext)) {
      // Word file - use WordViewer
      setViewerMode("word");
      setStatus("parsing");
      try {
        setDocFile(file);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载 Word 文件时发生错误");
      }
    } else if (SUPPORTED_EXCEL.includes(ext)) {
      // Excel file - use ExcelViewer
      setViewerMode("excel");
      setStatus("parsing");
      try {
        setDocFile(file);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载 Excel 文件时发生错误");
      }
    } else if (SUPPORTED_VIDEO.includes(ext)) {
      // Video file - use VideoViewer
      setViewerMode("video");
      setStatus("parsing");

      try {
        const blobUrl = URL.createObjectURL(file);
        setVideoUrl(blobUrl);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载视频文件时发生错误");
      }
    } else if (SUPPORTED_IMAGE.includes(ext)) {
      // Image file - use ImageViewer
      setViewerMode("image");
      setStatus("parsing");

      try {
        const blobUrl = URL.createObjectURL(file);
        setImageUrl(blobUrl);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载图片文件时发生错误");
      }
    } else if (SUPPORTED_2D_DWG.includes(ext)) {
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
  const isImageFile = useMemo(
    () => SUPPORTED_IMAGE.includes(fileExt),
    [fileExt]
  );
  const isVideoFile = useMemo(
    () => SUPPORTED_VIDEO.includes(fileExt),
    [fileExt]
  );
  const isPdfFile = useMemo(
    () => SUPPORTED_PDF.includes(fileExt),
    [fileExt]
  );
  const isWordFile = useMemo(
    () => SUPPORTED_WORD.includes(fileExt),
    [fileExt]
  );
  const isExcelFile = useMemo(
    () => SUPPORTED_EXCEL.includes(fileExt),
    [fileExt]
  );
  const isDocFile = isPdfFile || isWordFile || isExcelFile;

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

  const handleImageLoaded = useCallback(
    (info: { width: number; height: number }) => {
      setImageInfo(info);
    },
    []
  );

  const handleVideoLoaded = useCallback(
    (info: { width: number; height: number; duration: number }) => {
      setVideoInfo(info);
    },
    []
  );

  const handlePdfInfo = useCallback(
    (info: { pages: number; width: number; height: number; title?: string; author?: string }) => {
      setPdfInfo(info);
    },
    []
  );

  const handleWordInfo = useCallback(
    (info: { paragraphs: number; images: number; tables: number }) => {
      setWordInfo(info);
    },
    []
  );

  const handleExcelInfo = useCallback(
    (info: { sheets: number; sheetNames: string[]; rows: number; cols: number }) => {
      setExcelInfo(info);
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
      {/* Note: accept allows all files on iOS; extension validation is done in handleFile */}

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
                3D / CAD / 文档 文件预览
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-1.5">
              <Badge variant="secondary" className="text-xs">
                3D: STP / STEP / STL
              </Badge>
              <Badge variant="outline" className="text-xs">
                CAD: DXF / DWG
              </Badge>
              <Badge variant="outline" className="text-xs">
                IMG / DOC / PDF
              </Badge>
            </div>
            <HeaderAuth />
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
                      上传文件预览
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
                      <div className="flex gap-1.5 items-center">
                        <span className="text-xs text-muted-foreground font-medium">
                          图片:
                        </span>
                        <Badge variant="outline">.JPG</Badge>
                        <Badge variant="outline">.PNG</Badge>
                        <Badge variant="outline">.GIF</Badge>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-xs text-muted-foreground font-medium">
                          视频:
                        </span>
                        <Badge variant="outline">.MP4</Badge>
                        <Badge variant="outline">.MOV</Badge>
                        <Badge variant="outline">.WebM</Badge>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-xs text-muted-foreground font-medium">
                          文档:
                        </span>
                        <Badge variant="outline">.PDF</Badge>
                        <Badge variant="outline">.DOCX</Badge>
                        <Badge variant="outline">.XLSX</Badge>
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
                ) : viewerMode === "pdf" && docFile ? (
                  <PdfViewer
                    file={docFile}
                    onInfo={handlePdfInfo}
                  />
                ) : viewerMode === "word" && docFile ? (
                  <WordViewer
                    file={docFile}
                    onInfo={handleWordInfo}
                  />
                ) : viewerMode === "excel" && docFile ? (
                  <ExcelViewer
                    file={docFile}
                    onInfo={handleExcelInfo}
                  />
                ) : viewerMode === "video" ? (
                  <VideoViewer
                    videoUrl={videoUrl}
                    fileName={fileName}
                    onVideoLoaded={handleVideoLoaded}
                  />
                ) : viewerMode === "image" ? (
                  <ImageViewer
                    imageUrl={imageUrl}
                    fileName={fileName}
                    onImageLoaded={handleImageLoaded}
                  />
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
                ) : viewerMode === "video" ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5" />
                      点击播放/暂停
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      全屏播放
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      拖动进度条跳转
                    </span>
                  </>
                ) : viewerMode === "pdf" ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5" />
                      翻页浏览
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      缩放查看
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      旋转页面
                    </span>
                  </>
                ) : viewerMode === "word" ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5" />
                      滚动浏览
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      缩放查看
                    </span>
                  </>
                ) : viewerMode === "excel" ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5" />
                      滚动浏览
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      缩放查看
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      切换工作表
                    </span>
                  </>
                ) : viewerMode === "image" ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5" />
                      拖拽平移
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      滚轮缩放
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      工具栏旋转
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
                        variant={is2DFile ? "outline" : isDocFile ? "default" : isImageFile ? "default" : isVideoFile ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isPdfFile ? (
                          <span className="flex items-center gap-1">
                            <FileType className="w-3 h-3" />
                            PDF 文档
                          </span>
                        ) : isWordFile ? (
                          <span className="flex items-center gap-1">
                            <FileType className="w-3 h-3" />
                            Word 文档
                          </span>
                        ) : isExcelFile ? (
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            Excel 表格
                          </span>
                        ) : isVideoFile ? (
                          <span className="flex items-center gap-1">
                            视频文件
                          </span>
                        ) : isImageFile ? (
                          <span className="flex items-center gap-1">
                            图片文件
                          </span>
                        ) : is2DFile ? (
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
                    请先上传文件（支持 3D、CAD、图片、视频、PDF、Word、Excel）
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
                    <span className="font-medium">CAD Viewer (WebGL)</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">视图类型</span>
                    <span className="font-medium">2D WebGL 渲染</span>
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

            {/* Image Info */}
            {status === "ready" && viewerMode === "image" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    图片信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {imageInfo && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">分辨率</span>
                        <span className="font-medium">
                          {imageInfo.width} × {imageInfo.height}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">像素总数</span>
                        <span className="font-medium">
                          {(imageInfo.width * imageInfo.height).toLocaleString()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">宽高比</span>
                        <span className="font-medium">
                          {(imageInfo.width / imageInfo.height).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">透明通道</span>
                    <span className="font-medium">
                      {fileExt === "png" || fileExt === "gif" ? "支持" : "不支持"}
                    </span>
                  </div>
                  {fileExt === "gif" && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">动画</span>
                        <span className="font-medium">支持</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* PDF Info */}
            {status === "ready" && viewerMode === "pdf" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileType className="w-4 h-4" />
                    PDF 信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pdfInfo && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">页数</span>
                        <span className="font-medium">{pdfInfo.pages}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">页面尺寸</span>
                        <span className="font-medium">{pdfInfo.width} × {pdfInfo.height} pt</span>
                      </div>
                      {pdfInfo.title && (
                        <>
                          <Separator />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">标题</span>
                            <span className="font-medium truncate ml-2 max-w-[150px]" title={pdfInfo.title}>{pdfInfo.title}</span>
                          </div>
                        </>
                      )}
                      {pdfInfo.author && (
                        <>
                          <Separator />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">作者</span>
                            <span className="font-medium">{pdfInfo.author}</span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Word Info */}
            {status === "ready" && viewerMode === "word" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileType className="w-4 h-4" />
                    Word 信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {wordInfo && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">段落数</span>
                        <span className="font-medium">{wordInfo.paragraphs}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">图片数</span>
                        <span className="font-medium">{wordInfo.images}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">表格数</span>
                        <span className="font-medium">{wordInfo.tables}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Excel Info */}
            {status === "ready" && viewerMode === "excel" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Excel 信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {excelInfo && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">工作表</span>
                        <span className="font-medium">{excelInfo.sheets} 个</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">行数</span>
                        <span className="font-medium">{excelInfo.rows}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">列数</span>
                        <span className="font-medium">{excelInfo.cols}</span>
                      </div>
                      {excelInfo.sheetNames.length > 1 && (
                        <>
                          <Separator />
                          <div className="text-sm">
                            <span className="text-muted-foreground">工作表名称</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {excelInfo.sheetNames.map((name) => (
                                <Badge key={name} variant="outline" className="text-xs">{name}</Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Video Info */}
            {status === "ready" && viewerMode === "video" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    视频信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {videoInfo && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">分辨率</span>
                        <span className="font-medium">
                          {videoInfo.width} × {videoInfo.height}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">时长</span>
                        <span className="font-medium">
                          {Math.floor(videoInfo.duration / 60)}:{Math.floor(videoInfo.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">宽高比</span>
                        <span className="font-medium">
                          {(videoInfo.width / videoInfo.height).toFixed(2)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">画质</span>
                        <span className="font-medium">
                          {videoInfo.height >= 2160 ? '4K' : videoInfo.height >= 1080 ? '1080p' : videoInfo.height >= 720 ? '720p' : videoInfo.height >= 480 ? '480p' : `${videoInfo.height}p`}
                        </span>
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
                  <li>
                    <span className="font-medium text-foreground">图片</span>
                    ：支持 JPG/JPEG、PNG、GIF 格式
                  </li>
                  <li>
                    <span className="font-medium text-foreground">视频</span>
                    ：支持 MP4、MOV、WebM、AVI 格式
                  </li>
                  <li>
                    <span className="font-medium text-foreground">文档</span>
                    ：支持 PDF、Word (DOC/DOCX)、Excel (XLS/XLSX) 格式
                  </li>
                  <li>• STEP 文件使用 WASM 引擎在浏览器端解析</li>
                  <li>• DXF 文件使用 WebGL 引擎直接渲染 2D 图纸</li>
                  <li>• DWG 文件使用 CAD Viewer WebGL 引擎直接渲染</li>
                  <li>• 图片支持缩放、平移、旋转、下载</li>
                  <li>• 视频支持播放、暂停、进度跳转、全屏</li>
                  <li>• PDF 支持翻页、缩放、旋转、下载</li>
                  <li>• Word/Excel 支持在线预览和下载</li>
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
