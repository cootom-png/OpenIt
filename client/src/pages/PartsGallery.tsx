import { useState, useMemo, lazy, Suspense } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  const pageSize = 20;
  const queryInput = useMemo(() => ({ page, pageSize, search: searchQuery || undefined }), [page, searchQuery]);

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

  // Fetch file URL when preview is requested
  const { data: fileUrlData, isLoading: fileUrlLoading, error: fileUrlError } = trpc.partsGallery.getFileUrl.useQuery(
    { fileId: previewFileId! },
    { enabled: previewFileId !== null && isApproved }
  );

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  const handleCardClick = (fileId: number) => {
    if (!isLoggedIn || !isApproved) {
      setShowLoginPrompt(true);
      return;
    }
    setPreviewFileId(fileId);
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
            浏览康瑞通医疗推车的 3D 零件模型。
            {!isApproved && (
              <span className="text-amber-600"> 注册并通过审核后可查看 3D 预览。</span>
            )}
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 mb-6">
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
          <Button onClick={handleSearch} size="sm" className="h-10 px-4">
            <Search className="w-4 h-4 mr-1.5" />
            搜索
          </Button>
        </div>

        {/* Stats */}
        {data && (
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary" className="gap-1">
              <Box className="w-3.5 h-3.5" />
              {searchQuery ? `找到 ${data.total} 个零件` : `共 ${data.total} 个零件`}
            </Badge>
            {searchQuery && (
              <Badge variant="outline" className="gap-1 text-xs">
                搜索：{searchQuery}
                <button onClick={handleClearSearch} className="ml-1 hover:text-foreground">
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
                onClick={() => handleCardClick(part.id)}
              >
                {/* Thumbnail */}
                <div className="aspect-square relative overflow-hidden bg-slate-50">
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
                </div>

                {/* Info */}
                <CardContent className="p-3 space-y-1">
                  <p className="text-sm font-medium truncate" title={part.fileName}>
                    {part.fileName}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(part.fileSize)}</span>
                    <span>{formatDate(part.createdAt)}</span>
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
          <div className="flex-1 min-h-0 px-2 pb-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
