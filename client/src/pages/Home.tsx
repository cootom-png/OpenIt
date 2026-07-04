import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  RotateCcw,
  Maximize2,
  Minimize2,
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
  Share2,
  Copy,
  Check,
  FolderOpen,
  HardDrive,
  Save,
  Box,
  HelpCircle,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { useAuth } from "@/_core/hooks/useAuth";
import ThreeViewer, { type ParsedMeshData, type ThreeViewerHandle } from "@/components/ThreeViewer";
import DxfViewerComponent from "@/components/DxfViewerComponent";
import DwgViewerComponent, { type DwgViewerHandle } from "@/components/DwgViewerComponent";
import ImageViewer from "@/components/ImageViewer";
import VideoViewer, { type VideoViewerHandle } from "@/components/VideoViewer";
import PdfViewer from "@/components/PdfViewer";
import WordViewer from "@/components/WordViewer";
import ExcelViewer from "@/components/ExcelViewer";
import { ArchiveViewer } from "@/components/ArchiveViewer";
import CsvViewer from "@/components/CsvViewer";
import EmailViewer from "@/components/EmailViewer";
import MarkdownViewer from "@/components/MarkdownViewer";
import CodeViewer from "@/components/CodeViewer";
import { parseFile, getFileExtension, type MeshQuality, QUALITY_PRESETS } from "@/lib/fileParser";
import { trpc } from "@/lib/trpc";
import { captureViewerThumbnail } from "@/lib/captureThumb";
import { chunkedUpload, type UploadProgress } from "@/lib/chunkedUpload";
import { captureVideoThumbnail, captureVideoThumbnailFromUrl } from "@/lib/videoThumbnail";

/**
 * Load a remote file from S3 URL into the viewer.
 * Used when navigating from Profile with ?preview=<url>&name=<filename> params.
 */
async function loadRemoteFile(
  url: string,
  name: string,
  quality: MeshQuality,
  setters: {
    setFileName: (v: string) => void;
    setFileSize: (v: number) => void;
    setStatus: (v: FileStatus) => void;
    setViewerMode: (v: ViewerMode) => void;
    setMeshData: (v: ParsedMeshData | null) => void;
    setDxfFileUrl: (v: string | null) => void;
    setDwgFileBuffer: (v: ArrayBuffer | null) => void;
    setImageUrl: (v: string | null) => void;
    setVideoUrl: (v: string | null) => void;
    setDocFile: (v: File | null) => void;
    setParseTime: (v: number) => void;
    setMeshCount: (v: number) => void;
    setVertexCount: (v: number) => void;
    setErrorMsg: (v: string) => void;
    setCurrentFileObj: (v: File | null) => void;
    setSavedFileId: (v: number | null) => void;
    setShareLink: (v: string | null) => void;
    setLinkCopied: (v: boolean) => void;
    setDwgInfo: (v: any) => void;
    setImageInfo: (v: any) => void;
    setVideoInfo: (v: any) => void;
    setPdfInfo: (v: any) => void;
    setWordInfo: (v: any) => void;
    setExcelInfo: (v: any) => void;
  }
) {
  const ext = getFileExtension(name);
  const s = setters;

  // Reset all state
  s.setFileName(name);
  s.setErrorMsg("");
  s.setCurrentFileObj(null);
  s.setSavedFileId(null);
  s.setShareLink(null);
  s.setLinkCopied(false);
  s.setMeshData(null);
  s.setDxfFileUrl(null);
  s.setDwgFileBuffer(null);
  s.setDwgInfo(null);
  s.setImageUrl(null);
  s.setImageInfo(null);
  s.setVideoUrl(null);
  s.setVideoInfo(null);
  s.setDocFile(null);
  s.setPdfInfo(null);
  s.setWordInfo(null);
  s.setExcelInfo(null);
  s.setParseTime(0);
  s.setMeshCount(0);
  s.setVertexCount(0);

  try {
    if (SUPPORTED_IMAGE.includes(ext)) {
      s.setViewerMode("image");
      s.setImageUrl(url);
      s.setStatus("ready");
    } else if (SUPPORTED_VIDEO.includes(ext)) {
      s.setViewerMode("video");
      s.setVideoUrl(url);
      s.setStatus("ready");
    } else if (SUPPORTED_PDF.includes(ext)) {
      s.setViewerMode("pdf");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const blob = await resp.blob();
      s.setFileSize(blob.size);
      s.setDocFile(new File([blob], name, { type: "application/pdf" }));
      s.setStatus("ready");
    } else if (SUPPORTED_WORD.includes(ext)) {
      s.setViewerMode("word");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const blob = await resp.blob();
      s.setFileSize(blob.size);
      s.setDocFile(new File([blob], name));
      s.setStatus("ready");
    } else if (SUPPORTED_EXCEL.includes(ext)) {
      s.setViewerMode("excel");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const blob = await resp.blob();
      s.setFileSize(blob.size);
      s.setDocFile(new File([blob], name));
      s.setStatus("ready");
    } else if (SUPPORTED_CSV.includes(ext)) {
      s.setViewerMode("csv");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const blob = await resp.blob();
      s.setFileSize(blob.size);
      s.setDocFile(new File([blob], name));
      s.setStatus("ready");
    } else if (SUPPORTED_ARCHIVE.includes(ext)) {
      s.setViewerMode("archive");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const blob = await resp.blob();
      s.setFileSize(blob.size);
      s.setDocFile(new File([blob], name));
      s.setStatus("ready");
    } else if (SUPPORTED_2D_DXF.includes(ext)) {
      s.setViewerMode("2d-dxf");
      s.setStatus("parsing");
      s.setDxfFileUrl(url);
      s.setStatus("ready");
    } else if (SUPPORTED_2D_DWG.includes(ext)) {
      s.setViewerMode("2d-dwg");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const buffer = await resp.arrayBuffer();
      s.setFileSize(buffer.byteLength);
      s.setDwgFileBuffer(buffer);
      s.setStatus("ready");
    } else if (SUPPORTED_3D.includes(ext)) {
      s.setViewerMode("3d");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const blob = await resp.blob();
      s.setFileSize(blob.size);
      const file = new File([blob], name);
      s.setCurrentFileObj(file); // Store file obj so quality change can re-parse
      const { data, parseTime: pt } = await parseFile(file, quality);
      s.setMeshData(data);
      s.setParseTime(pt);
      s.setMeshCount(data.meshes.length);
      let totalVerts = 0;
      data.meshes.forEach((m) => { totalVerts += m.attributes.position.array.length / 3; });
      s.setVertexCount(totalVerts);
      s.setStatus("ready");
    } else if (SUPPORTED_EMAIL.includes(ext)) {
      s.setViewerMode("email");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const blob = await resp.blob();
      s.setFileSize(blob.size);
      s.setDocFile(new File([blob], name));
      s.setStatus("ready");
    } else if (SUPPORTED_MARKDOWN.includes(ext)) {
      s.setViewerMode("markdown");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const blob = await resp.blob();
      s.setFileSize(blob.size);
      s.setDocFile(new File([blob], name));
      s.setStatus("ready");
    } else if (SUPPORTED_CODE.includes(ext)) {
      s.setViewerMode("code");
      s.setStatus("parsing");
      const resp = await fetch(url);
      const blob = await resp.blob();
      s.setFileSize(blob.size);
      s.setDocFile(new File([blob], name));
      s.setStatus("ready");
    } else {
      s.setStatus("error");
      s.setErrorMsg("不支持预览此文件格式");
    }
  } catch (err: any) {
    s.setStatus("error");
    s.setErrorMsg(err.message || "加载远程文件失败");
  }
}

