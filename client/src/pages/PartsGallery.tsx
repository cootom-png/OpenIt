import { useState, useMemo, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Box,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Eye,
  User,
  Calendar,
  FileText,
  Search,
  X,
  Download,
  Mail,
  Phone,
  Building2,
  UserCircle,
  MessageSquare,
  Maximize2,
  Minimize2,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const StepPreview = lazy(() => import("@/components/StepPreview"));

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d: Date | string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
};

export default function PartsGallery() {
  const { emailUser, isLoggedIn, isApproved } = useEmailAuth();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExt, setFilterExt] = useState("");
  const pageSize = 20;
  const queryInput = useMemo(() => ({ page, pageSize, search: searchQuery || undefined, fileExt: filterExt || undefined }), [page, searchQuery, filterExt]);

  const { data, isLoading } = trpc.partsGallery.list.useQuery(queryInput);

  const handleSearch = () => {
    setSearchQuery(searchText.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchQuery("");
    setPage(1);
  };

  // Preview dialog state
  const [previewFileId, setPreviewFileId] = useState<number | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Download request dialog state
  const [downloadRequestFileId, setDownloadRequestFileId] = useState<number | null>(null);
  const [downloadRequestFileName, setDownloadRequestFileName] = useState("");
  const [drForm, setDrForm] = useState({ email: "", phone: "", company: "", realName: "", message: "" });
  const [drSubmitting, setDrSubmitting] = useState(false);

  // Fullscreen state for 3D preview
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Fetch file URL when preview is requested
  const { data: fileUrlData, isLoading: fileUrlLoading, error: fileUrlError } = trpc.partsGallery.getFileUrl.useQuery(
    { fileId: previewFileId! },
    { enabled: previewFileId !== null && isApproved }
  );

  // Keyboard shortcut: F to toggle fullscreen in preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (previewFileId !== null && isApproved && fileUrlData) {
          toggleFullscreen();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewFileId, isApproved, fileUrlData, toggleFullscreen]);

  // Record view when preview opens
  const recordView = trpc.partsGallery.recordView.useMutation();
  useEffect(() => {
    if (previewFileId !== null && isApproved) {
      recordView.mutate({ fileId: previewFileId });
    }
  }, [previewFileId]);

  // Submit download request mutation
  const submitRequest = trpc.partsGallery.requestDownload.useMutation();

  // Favorites
  const { data: favData } = trpc.favorites.myIds.useQuery(undefined, { enabled: isLoggedIn && isApproved });
  const favIds = useMemo(() => new Set(favData?.ids || []), [favData?.ids]);
  const utils = trpc.useUtils();
  const toggleFavorite = trpc.favorites.toggle.useMutation({
    onSuccess: () => {
      utils.favorites.myIds.invalidate();
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  const handleCardClick = (fileId: number) => {
    if (!isLoggedIn || !isApproved) {
      setShowLoginPrompt(true);
      return;
    }
    setPreviewFileId(fileId);
  };

  const handleRequestDownload = (fileId: number, fileName: string) => {
    setDownloadRequestFileId(fileId);
    setDownloadRequestFileName(fileName);
    // Pre-fill if logged in
    if (emailUser) {
      setDrForm({
        email: emailUser.email || "",
        phone: emailUser.phone || "",
        company: emailUser.company || "",
        realName: emailUser.realName || emailUser.nickname || "",
        message: "",
      });
    } else {
      setDrForm({ email: "", phone: "", company: "", realName: "", message: "" });
    }
  };

  const handleSubmitDownloadRequest = async () => {
    if (!downloadRequestFileId) return;
    if (!drForm.email || !drForm.phone || !drForm.company || !drForm.realName) {
      toast.error("请填写所有必填信息");
      return;
    }
    setDrSubmitting(true);
    try {
      await submitRequest.mutateAsync({
        fileId: downloadRequestFileId,
        email: drForm.email,
        phone: drForm.phone,
        company: drForm.company,
        realName: drForm.realName,
        message: drForm.message || undefined,
      });
      toast.success("下载申请已提交，文件上传者将审核您的请求");
      setDownloadRequestFileId(null);
    } catch (e: any) {
      toast.error(e.message || "提交失败，请稍后重试");
    } finally {
      setDrSubmitting(false);
    }
  };

  const placeholderThumb = (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center gap-2">
      <Box className="w-10 h-10 text-blue-300" />
      <span className="text-xs text-slate-400">3D 模型</span>
    </div>
  );

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
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-600" />
              <h1 className="text-base font-semibold">3D 零件库</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="w-4 h-4" />
                  {emailUser?.nickname || "个人中心"}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="gap-1.5">
                  <User className="w-4 h-4" />
                  登录
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-6xl mx-auto px-4">
        {/* Title & Description */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">3D 零件展示</h2>
          <p className="text-muted-foreground mt-1">
            浏览和收藏 3D 零件模型。
            {!isApproved && (
              <span className="text-amber-600"> 注册并通过审核后可查看 3D 预览。</span>
            )}
          </p>
        </div>

        {/* Search Bar + Format Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索零件名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="pl-9 pr-9 h-10"
            />
            {searchText && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={filterExt}
            onChange={(e) => { setFilterExt(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">全部格式</option>
            <option value="stp">STP / STEP</option>
            <option value="stl">STL</option>
            <option value="obj">OBJ</option>
            <option value="3mf">3MF</option>
            <option value="igs">IGS / IGES</option>
          </select>
          <Button onClick={handleSearch} size="sm" className="h-10 px-4">
            <Search className="w-4 h-4 mr-1.5" />
            搜索
          </Button>
        </div>

        {/* Stats */}
        {data && (
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <Box className="w-3.5 h-3.5" />
              {(searchQuery || filterExt) ? `找到 ${data.total} 个零件` : `共 ${data.total} 个零件`}
            </Badge>
            {searchQuery && (
              <Badge variant="outline" className="gap-1 text-xs">
                搜索：{searchQuery}
                <button onClick={handleClearSearch} className="ml-1 hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filterExt && (
              <Badge variant="outline" className="gap-1 text-xs">
                格式：{filterExt.toUpperCase()}
                <button onClick={() => { setFilterExt(""); setPage(1); }} className="ml-1 hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && data?.records.length === 0 && (
          <div className="text-center py-20">
            <Box className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600">暂无 3D 零件</h3>
            <p className="text-muted-foreground mt-1">管理员上传 3D 模型后将在此展示</p>
          </div>
        )}

        {/* Cards Grid */}
        {data && data.records.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {data.records.map((part) => (
              <Card
                key={part.id}
                className="group cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 overflow-hidden"
              >
                {/* Thumbnail */}
                <div
                  className="aspect-square relative overflow-hidden bg-slate-50"
                  onClick={() => handleCardClick(part.id)}
                >
                  {part.thumbnailUrl ? (
                    <img
                      src={part.thumbnailUrl}
                      alt={part.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    placeholderThumb
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {isApproved ? (
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                          <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                          <Lock className="w-5 h-5 text-amber-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* File extension badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/80 backdrop-blur-sm">
                      {part.fileExt.toUpperCase()}
                    </Badge>
                  </div>
                  {/* View count badge */}
                  {part.viewCount > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/80 backdrop-blur-sm gap-0.5">
                        <Eye className="w-3 h-3" />
                        {part.viewCount}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Info */}
                <CardContent className="p-3 space-y-1.5">
                  <p className="text-sm font-medium truncate" title={part.fileName}>
                    {part.fileName}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(part.fileSize)}</span>
                    <span>{formatDate(part.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{part.ownerNickname}</span>
                  </div>
                  {/* Action buttons row */}
                  <div className="flex items-center gap-1.5 mt-1">
                    {/* Favorite Button */}
                    {isApproved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 flex-shrink-0 ${favIds.has(part.id) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite.mutate({ fileId: part.id });
                        }}
                        title={favIds.has(part.id) ? "取消收藏" : "收藏"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${favIds.has(part.id) ? "fill-current" : ""}`} />
                      </Button>
                    )}
                    {/* Request Download Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestDownload(part.id, part.fileName);
                      }}
                    >
                      <Download className="w-3 h-3" />
                      申请下载
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              需要注册登录
            </DialogTitle>
            <DialogDescription>
              查看 3D 零件预览需要注册账号并通过管理员审核。请先注册或登录您的账号。
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            {!isLoggedIn ? (
              <>
                <Link href="/register">
                  <Button className="w-full">注册账号</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full">已有账号，去登录</Button>
                </Link>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>您的账号正在等待管理员审核，审核通过后即可查看 3D 预览。</span>
                </div>
                <Button variant="outline" onClick={() => setShowLoginPrompt(false)} className="w-full">
                  知道了
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 3D Preview Dialog */}
      <Dialog open={previewFileId !== null && isApproved} onOpenChange={(open) => { if (!open) setPreviewFileId(null); }}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-600" />
              {fileUrlData?.fileName || "3D 预览"}
            </DialogTitle>
          </DialogHeader>
          <div ref={previewContainerRef} className={`flex-1 min-h-0 px-2 pb-2 relative bg-background ${isFullscreen ? "!p-0 h-screen w-screen" : ""}`}>
            {fileUrlLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {fileUrlError && (
              <div className="flex items-center justify-center h-full text-red-500">
                加载失败：{fileUrlError.message}
              </div>
            )}
            {fileUrlData && !fileUrlLoading && (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              }>
                <StepPreview
                  fileUrl={fileUrlData.s3Url}
                  fileName={fileUrlData.fileName}
                  fileExt={fileUrlData.fileExt}
                />
              </Suspense>
            )}
            {/* Fullscreen toggle button */}
            {fileUrlData && !fileUrlLoading && (
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
            {isFullscreen && fileUrlData && (
              <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
                <div className="bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
                  <p className="text-white text-sm font-medium truncate mb-1">{fileUrlData.fileName}</p>
                  <div className="flex items-center gap-4 text-white/70 text-xs">
                    <span>左键拖拽旋转</span>
                    <span>滚轮缩放</span>
                    <span>右键拖拽平移</span>
                    <span className="ml-auto text-white/50">按 Esc 退出全屏</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Request download from preview */}
          {fileUrlData && (
            <div className="px-6 pb-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setPreviewFileId(null);
                  handleRequestDownload(previewFileId!, fileUrlData.fileName);
                }}
              >
                <Download className="w-4 h-4" />
                申请下载此零件
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Download Request Dialog */}
      <Dialog open={downloadRequestFileId !== null} onOpenChange={(open) => { if (!open) setDownloadRequestFileId(null); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              申请下载
            </DialogTitle>
            <DialogDescription>
              请填写您的联系信息，文件上传者将审核您的下载请求。
            </DialogDescription>
          </DialogHeader>

          {/* File name display */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm">
            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="font-medium truncate">{downloadRequestFileName}</span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Real Name */}
            <div className="space-y-1.5">
              <Label htmlFor="dr-name" className="text-sm font-medium flex items-center gap-1.5">
                <UserCircle className="w-3.5 h-3.5" />
                姓名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dr-name"
                placeholder="请输入您的姓名"
                value={drForm.realName}
                onChange={(e) => setDrForm(f => ({ ...f, realName: e.target.value }))}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="dr-email" className="text-sm font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dr-email"
                type="email"
                placeholder="请输入您的邮箱地址"
                value={drForm.email}
                onChange={(e) => setDrForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="dr-phone" className="text-sm font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                电话 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dr-phone"
                placeholder="请输入您的电话号码"
                value={drForm.phone}
                onChange={(e) => setDrForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <Label htmlFor="dr-company" className="text-sm font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                公司名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dr-company"
                placeholder="请输入您的公司名称"
                value={drForm.company}
                onChange={(e) => setDrForm(f => ({ ...f, company: e.target.value }))}
              />
            </div>

            {/* Message (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="dr-message" className="text-sm font-medium flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                留言 <span className="text-muted-foreground text-xs">（选填）</span>
              </Label>
              <Textarea
                id="dr-message"
                placeholder="请简要说明下载用途..."
                value={drForm.message}
                onChange={(e) => setDrForm(f => ({ ...f, message: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDownloadRequestFileId(null)}>
              取消
            </Button>
            <Button
              onClick={handleSubmitDownloadRequest}
              disabled={drSubmitting}
              className="gap-1.5"
            >
              {drSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  提交申请
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t mt-12 py-6 bg-muted/30">
        <div className="container flex items-center justify-center">
          <span className="text-xs text-muted-foreground/60">v1.4.0</span>
        </div>
      </footer>
    </div>
  );
}
