import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { BrandMark, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Box,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Heart,
  Loader2,
  LogIn,
  Mail,
  Maximize2,
  MessageSquare,
  Minimize2,
  Phone,
  Search,
  User,
  UserCircle,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

const StepPreview = lazy(() => import("@/components/StepPreview"));

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d: Date | string | null) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function PartsGallery() {
  const { emailUser, isLoggedIn, isApproved } = useEmailAuth();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExt, setFilterExt] = useState("");
  const pageSize = 20;

  const queryInput = useMemo(
    () => ({ page, pageSize, search: searchQuery || undefined, fileExt: filterExt || undefined }),
    [page, searchQuery, filterExt]
  );
  const { data, isLoading } = trpc.partsGallery.list.useQuery(queryInput);
  const totalPages = Math.ceil((data?.total || 0) / pageSize);
  const hasActiveFilter = Boolean(searchQuery || filterExt);

  const [previewFileId, setPreviewFileId] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [downloadRequestFileId, setDownloadRequestFileId] = useState<number | null>(null);
  const [downloadRequestFileName, setDownloadRequestFileName] = useState("");
  const [drForm, setDrForm] = useState({ email: "", phone: "", company: "", realName: "", message: "" });
  const [drSubmitting, setDrSubmitting] = useState(false);

  const { data: fileUrlData, isLoading: fileUrlLoading, error: fileUrlError } =
    trpc.partsGallery.getFileUrl.useQuery(
      { fileId: previewFileId! },
      { enabled: previewFileId !== null }
    );

  const recordView = trpc.partsGallery.recordView.useMutation();
  useEffect(() => {
    if (previewFileId !== null) {
      recordView.mutate({ fileId: previewFileId });
    }
  }, [previewFileId]);

  const submitRequest = trpc.partsGallery.requestDownload.useMutation();
  const { data: favData } = trpc.favorites.myIds.useQuery(undefined, { enabled: isLoggedIn && isApproved });
  const favIds = useMemo(() => new Set(favData?.ids || []), [favData?.ids]);
  const utils = trpc.useUtils();
  const toggleFavorite = trpc.favorites.toggle.useMutation({
    onSuccess: () => utils.favorites.myIds.invalidate(),
  });

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "f" || e.key === "F") && previewFileId !== null && fileUrlData) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        toggleFullscreen();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewFileId, fileUrlData, toggleFullscreen]);

  const handleSearch = () => {
    setSearchQuery(searchText.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchQuery("");
    setPage(1);
  };

  const openDownloadRequest = (fileId: number, fileName: string) => {
    if (!isLoggedIn || !emailUser) {
      setDownloadRequestFileName(fileName);
      setShowRegisterPrompt(true);
      return;
    }

    setDownloadRequestFileId(fileId);
    setDownloadRequestFileName(fileName);
    setDrForm({
      email: emailUser.email || "",
      phone: emailUser.phone || "",
      company: emailUser.company || "",
      realName: emailUser.realName || emailUser.nickname || "",
      message: "",
    });
  };

  const handleSubmitDownloadRequest = async () => {
    if (!downloadRequestFileId) return;
    if (!drForm.email || !drForm.phone || !drForm.company || !drForm.realName) {
      toast.error("请填写姓名、邮箱、电话和公司名称");
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
      toast.success("下载申请已提交，文件拥有者会看到您的申请");
      setDownloadRequestFileId(null);
    } catch (e: any) {
      toast.error(e.message || "提交失败，请稍后重试");
    } finally {
      setDrSubmitting(false);
    }
  };

  const placeholderThumb = (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_20%,#dbeafe,transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)]">
      <div className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm">
        <Box className="h-9 w-9 text-blue-500" />
      </div>
      <span className="text-xs font-medium text-slate-500">3D 模型</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader
        title="3D 零件库"
        icon={<BrandMark />}
        right={isLoggedIn ? (
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <User className="h-4 w-4" />
                {emailUser?.nickname || "个人中心"}
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-1.5 bg-slate-950 hover:bg-slate-800">
                <LogIn className="h-4 w-4" />
                登录
              </Button>
            </Link>
          )
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-5">
        <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1fr_440px]">
            <div className="relative p-4 sm:p-5">
              <div className="absolute inset-y-0 right-0 hidden w-32 bg-gradient-to-l from-blue-50 to-transparent lg:block" />
              <div className="relative max-w-3xl">
                <Badge className="mb-2 border-blue-200 bg-blue-50 px-2 py-0 text-blue-700 hover:bg-blue-50">
                  访客可在线预览
                </Badge>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  3D / CAD 零件在线预览与下载申请
                </h2>
                <p className="mt-1.5 max-w-3xl text-sm leading-5 text-slate-600">
                  客户无需登录即可查看公开零件预览；申请下载时会引导注册或登录，申请信息自动发送给文件拥有者审核。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-slate-200 bg-slate-50/70 lg:border-l lg:border-t-0">
              <div className="p-3 sm:p-4">
                <div className="text-base font-semibold sm:text-lg">{data?.total ?? "--"}</div>
                <div className="text-xs text-slate-500">公开零件</div>
              </div>
              <div className="border-l border-slate-200 p-3 sm:p-4">
                <div className="text-base font-semibold sm:text-lg">STEP</div>
                <div className="text-xs text-slate-500">主流 CAD 格式</div>
              </div>
              <div className="border-l border-slate-200 p-3 sm:p-4">
                <div className="text-base font-semibold sm:text-lg">审核制</div>
                <div className="text-xs text-slate-500">下载更可控</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="搜索零件名称、图号或关键词..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-9 pr-9 shadow-none focus-visible:bg-white"
              />
              {searchText && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                  aria-label="清除搜索"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={filterExt}
              onChange={(e) => { setFilterExt(e.target.value); setPage(1); }}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 lg:w-44"
            >
              <option value="">全部格式</option>
              <option value="stp">STP / STEP</option>
              <option value="stl">STL</option>
              <option value="obj">OBJ</option>
              <option value="3mf">3MF</option>
              <option value="igs">IGS / IGES</option>
            </select>
            <Button onClick={handleSearch} className="h-11 rounded-xl bg-blue-600 px-5 hover:bg-blue-700">
              <Search className="h-4 w-4" />
              搜索
            </Button>
          </div>

          {data && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 rounded-lg bg-slate-100 text-slate-700">
                <Box className="h-3.5 w-3.5" />
                {hasActiveFilter ? `找到 ${data.total} 个零件` : `共 ${data.total} 个零件`}
              </Badge>
              {searchQuery && (
                <Badge variant="outline" className="gap-1 rounded-lg border-blue-200 bg-blue-50 text-xs text-blue-700">
                  搜索：{searchQuery}
                  <button onClick={handleClearSearch} className="ml-1 hover:text-blue-950" aria-label="清除搜索条件">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterExt && (
                <Badge variant="outline" className="gap-1 rounded-lg border-blue-200 bg-blue-50 text-xs text-blue-700">
                  格式：{filterExt.toUpperCase()}
                  <button onClick={() => { setFilterExt(""); setPage(1); }} className="ml-1 hover:text-blue-950" aria-label="清除格式筛选">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </section>

        {isLoading && (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && data?.records.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <Box className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-700">暂无公开 3D 零件</h3>
            <p className="mt-1 text-sm text-slate-500">上传并公开模型后，会在这里展示给访客预览。</p>
          </div>
        )}

        {data && data.records.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
            {data.records.map((part) => (
              <Card
                key={part.id}
                className="group overflow-hidden rounded-2xl border-slate-200 bg-white py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <button
                  type="button"
                  className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 text-left"
                  onClick={() => setPreviewFileId(part.id)}
                >
                  {part.thumbnailUrl ? (
                    <img
                      src={part.thumbnailUrl}
                      alt={part.fileName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    placeholderThumb
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 transition-colors duration-200 group-hover:bg-slate-950/20">
                    <span className="flex translate-y-1 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-900 opacity-0 shadow-lg backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                      在线预览
                    </span>
                  </div>
                  <div className="absolute right-2 top-2">
                    <Badge className="rounded-md bg-slate-950/80 px-1.5 py-0 text-[10px] text-white hover:bg-slate-950/80">
                      {part.fileExt.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute left-2 top-2">
                    <Badge variant="secondary" className="gap-0.5 rounded-md bg-white/90 px-1.5 py-0 text-[10px] text-slate-700 backdrop-blur">
                      <Eye className="h-3 w-3" />
                      {part.viewCount || 0}
                    </Badge>
                  </div>
                </button>

                <CardContent className="space-y-3 p-3">
                  <div className="min-h-[44px]">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900" title={part.fileName}>
                      {part.fileName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div className="rounded-lg bg-slate-50 px-2 py-1">
                      <div className="truncate">{formatFileSize(part.fileSize)}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2 py-1 text-right">
                      <div className="truncate">{formatDate(part.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex min-w-0 items-center text-xs text-slate-500">
                    <User className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{part.ownerNickname}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isApproved && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={`h-8 w-8 rounded-lg ${favIds.has(part.id) ? "text-red-500 hover:text-red-600" : "text-slate-400 hover:text-red-500"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite.mutate({ fileId: part.id });
                        }}
                        title={favIds.has(part.id) ? "取消收藏" : "收藏"}
                      >
                        <Heart className={`h-4 w-4 ${favIds.has(part.id) ? "fill-current" : ""}`} />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-lg border-blue-200 text-xs text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDownloadRequest(part.id, part.fileName);
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      申请下载
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="rounded-lg bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      <Dialog open={showRegisterPrompt} onOpenChange={setShowRegisterPrompt}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              下载需要注册或登录
            </DialogTitle>
            <DialogDescription>
              访客可以直接预览零件。申请下载“{downloadRequestFileName}”需要先注册或登录账号，登录后申请会发送给文件拥有者审核。
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/register">
              <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4" />
                注册账号
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                已有账号，去登录
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewFileId !== null} onOpenChange={(open) => { if (!open) setPreviewFileId(null); }}>
        <DialogContent className="flex h-[82vh] max-w-5xl flex-col p-0">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-blue-600" />
              {fileUrlData?.fileName || "3D 在线预览"}
            </DialogTitle>
          </DialogHeader>
          <div ref={previewContainerRef} className={`relative min-h-0 flex-1 bg-background px-2 pb-2 ${isFullscreen ? "!p-0 h-screen w-screen" : ""}`}>
            {fileUrlLoading && (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {fileUrlError && (
              <div className="flex h-full items-center justify-center text-red-500">
                加载失败：{fileUrlError.message}
              </div>
            )}
            {fileUrlData && !fileUrlLoading && (
              <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                <StepPreview
                  fileUrl={fileUrlData.s3Url}
                  fileName={fileUrlData.fileName}
                  fileExt={fileUrlData.fileExt}
                />
              </Suspense>
            )}
            {fileUrlData && !fileUrlLoading && (
              <button
                onClick={toggleFullscreen}
                className="absolute right-3 top-3 z-50 rounded-lg border border-border bg-background/80 p-2 shadow-md backdrop-blur-sm transition-colors hover:bg-accent"
                title={isFullscreen ? "退出全屏 (Esc)" : "全屏预览 (F)"}
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5 text-foreground" /> : <Maximize2 className="h-5 w-5 text-foreground" />}
              </button>
            )}
          </div>
          {fileUrlData && (
            <div className="flex justify-end border-t px-5 py-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  const id = previewFileId;
                  setPreviewFileId(null);
                  if (id) openDownloadRequest(id, fileUrlData.fileName);
                }}
              >
                <Download className="h-4 w-4" />
                申请下载此零件
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={downloadRequestFileId !== null} onOpenChange={(open) => { if (!open) setDownloadRequestFileId(null); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              申请下载
            </DialogTitle>
            <DialogDescription>
              请确认联系信息，申请提交后文件拥有者会在后台看到并审核。
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
            <Box className="h-4 w-4 flex-shrink-0 text-blue-500" />
            <span className="truncate font-medium">{downloadRequestFileName}</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="dr-name" className="flex items-center gap-1.5 text-sm font-medium">
                <UserCircle className="h-3.5 w-3.5" />
                姓名 <span className="text-red-500">*</span>
              </Label>
              <Input id="dr-name" value={drForm.realName} onChange={(e) => setDrForm((f) => ({ ...f, realName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dr-email" className="flex items-center gap-1.5 text-sm font-medium">
                <Mail className="h-3.5 w-3.5" />
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <Input id="dr-email" type="email" value={drForm.email} onChange={(e) => setDrForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dr-phone" className="flex items-center gap-1.5 text-sm font-medium">
                <Phone className="h-3.5 w-3.5" />
                电话 <span className="text-red-500">*</span>
              </Label>
              <Input id="dr-phone" value={drForm.phone} onChange={(e) => setDrForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dr-company" className="flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="h-3.5 w-3.5" />
                公司名称 <span className="text-red-500">*</span>
              </Label>
              <Input id="dr-company" value={drForm.company} onChange={(e) => setDrForm((f) => ({ ...f, company: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dr-message" className="flex items-center gap-1.5 text-sm font-medium">
                <MessageSquare className="h-3.5 w-3.5" />
                留言 <span className="text-xs text-muted-foreground">（选填）</span>
              </Label>
              <Textarea
                id="dr-message"
                placeholder="请简要说明下载用途..."
                value={drForm.message}
                onChange={(e) => setDrForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDownloadRequestFileId(null)}>
              取消
            </Button>
            <Button onClick={handleSubmitDownloadRequest} disabled={drSubmitting} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
              {drSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  提交申请
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