type FileStatus = "idle" | "loading" | "parsing" | "ready" | "error";
type ViewerMode = "3d" | "2d-dxf" | "2d-dwg" | "image" | "video" | "pdf" | "word" | "excel" | "csv" | "archive" | "svg" | "email" | "markdown" | "code" | null;

const SUPPORTED_3D = ["stp", "step", "stl", "obj", "3mf", "igs", "iges"];
const SUPPORTED_2D_DXF = ["dxf"];
const SUPPORTED_2D_DWG = ["dwg"];
const SUPPORTED_IMAGE = ["jpg", "jpeg", "jfif", "png", "gif", "svg", "webp", "bmp", "tiff", "tif"];
const SUPPORTED_VIDEO = ["mp4", "mov", "webm", "avi", "mkv", "m4v", "3gp"];
const SUPPORTED_PDF = ["pdf"];
const SUPPORTED_WORD = ["doc", "docx"];
const SUPPORTED_EXCEL = ["xls", "xlsx"];
const SUPPORTED_ARCHIVE = ["zip", "rar", "7z"];
const SUPPORTED_CSV = ["csv"];
const SUPPORTED_EMAIL = ["eml", "msg"];
const SUPPORTED_MARKDOWN = ["md"];
const SUPPORTED_CODE = ["css", "txt", "log"];
const ALL_SUPPORTED = [...SUPPORTED_3D, ...SUPPORTED_2D_DXF, ...SUPPORTED_2D_DWG, ...SUPPORTED_IMAGE, ...SUPPORTED_VIDEO, ...SUPPORTED_PDF, ...SUPPORTED_WORD, ...SUPPORTED_EXCEL, ...SUPPORTED_CSV, ...SUPPORTED_ARCHIVE, ...SUPPORTED_EMAIL, ...SUPPORTED_MARKDOWN, ...SUPPORTED_CODE];
// On iOS Safari, the accept attribute greys out files with unrecognized MIME types
// (e.g. .stp, .dwg, .dxf). We use a broad accept to allow all files, then validate
// the extension in handleFile() instead.
const ACCEPT_STRING = "*/*";

