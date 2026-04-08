import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Calendar,
  HardDrive,
  FileBox,
  Trash2,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Edit2,
  Save,
  X,
  ExternalLink,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Box,
  Ruler,
  Link2,
  Camera,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatDate = (d: Date | string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const categoryLabels: Record<string, string> = {
  "3d": "3D 模型",
  cad: "CAD 图纸",
  image: "图片",
  video: "视频",
  document: "文档",
};

const categoryIcons: Record<string, React.ReactNode> = {
  "3d": <Box className="w-5 h-5" />,
  cad: <Ruler className="w-5 h-5" />,
  image: <ImageIcon className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  document: <FileText className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  "3d": "from-blue-500/20 to-blue-600/10 text-blue-600",
  cad: "from-purple-500/20 to-purple-600/10 text-purple-600",
  image: "from-green-500/20 to-green-600/10 text-green-600",
  video: "from-orange-500/20 to-orange-600/10 text-orange-600",
  document: "from-gray-500/20 to-gray-600/10 text-gray-600",
};

export default function Profile() {
  const { emailUser, isLoggedIn, isLoading: authLoading, isApproved, isPending, isRejected } = useEmailAuth();
  const [, navigate] = useLocation();

  // Nickname editing
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const updateNickname = trpc.emailAuth.updateNickname.useMutation();

  // File list
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const queryInput = useMemo(() => ({ page, pageSize }), [page, pageSize]);
  const { data: filesData, refetch: refetchFiles } = trpc.userFiles.list.useQuery(queryInput, { enabled: isLoggedIn });
  const { data: quota, refetch: refetchQuota } = trpc.userFiles.quota.useQuery(undefined, { enabled: isLoggedIn });

  // Mutations
  const deleteFile = trpc.userFiles.delete.useMutation();
  const toggleShare = trpc.userFiles.toggleShare.useMutation();

  // Copy share link
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [authLoading, isLoggedIn, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const handleSaveNickname = async () => {
    if (!newNickname.trim()) return;
    try {
      await updateNickname.mutateAsync({ nickname: newNickname.trim() });
      toast.success("昵称已更新");
      setEditingNickname(false);
    } catch (e: any) {
      toast.error(e.message || "修改失败");
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteFile.mutateAsync({ fileId });
      toast.success("文件已删除");
      refetchFiles();
      refetchQuota();
    } catch (e: any) {
      toast.error(e.message || "删除失败");
    }
  };

  const handleToggleShare = async (fileId: number, enabled: boolean) => {
    try {
      await toggleShare.mutateAsync({ fileId, enabled });
      toast.success(enabled ? "分享已开启" : "分享已关闭");
      refetchFiles();
    } catch (e: any) {
      toast.error(e.message || "操作失败");
    }
  };

  const handleCopyLink = (shareToken: string, fileId: number) => {
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(fileId);
      toast.success("链接已复制");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const totalPages = Math.ceil((filesData?.total || 0) / pageSize);

  // Quota calculations
  const fileCountPercent = quota ? Math.min((quota.fileCount / quota.maxFiles) * 100, 100) : 0;
  const sizePercent = quota ? Math.min((quota.totalSize / quota.maxTotalSize) * 100, 100) : 0;

  const statusBadge = isPending ? (
    <Badge variant="outline" className="text-yellow-600 border-yellow-300">待审核</Badge>
  ) : isApproved ? (
    <Badge variant="outline" className="text-green-600 border-green-300">已通过</Badge>
  ) : isRejected ? (
    <Badge variant="outline" className="text-red-600 border-red-300">已拒绝</Badge>
  ) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-base font-semibold">个人中心</h1>
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-5xl mx-auto space-y-6 px-4">
        {/* Profile Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              个人信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nickname */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">昵称</span>
                {editingNickname ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="h-8 text-sm"
                      maxLength={50}
                      autoFocus
                    />
                    <Button size="sm" className="h-8 w-8 p-0" onClick={handleSaveNickname} disabled={updateNickname.isPending}>
                      <Save className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingNickname(false)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{emailUser?.nickname}</span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setNewNickname(emailUser?.nickname || ""); setEditingNickname(true); }}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">邮箱</span>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  {emailUser?.email}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">账号状态</span>
                <div>{statusBadge}</div>
              </div>

              {/* Joined */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">注册时间</span>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDate(emailUser?.createdAt || null)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Quota */}
        {isApproved && quota && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                存储配额
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File count */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">文件数量</span>
                  <span className="font-medium">
                    {quota.fileCount} / {quota.maxFiles} 个
                  </span>
                </div>
                <Progress value={fileCountPercent} className="h-2.5" />
              </div>

              {/* Storage size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">存储空间</span>
                  <span className="font-medium">
                    {formatFileSize(quota.totalSize)} / {formatFileSize(quota.maxTotalSize)}
                  </span>
                </div>
                <Progress value={sizePercent} className="h-2.5" />
              </div>

              <p className="text-xs text-muted-foreground">
                单个文件最大 {formatFileSize(quota.maxSingleFile)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pending/Rejected notice */}
        {isPending && (
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-4">
              <p className="text-sm text-yellow-700">您的账号正在等待管理员审核，审核通过后即可上传和保存文件。</p>
            </CardContent>
          </Card>
        )}
        {isRejected && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-4">
              <p className="text-sm text-red-700">您的注册申请未通过审核，如有疑问请联系管理员。</p>
            </CardContent>
          </Card>
        )}

        {/* My Files - Card Layout */}
        {isApproved && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileBox className="w-4 h-4" />
                我的文件
                {filesData && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {filesData.total} 个
                  </Badge>
                )}
              </h2>
            </div>

            {filesData && filesData.records.length > 0 ? (
              <>
                {/* Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filesData.records.map((file) => {
                    const colorClass = categoryColors[file.category] || categoryColors.document;
                    const icon = categoryIcons[file.category] || categoryIcons.document;

                    return (
                      <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                        {/* Thumbnail / Placeholder */}
                        <div className={`relative h-36 bg-gradient-to-br ${colorClass} flex items-center justify-center overflow-hidden`}>
                          {file.thumbnailUrl ? (
                            <img
                              src={file.thumbnailUrl}
                              alt={file.fileName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 opacity-60">
                              {icon}
                              <span className="text-xs font-medium uppercase">{file.fileExt}</span>
                            </div>
                          )}

                          {/* Category badge overlay */}
                          <Badge
                            variant="secondary"
                            className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-white/90 text-gray-700 shadow-sm"
                          >
                            {categoryLabels[file.category] || file.category}
                          </Badge>

                          {/* Share indicator */}
                          {file.shareEnabled && (
                            <Badge
                              className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-primary/90 text-white shadow-sm"
                            >
                              <Link2 className="w-2.5 h-2.5 mr-0.5" />
                              已分享
                            </Badge>
                          )}
                        </div>

                        {/* File Info */}
                        <CardContent className="p-3 space-y-2">
                          <div className="space-y-1">
                            <h3
                              className="text-sm font-medium truncate"
                              title={file.fileName}
                            >
                              {file.fileName}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatFileSize(file.fileSize)}</span>
                              <span>{formatDate(file.createdAt)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                            {/* Preview */}
                            {file.s3Url && (
                              <Link href={`/?preview=${encodeURIComponent(file.s3Url)}&name=${encodeURIComponent(file.fileName)}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs gap-1 px-2.5"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  预览
                                </Button>
                              </Link>
                            )}

                            {/* Generate thumbnail (only show when no thumbnail exists) */}
                            {!file.thumbnailUrl && file.s3Url && (
                              <Link href={`/?preview=${encodeURIComponent(file.s3Url)}&name=${encodeURIComponent(file.fileName)}&generateThumb=${file.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs gap-1 px-2.5 text-amber-600 border-amber-300 hover:bg-amber-50"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  生成缩略图
                                </Button>
                              </Link>
                            )}

                            {/* Share toggle */}
                            <Button
                              variant={file.shareEnabled ? "default" : "outline"}
                              size="sm"
                              className="h-8 text-xs gap-1 px-2.5"
                              onClick={() => handleToggleShare(file.id, !file.shareEnabled)}
                              disabled={toggleShare.isPending}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              {file.shareEnabled ? "分享中" : "分享"}
                            </Button>

                            {/* Copy share link */}
                            {file.shareEnabled && file.shareToken && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1 px-2.5"
                                onClick={() => handleCopyLink(file.shareToken!, file.id)}
                              >
                                {copiedId === file.id ? (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                {copiedId === file.id ? "已复制" : "链接"}
                              </Button>
                            )}

                            {/* Download */}
                            {file.s3Url && (
                              <a href={file.s3Url} target="_blank" rel="noopener noreferrer">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs gap-1 px-2.5"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  下载
                                </Button>
                              </a>
                            )}

                            {/* Delete */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs gap-1 px-2.5 text-red-500 hover:text-red-700 hover:border-red-300 ml-auto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  删除
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除文件 "{file.fileName}" 吗？此操作不可撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteFile(file.id)}>
                                    确认删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      共 {filesData.total} 个文件
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        上一页
                      </Button>
                      <span className="text-xs text-muted-foreground px-2">
                        {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        下一页
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <FileBox className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">暂无文件</p>
                    <p className="text-xs mt-1">在首页上传文件后，点击"保存到我的文件"即可保存</p>
                    <Link href="/">
                      <Button variant="outline" size="sm" className="mt-4">
                        去上传文件
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