/** Header auth buttons — shows login/register or user dropdown */
function HeaderAuth() {
  const { user: oauthUser, logout: oauthLogout } = useAuth();
  const { emailUser, isLoggedIn, isAdmin: isEmailAdmin, logout, isPending } = useEmailAuth();

  const isOAuthAdmin = oauthUser?.role === "admin";
  const showAdmin = isOAuthAdmin || isEmailAdmin;

  const isApproved = emailUser?.status === "approved";

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
        {isApproved && (
          <Link href="/profile">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">我的文件</span>
            </Button>
          </Link>
        )}
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
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground"
          onClick={async () => {
            await oauthLogout();
            window.location.href = "/";
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">退出</span>
        </Button>
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
  const [currentFileObj, setCurrentFileObj] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [savedFileId, setSavedFileId] = useState<number | null>(null);
  const [archiveS3Url, setArchiveS3Url] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [meshQuality, setMeshQuality] = useState<MeshQuality>("standard");
  const [isReparsing, setIsReparsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const videoViewerRef = useRef<VideoViewerHandle>(null);
  const threeViewerRef = useRef<ThreeViewerHandle>(null);
  const dwgViewerRef = useRef<DwgViewerHandle>(null);

  const { emailUser, isLoggedIn, isApproved } = useEmailAuth();

  // Fullscreen toggle for viewer container
  const toggleFullscreen = useCallback(() => {
    const container = viewerContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Set page title for SEO
  useEffect(() => {
    document.title = "零件云图 - 在线预览、分享CAD和3D文件 | STP/DWG/DXF查看器";
  }, []);

  // Listen for fullscreen change (e.g. user presses Esc)
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      // After exiting fullscreen, the canvas/viewer may retain fullscreen dimensions.
      // Dispatch a resize event after a short delay to force viewers to recalculate.
      if (!isFs) {
        // Multiple delayed resize dispatches to ensure layout has settled
        setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
        setTimeout(() => window.dispatchEvent(new Event("resize")), 200);
        setTimeout(() => window.dispatchEvent(new Event("resize")), 500);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard shortcut: F to toggle fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        // Don't trigger if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (status === "ready") {
          toggleFullscreen();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [status, toggleFullscreen]);

  // Pending thumbnail generation for a specific file ID
  const [pendingThumbFileId, setPendingThumbFileId] = useState<number | null>(null);

  // Handle ?preview=<url>&name=<filename>&generateThumb=<fileId> from Profile page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const previewUrl = params.get("preview");
    const previewName = params.get("name");
    const generateThumbId = params.get("generateThumb");
    if (previewUrl && previewName) {
      // Clean URL params without reload
      window.history.replaceState({}, "", "/");
      if (generateThumbId) {
        setPendingThumbFileId(parseInt(generateThumbId, 10));
      }
      setStatus("loading");
      loadRemoteFile(previewUrl, previewName, meshQuality, {
        setFileName, setFileSize, setStatus, setViewerMode,
        setMeshData, setDxfFileUrl, setDwgFileBuffer,
        setImageUrl, setVideoUrl, setDocFile,
        setParseTime, setMeshCount, setVertexCount,
        setErrorMsg, setCurrentFileObj, setSavedFileId,
        setShareLink, setLinkCopied, setDwgInfo,
        setImageInfo, setVideoInfo, setPdfInfo,
        setWordInfo, setExcelInfo,
      });
    }
  }, []);

  /**
   * Convert a data URL to a resized thumbnail base64 string.
   */
  const dataUrlToThumbBase64 = (dataUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 400;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const thumbDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve(thumbDataUrl.split(",")[1] || null);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  };

  /**
   * Helper: capture thumbnail using viewer ref methods first, then fallback to generic capture.
   * DWG viewer ref can capture within the rendering frame (bypasses preserveDrawingBuffer issue).
   * Three.js viewer ref forces a render + toDataURL (reliable with preserveDrawingBuffer).
   */
  const captureThumbFromViewer = async (): Promise<string | null> => {
    // Try DWG viewer ref first
    if (viewerMode === "2d-dwg" && dwgViewerRef.current) {
      try {
        const dataUrl = await dwgViewerRef.current.captureScreenshot();
        if (dataUrl && dataUrl.length > 500) {
          // Convert to resized base64 thumbnail
          return await dataUrlToThumbBase64(dataUrl);
        }
      } catch (err) {
        console.warn("DWG ref capture failed:", err);
      }
    }
    // Try Three.js viewer ref
    if (viewerMode === "3d" && threeViewerRef.current) {
      try {
        const dataUrl = await threeViewerRef.current.captureScreenshot();
        if (dataUrl && dataUrl.length > 500) {
          return await dataUrlToThumbBase64(dataUrl);
        }
      } catch (err) {
        console.warn("Three.js ref capture failed:", err);
      }
    }
    // Fallback to generic container capture (html2canvas for Word/Excel/PDF, etc.)
    const container = viewerContainerRef.current;
    if (container) {
      return await captureViewerThumbnail(container);
    }
    return null;
  };

  // Auto-generate thumbnail when preview loads with generateThumb param
  useEffect(() => {
    if (pendingThumbFileId && status === "ready" && viewerContainerRef.current) {
      const fileId = pendingThumbFileId;
      setPendingThumbFileId(null);
      (async () => {
        try {
          // For video files, use the video thumbnail capture method
          const ext = (fileName || "").split(".").pop()?.toLowerCase() || "";
          const isVideo = ["mp4","mov","webm","avi","mkv","m4v","3gp"].includes(ext);

          let thumbBase64: string | null = null;

          if (isVideo) {
            // Video thumbnail: try multiple strategies
            // Strategy 1: Capture directly from the VideoViewer's loaded video element
            // This is the most reliable since the video is already loaded and playing
            // Wait a moment for the video to be fully rendered
            await new Promise(r => setTimeout(r, 1500));
            if (videoViewerRef.current) {
              thumbBase64 = await videoViewerRef.current.captureFrame();
            }
            // Strategy 2: From local File object (if available, e.g. just uploaded)
            if (!thumbBase64 && currentFileObj) {
              thumbBase64 = await captureVideoThumbnail(currentFileObj);
            }
            // Strategy 3: Via backend proxy (avoids CORS for S3 URLs)
            if (!thumbBase64 && videoUrl) {
              thumbBase64 = await captureVideoThumbnailFromUrl(videoUrl);
            }
          } else {
            // Non-video: use the standard viewer capture
            const waitTime = viewerMode === "2d-dwg" ? 5000 : 2000;
            await new Promise(r => setTimeout(r, waitTime));
            thumbBase64 = await captureThumbFromViewer();
          }

          if (thumbBase64) {
            await uploadThumbnailMut.mutateAsync({
              fileId,
              thumbnailBase64: thumbBase64,
            });
            toast.success("缩略图已生成");
          } else {
            toast.error("缩略图截取失败，请重试");
          }
        } catch (err) {
          console.warn("Auto thumbnail generation failed:", err);
          toast.error("缩略图生成失败");
        }
      })();
    }
  }, [pendingThumbFileId, status]);
  const { data: quota, refetch: refetchQuota } = trpc.userFiles.quota.useQuery(undefined, { enabled: isLoggedIn && isApproved });
  const uploadMut = trpc.userFiles.upload.useMutation();
  const toggleShareMut = trpc.userFiles.toggleShare.useMutation();
  const uploadThumbnailMut = trpc.userFiles.uploadThumbnail.useMutation();

  const recordUpload = trpc.fileUpload.record.useMutation();

  const handleFile = useCallback(async (file: File) => {
    const ext = getFileExtension(file.name);

    // Determine category for tracking
    const getCategory = (ext: string) => {
      if (SUPPORTED_3D.includes(ext)) return "3d";
      if (SUPPORTED_2D_DXF.includes(ext) || SUPPORTED_2D_DWG.includes(ext)) return "cad";
      if (SUPPORTED_MARKDOWN.includes(ext)) return "markdown";
      if (SUPPORTED_IMAGE.includes(ext)) return "image";
      if (SUPPORTED_VIDEO.includes(ext)) return "video";
      if (SUPPORTED_PDF.includes(ext) || SUPPORTED_WORD.includes(ext) || SUPPORTED_EXCEL.includes(ext) || SUPPORTED_CSV.includes(ext)) return "document";
      if (SUPPORTED_ARCHIVE.includes(ext)) return "archive";
      if (SUPPORTED_EMAIL.includes(ext)) return "email";
      if (SUPPORTED_CODE.includes(ext)) return "code";
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
    setCurrentFileObj(file);
    setSavedFileId(null);
    setArchiveS3Url(null);
    setShareLink(null);
    setLinkCopied(false);
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
    } else if (SUPPORTED_CSV.includes(ext)) {
      // CSV file - use CsvViewer
      setViewerMode("csv");
      setStatus("parsing");
      try {
        setDocFile(file);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载 CSV 文件时发生错误");
      }
    } else if (SUPPORTED_ARCHIVE.includes(ext)) {
      // Archive file - use ArchiveViewer
      setViewerMode("archive");
      setStatus("parsing");
      try {
        setDocFile(file);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载压缩文件时发生错误");
      }
    } else if (SUPPORTED_EMAIL.includes(ext)) {
      // Email file (.eml, .msg) - use EmailViewer (preview only, no save)
      setViewerMode("email");
      setStatus("parsing");
      try {
        setDocFile(file);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载邮件文件时发生错误");
      }
    } else if (SUPPORTED_MARKDOWN.includes(ext)) {
      // Markdown file (.md) - use MarkdownViewer
      setViewerMode("markdown");
      setStatus("parsing");
      try {
        setDocFile(file);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载 Markdown 文件时发生错误");
      }
    } else if (SUPPORTED_CODE.includes(ext)) {
      // Code file (.css) - use CodeViewer
      setViewerMode("code");
      setStatus("parsing");
      try {
        setDocFile(file);
        setParseTime(0);
        setMeshCount(0);
        setVertexCount(0);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "加载代码文件时发生错误");
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
        const { data, parseTime: pt } = await parseFile(file, meshQuality);
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
  }, [meshQuality]);

  // Re-parse 3D file when quality changes
  const handleQualityChange = useCallback(async (newQuality: MeshQuality) => {
    if (newQuality === meshQuality) return;
    setMeshQuality(newQuality);
    // If we have a loaded 3D file, re-parse it with the new quality
    if (viewerMode === "3d" && currentFileObj && status === "ready") {
      const ext = getFileExtension(currentFileObj.name);
      // Only STP/STEP/IGS/IGES benefit from quality settings (STL/OBJ/3MF are mesh-based)
      if (["stp", "step", "igs", "iges"].includes(ext)) {
        setIsReparsing(true);
        setStatus("parsing");
        try {
          const { data, parseTime: pt } = await parseFile(currentFileObj, newQuality);
          setMeshData(data);
          setParseTime(pt);
          setMeshCount(data.meshes.length);
          let totalVerts = 0;
          data.meshes.forEach((m) => {
            totalVerts += m.attributes.position.array.length / 3;
          });
          setVertexCount(totalVerts);
          setStatus("ready");
          toast.success(`已切换为${QUALITY_PRESETS[newQuality].label}模式`);
        } catch (err: any) {
          setStatus("error");
          setErrorMsg(err.message || "重新解析文件时发生错误");
        } finally {
          setIsReparsing(false);
        }
      }
    }
  }, [meshQuality, viewerMode, currentFileObj, status]);

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
  const isArchiveFile = useMemo(
    () => SUPPORTED_ARCHIVE.includes(fileExt),
    [fileExt]
  );
  const isEmailFile = useMemo(
    () => SUPPORTED_EMAIL.includes(fileExt),
    [fileExt]
  );
  const isMarkdownFile = useMemo(
    () => SUPPORTED_MARKDOWN.includes(fileExt),
    [fileExt]
  );
  const isCodeFile = useMemo(
    () => SUPPORTED_CODE.includes(fileExt),
    [fileExt]
  );
  const isDocFile = isPdfFile || isWordFile || isExcelFile || isMarkdownFile || isCodeFile;

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
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <FileBox className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  零件云图
                </h1>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  3D / CAD / 文档 文件预览
                </p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/parts">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                <Box className="w-3.5 h-3.5" />
                3D零件库
              </Button>
            </Link>

            <HeaderAuth />
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: Viewer Area */}
          <div className="space-y-4 overflow-hidden">
            <Card className={`overflow-hidden ${isFullscreen ? "!rounded-none" : ""}`}>
              <div
                ref={viewerContainerRef}
                className={`relative bg-background ${
                  isFullscreen
                    ? "h-screen w-screen"
                    : status === "ready"
                      ? "h-[calc(100vh-220px)] min-h-[500px] overflow-hidden"
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
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      在线预览CAD和3D文件
                    </h2>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                      将文件拖拽到此处，或点击选择文件
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs text-primary font-medium shrink-0">
                          3D:
                        </span>
                        <Badge variant="outline">.STP</Badge>
                        <Badge variant="outline">.STEP</Badge>
                        <Badge variant="outline">.STL</Badge>
                        <Badge variant="outline">.OBJ</Badge>
                        <Badge variant="outline">.3MF</Badge>
                        <Badge variant="outline">.IGS</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs text-primary font-medium shrink-0">
                          CAD:
                        </span>
                        <Badge variant="outline">.DXF</Badge>
                        <Badge variant="outline">.DWG</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs text-primary font-medium shrink-0">
                          图片:
                        </span>
                        <Badge variant="outline">.JPG</Badge>
                        <Badge variant="outline">.JFIF</Badge>
                        <Badge variant="outline">.PNG</Badge>
                        <Badge variant="outline">.GIF</Badge>
                        <Badge variant="outline">.SVG</Badge>
                        <Badge variant="outline">.WebP</Badge>
                        <Badge variant="outline">.BMP</Badge>
                        <Badge variant="outline">.TIFF</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs text-primary font-medium shrink-0">
                          视频:
                        </span>
                        <Badge variant="outline">.MP4</Badge>
                        <Badge variant="outline">.MOV</Badge>
                        <Badge variant="outline">.WebM</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs text-primary font-medium shrink-0">
                          文档:
                        </span>
                        <Badge variant="outline">.PDF</Badge>
                        <Badge variant="outline">.DOCX</Badge>
                        <Badge variant="outline">.XLSX</Badge>
                        <Badge variant="outline">.CSV</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs text-primary font-medium shrink-0">
                          文本:
                        </span>
                        <Badge variant="outline">.MD</Badge>
                        <Badge variant="outline">.CSS</Badge>
                        <Badge variant="outline">.TXT</Badge>
                        <Badge variant="outline">.LOG</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs text-primary font-medium shrink-0">
                          压缩包:
                        </span>
                        <Badge variant="outline">.ZIP</Badge>
                        <Badge variant="outline">.RAR</Badge>
                        <Badge variant="outline">.7Z</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs text-primary font-medium shrink-0">
                          邮件:
                        </span>
                        <Badge variant="outline">.EML</Badge>
                        <Badge variant="outline">.MSG</Badge>
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
                ) : viewerMode === "csv" && docFile ? (
                  <CsvViewer
                    file={docFile}
                    onInfo={(info: { rows: number; cols: number; headers: string[] }) => {
                      setMeshCount(info.rows);
                      setVertexCount(info.cols);
                      setParseTime(0);
                    }}
                  />
                ) : viewerMode === "archive" && docFile ? (
                  <ArchiveViewer
                    file={docFile}
                    s3Url={archiveS3Url || undefined}
                  />
                ) : viewerMode === "email" && docFile ? (
                  <EmailViewer
                    file={docFile}
                    onInfo={(info) => {
                      setMeshCount(info.attachmentCount);
                      setVertexCount(0);
                      setParseTime(0);
                    }}
                  />
                ) : viewerMode === "markdown" && docFile ? (
                  <MarkdownViewer file={docFile} />
                ) : viewerMode === "code" && docFile ? (
                  <CodeViewer file={docFile} />
                ) : viewerMode === "video" ? (
                  <VideoViewer
                    ref={videoViewerRef}
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
                    ref={dwgViewerRef}
                    fileBuffer={dwgFileBuffer}
                    fileName={fileName}
                    onParsed={handleDwgParsed}
                  />
                ) : viewerMode === "2d-dxf" ? (
                  <DxfViewerComponent fileUrl={dxfFileUrl} />
                ) : (
                  <ThreeViewer ref={threeViewerRef} meshData={meshData} />
                )}
                {/* Fullscreen toggle button — hidden for archive mode to avoid overlapping the action bar */}
                {status === "ready" && viewerMode !== "archive" && (
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-3 right-3 z-50 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-md hover:bg-accent transition-colors"
                    title={isFullscreen ? "退出全屏 (Esc)" : "全屏预览 (F)"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-5 h-5 text-foreground" />
                    ) : (
                      <Maximize2 className="w-5 h-5 text-foreground" />
                    )}
                  </button>
                )}
                {/* Fullscreen overlay: filename + controls hint */}
                {isFullscreen && status === "ready" && (
                  <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
                    <div className="bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
                      <p className="text-white text-sm font-medium truncate mb-1">{fileName}</p>
                      <div className="flex items-center gap-4 text-white/70 text-xs">
                        {viewerMode === "3d" ? (
                          <>
                            <span>左键拖拽旋转</span>
                            <span>滚轮缩放</span>
                            <span>右键拖拽平移</span>
                          </>
                        ) : viewerMode === "image" ? (
                          <>
                            <span>滚轮缩放</span>
                            <span>拖拽平移</span>
                          </>
                        ) : viewerMode === "2d-dxf" || viewerMode === "2d-dwg" ? (
                          <>
                            <span>滚轮缩放</span>
                            <span>拖拽平移</span>
                          </>
                        ) : viewerMode === "video" ? (
                          <>
                            <span>点击播放/暂停</span>
                            <span>拖动进度条</span>
                          </>
                        ) : viewerMode === "pdf" ? (
                          <>
                            <span>翻页浏览</span>
                            <span>缩放查看</span>
                          </>
                        ) : null}
                        <span className="ml-auto text-white/50">按 Esc 退出全屏</span>
                      </div>
                    </div>
                  </div>
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
                      按住滚轮拖动平移
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      滚轮缩放
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Model Stats (3D only) - shown below viewer on desktop */}
            {status === "ready" && viewerMode === "3d" && (
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">零件:</span>
                      <span className="font-medium">{meshCount}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">顶点:</span>
                      <span className="font-medium">{vertexCount.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">解析:</span>
                      <span className="font-medium">{(parseTime / 1000).toFixed(2)}s</span>
                    </span>
                    {["stp", "step", "igs", "iges"].includes(fileExt) && (
                      <span className="flex items-center gap-1.5 ml-auto">
                        <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">精度:</span>
                        {(["fast", "standard", "high"] as MeshQuality[]).map((q) => (
                          <Button
                            key={q}
                            variant={meshQuality === q ? "default" : "ghost"}
                            size="sm"
                            className="h-6 px-2 text-xs"
                            disabled={isReparsing}
                            onClick={() => handleQualityChange(q)}
                          >
                            {QUALITY_PRESETS[q].label}
                          </Button>
                        ))}
                        {isReparsing && (
                          <div className="w-3 h-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        )}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Info - shown below viewer on desktop */}
            {status === "ready" && viewerMode === "image" && (
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm">
                    {imageInfo && (
                      <>
                        <span className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">分辨率:</span>
                          <span className="font-medium">{imageInfo.width} × {imageInfo.height}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">像素:</span>
                          <span className="font-medium">{(imageInfo.width * imageInfo.height).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">宽高比:</span>
                          <span className="font-medium">{(imageInfo.width / imageInfo.height).toFixed(2)}</span>
                        </span>
                      </>
                    )}
                    <span className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">透明通道:</span>
                      <span className="font-medium">{fileExt === "png" || fileExt === "gif" ? "支持" : "不支持"}</span>
                    </span>
                    {fileExt === "gif" && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">动画:</span>
                        <span className="font-medium">支持</span>
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CAD DXF Info - shown below viewer on desktop */}
            {status === "ready" && viewerMode === "2d-dxf" && (
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <FileType className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">渲染引擎:</span>
                      <span className="font-medium">DXF Viewer (WebGL)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">视图类型:</span>
                      <span className="font-medium">2D 正交投影</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CAD DWG Info - shown below viewer on desktop */}
            {status === "ready" && viewerMode === "2d-dwg" && (
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <FileType className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">渲染引擎:</span>
                      <span className="font-medium">CAD Viewer (WebGL)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">视图:</span>
                      <span className="font-medium">2D WebGL</span>
                    </span>
                    {dwgInfo && (
                      <>
                        <span className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">实体:</span>
                          <span className="font-medium">{dwgInfo.entityCount.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">图层:</span>
                          <span className="font-medium">{dwgInfo.layerCount}</span>
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                        ) : isEmailFile ? (
                          <span className="flex items-center gap-1">
                            <FileType className="w-3 h-3" />
                            邮件文件
                          </span>
                        ) : isMarkdownFile ? (
                          <span className="flex items-center gap-1">
                            <FileType className="w-3 h-3" />
                            Markdown 文本
                          </span>
                        ) : isCodeFile ? (
                          <span className="flex items-center gap-1">
                            <FileType className="w-3 h-3" />
                            代码文件
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
                    请先上传文件（支持 3D、CAD、图片、视频、PDF、Word、Excel、邮件）
                  </p>
                )}
              </CardContent>
            </Card>


            {/* Action Buttons - prioritized position */}
            {status === "ready" && (
              <Button
                className="w-full gap-2"
                onClick={triggerFileInput}
              >
                <Upload className="w-4 h-4" />
                上传其他文件
              </Button>
            )}

            {/* Save & Share Actions (logged-in approved users) */}
            {status === "ready" && isLoggedIn && isApproved && !savedFileId && currentFileObj && viewerMode !== "email" && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={async () => {
                    if (!currentFileObj || !emailUser) return;
                    if (currentFileObj.size > 100 * 1024 * 1024) {
                      toast.error("文件大小超过 100MB 限制");
                      return;
                    }
                    setIsSaving(true);
                    setUploadProgress(null);
                    try {
                      const ext = currentFileObj.name.split(".").pop()?.toLowerCase() || "";
                      const getCategory = (e: string) => {
                        if (["stp","step","stl"].includes(e)) return "3d";
                        if (["dxf","dwg"].includes(e)) return "cad";
                        if (["jpg","jpeg","png","gif"].includes(e)) return "image";
                        if (["mp4","mov","webm","avi","mkv","m4v","3gp"].includes(e)) return "video";
                        return "document";
                      };
                      const result = await chunkedUpload(
                        currentFileObj,
                        emailUser.id,
                        getCategory(ext),
                        (progress) => setUploadProgress(progress)
                      );
                      if (!result.success) {
                        throw new Error(result.error || "上传失败");
                      }
                      setSavedFileId(result.file.id);
                      if (viewerMode === "archive" && result.file.s3Url) {
                        setArchiveS3Url(result.file.s3Url);
                      }
                      refetchQuota();
                      setUploadProgress(null);
                      toast.success("文件已保存到您的账户");

                      // Auto-capture thumbnail from preview area
                      const isImageFile = ["jpg","jpeg","png","gif","webp","bmp"].includes(ext);
                      const isVideoFile = ["mp4","mov","webm","avi","mkv","m4v","3gp"].includes(ext);
                      if (isVideoFile) {
                        try {
                          let thumbBase64: string | null = null;
                          if (videoViewerRef.current) {
                            thumbBase64 = await videoViewerRef.current.captureFrame();
                          }
                          if (!thumbBase64 && currentFileObj) {
                            thumbBase64 = await captureVideoThumbnail(currentFileObj);
                          }
                          if (thumbBase64) {
                            await uploadThumbnailMut.mutateAsync({
                              fileId: result.file.id,
                              thumbnailBase64: thumbBase64,
                            });
                            toast.success("视频缩略图已生成");
                          }
                        } catch (thumbErr) {
                          console.warn("Video thumbnail generation failed:", thumbErr);
                        }
                      } else if (!isImageFile) {
                        try {
                          const waitMs = viewerMode === "2d-dwg" ? 5000 : 2000;
                          await new Promise(r => setTimeout(r, waitMs));
                          const thumbBase64 = await captureThumbFromViewer();
                          if (thumbBase64) {
                            await uploadThumbnailMut.mutateAsync({
                              fileId: result.file.id,
                              thumbnailBase64: thumbBase64,
                            });
                          }
                        } catch (thumbErr) {
                          console.warn("Thumbnail generation failed:", thumbErr);
                        }
                      }
                    } catch (err: any) {
                      toast.error(err.message || "保存失败");
                      setUploadProgress(null);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4" />
                  {isSaving
                    ? uploadProgress
                      ? uploadProgress.phase === "compressing"
                        ? "正在压缩图片..."
                        : uploadProgress.phase === "completing"
                          ? "正在合并文件..."
                          : `上传中 ${uploadProgress.percent}%`
                      : "正在保存..."
                    : "保存到我的文件"}
                </Button>
                {isSaving && uploadProgress && uploadProgress.phase === "uploading" && (
                  <div className="space-y-1">
                    <Progress value={uploadProgress.percent} className="h-2" />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{uploadProgress.uploadedChunks}/{uploadProgress.totalChunks} 分片</span>
                      <span>{uploadProgress.speed || ""}</span>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* My files link */}
            {isLoggedIn && isApproved && (
              <Link href="/profile">
                <Button variant="outline" className="w-full gap-2">
                  <FolderOpen className="w-4 h-4" />
                  我的文件
                </Button>
              </Link>
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

            {/* Quota Progress Bar (logged-in approved users) */}
            {isLoggedIn && isApproved && quota && (
              <Card>
                <CardContent className="pt-4 pb-3 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <HardDrive className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">存储配额</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>文件数量</span>
                      <span>{quota.fileCount} / {quota.maxFiles}</span>
                    </div>
                    <Progress value={quota.maxFiles > 0 ? (quota.fileCount / quota.maxFiles) * 100 : 0} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>已用空间</span>
                      <span>{(quota.totalSize / 1024 / 1024).toFixed(1)} MB / {(quota.maxTotalSize / 1024 / 1024).toFixed(0)} MB</span>
                    </div>
                    <Progress value={quota.maxTotalSize > 0 ? (quota.totalSize / quota.maxTotalSize) * 100 : 0} className="h-2" />
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    单文件限制: {(quota.maxSingleFile / 1024 / 1024).toFixed(0)} MB
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share button (after save) */}
            {savedFileId && !shareLink && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={async () => {
                  try {
                    const result = await toggleShareMut.mutateAsync({ fileId: savedFileId, enabled: true });
                    const link = `${window.location.origin}/share/${result.file.shareToken}`;
                    setShareLink(link);
                    toast.success("分享链接已生成");
                  } catch (err: any) {
                    toast.error(err.message || "生成分享链接失败");
                  }
                }}
              >
                <Share2 className="w-4 h-4" />
                生成分享链接
              </Button>
            )}

            {/* Share link display */}
            {shareLink && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-3 pb-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Share2 className="w-4 h-4" />
                    分享链接
                  </div>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareLink}
                      className="flex-1 text-xs bg-background border rounded px-2 py-1.5 truncate"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        setLinkCopied(true);
                        toast.success("链接已复制");
                        setTimeout(() => setLinkCopied(false), 2000);
                      }}
                    >
                      {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {linkCopied ? "已复制" : "复制"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Guide Link */}
            <Link href="/help">
              <Button variant="outline" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                <HelpCircle className="w-4 h-4" />
                操作说明
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer with admin login */}
      <footer className="border-t mt-12 py-6 bg-muted/30">
        <div className="container flex items-center justify-center gap-4">
          <a
            href="/admin-login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            管理员登录
          </a>
          <span className="text-xs text-muted-foreground/60">v1.4.0</span>
        </div>
      </footer>
    </div>
  );
}
