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
  Lock,
  Building2,
  Phone,
  KeyRound,
  Heart,
  Loader2,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMobile";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

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

// ─── Favorites Section Component ───
function FavoritesSection() {
  const [favPage, setFavPage] = useState(1);
  const favPageSize = 12;
  const [favSearch, setFavSearch] = useState("");
  const [favSearchQuery, setFavSearchQuery] = useState("");
  const [favCategory, setFavCategory] = useState<string>("");
  const favInput = useMemo(() => ({
    page: favPage, pageSize: favPageSize,
    search: favSearchQuery || undefined,
    category: favCategory || undefined,
  }), [favPage, favSearchQuery, favCategory]);
  const { data: favData, isLoading: favLoading } = trpc.favorites.myList.useQuery(favInput);
  const utils = trpc.useUtils();
  const removeFav = trpc.favorites.toggle.useMutation({
    onSuccess: () => {
      utils.favorites.myList.invalidate();
      utils.favorites.myIds.invalidate();
    },
  });

  const favTotalPages = Math.ceil((favData?.total || 0) / favPageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          收藏零件
          {favData && (
            <Badge variant="secondary" className="text-xs ml-1">
              {favData.total} 个
            </Badge>
          )}
        </h2>
        <Link href="/parts">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <Box className="w-3.5 h-3.5" />
            浏览零件库
          </Button>
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="搜索收藏..."
            value={favSearch}
            onChange={(e) => setFavSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setFavSearchQuery(favSearch); setFavPage(1); } }}
            className="h-8 w-40 text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-2"
            onClick={() => { setFavSearchQuery(favSearch); setFavPage(1); }}
          >
            <Search className="w-3.5 h-3.5" />
          </Button>
          {favSearchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-2"
              onClick={() => { setFavSearch(""); setFavSearchQuery(""); setFavPage(1); }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={favCategory === "" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => { setFavCategory(""); setFavPage(1); }}
          >
            全部
          </Button>
          <Button
            variant={favCategory === "image" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => { setFavCategory("image"); setFavPage(1); }}
          >
            图片
          </Button>
          <Button
            variant={favCategory === "cad" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => { setFavCategory("cad"); setFavPage(1); }}
          >
            CAD
          </Button>
          <Button
            variant={favCategory === "3d" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => { setFavCategory("3d"); setFavPage(1); }}
          >
            3D
          </Button>
        </div>
      </div>

      {favLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!favLoading && favData && favData.records.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favData.records.map((fav) => {
              const file = fav.file;
              if (!file) return null;
              return (
                <Card key={fav.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="relative h-36 bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center overflow-hidden">
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt={file.fileName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-60">
                        <Box className="w-5 h-5" />
                        <span className="text-xs font-medium uppercase">{file.fileExt}</span>
                      </div>
                    )}
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-white/90 text-gray-700 shadow-sm"
                    >
                      {file.fileExt.toUpperCase()}
                    </Badge>
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium truncate" title={file.fileName}>
                      {file.fileName}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{formatDate(fav.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.s3Url && (
                        <Link href={`/?preview=${encodeURIComponent(file.s3Url)}&name=${encodeURIComponent(file.fileName)}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                            <Eye className="w-3 h-3" />
                            预览
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeFav.mutate({ fileId: fav.fileId })}
                        disabled={removeFav.isPending}
                      >
                        <Heart className="w-3 h-3 fill-current" />
                        取消收藏
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {favTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={favPage <= 1}
                onClick={() => setFavPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                {favPage} / {favTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={favPage >= favTotalPages}
                onClick={() => setFavPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : !favLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">暂无收藏</p>
              <p className="text-xs mt-1">在 3D 零件库中点击爱心图标即可收藏零件</p>
              <Link href="/parts">
                <Button variant="outline" size="sm" className="mt-4 gap-1">
                  <Box className="w-3.5 h-3.5" />
                  去零件库
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default function Profile() {
  const { emailUser, isLoggedIn, isLoading: authLoading, isApproved, isPending, isRejected } = useEmailAuth();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"files" | "favorites" | "profile">("files");

  // Nickname editing
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const updateNickname = trpc.emailAuth.updateNickname.useMutation();

  // Change password
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const changePasswordMutation = trpc.emailAuth.changePassword.useMutation();

  // File list
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [fileSearch, setFileSearch] = useState("");
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [fileCategory, setFileCategory] = useState<string>("");
  const queryInput = useMemo(() => ({
    page, pageSize,
    search: fileSearchQuery || undefined,
    category: fileCategory || undefined,
  }), [page, pageSize, fileSearchQuery, fileCategory]);
  const { data: filesData, refetch: refetchFiles } = trpc.userFiles.list.useQuery(queryInput, { enabled: isLoggedIn });
  const { data: quota, refetch: refetchQuota } = trpc.userFiles.quota.useQuery(undefined, { enabled: isLoggedIn });

  // Mutations
  const deleteFile = trpc.userFiles.delete.useMutation();
  const toggleShare = trpc.userFiles.toggleShare.useMutation();
  const renewShare = trpc.userFiles.renewShare.useMutation();
  const toggleAllowDownload = trpc.userFiles.toggleAllowDownload.useMutation();

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

  const handleToggleAllowDownload = async (fileId: number, allowDownload: boolean) => {
    try {
      await toggleAllowDownload.mutateAsync({ fileId, allowDownload });
      toast.success(allowDownload ? "已允许下载" : "已禁止下载");
      refetchFiles();
    } catch (e: any) {
      toast.error(e.message || "操作失败");
    }
  };

  const handleRenewShare = async (fileId: number) => {
    try {
      await renewShare.mutateAsync({ fileId });
      toast.success("分享已续期 7 天");
      refetchFiles();
    } catch (e: any) {
      toast.error(e.message || "续期失败");
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader title="个人中心" backLabel="返回首页" icon={<User className="h-5 w-5 text-blue-600" />} />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-6">

        {/* Mobile Tab Navigation */}
        {isMobile && (
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveTab("files")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === "files" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileBox className="w-4 h-4" />
              我的文件
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === "favorites" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className="w-4 h-4" />
              收藏零件
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === "profile" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-4 h-4" />
              个人信息
            </button>
          </div>
        )}

        {/* Tab: Profile Info */}
        {activeTab === "profile" && (
        <>
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

              {/* Real Name */}
              {emailUser?.realName && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">姓名</span>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    {emailUser.realName}
                  </div>
                </div>
              )}

              {/* Company */}
              {emailUser?.company && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">公司</span>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    {emailUser.company}
                  </div>
                </div>
              )}

              {/* Phone */}
              {emailUser?.phone && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">电话</span>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    {emailUser.phone}
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Button */}
            <Separator />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">账号安全</div>
              <Dialog open={showPasswordDialog} onOpenChange={(open) => {
                setShowPasswordDialog(open);
                if (!open) {
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setPasswordError("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    修改密码
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>修改密码</DialogTitle>
                    <DialogDescription>请输入原密码和新密码。新密码需至少8位，包含大小写字母和数字。</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setPasswordError("");
                    if (newPassword !== confirmNewPassword) {
                      setPasswordError("两次输入的新密码不一致");
                      return;
                    }
                    try {
                      await changePasswordMutation.mutateAsync({ oldPassword, newPassword });
                      toast.success("密码修改成功");
                      setShowPasswordDialog(false);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmNewPassword("");
                    } catch (err: any) {
                      setPasswordError(err.message || "密码修改失败");
                    }
                  }} className="space-y-4">
                    {passwordError && (
                      <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-2">
                        {passwordError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">原密码</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        placeholder="请输入原密码"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">新密码</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="至少8位，含大小写字母和数字"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">确认新密码</Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        placeholder="再次输入新密码"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={changePasswordMutation.isPending} className="w-full">
                        {changePasswordMutation.isPending ? "修改中..." : "确认修改"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        </>
        )}

        {/* Tab: My Files */}
        {activeTab === "files" && (
        <>
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

            {/* Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Input
                  placeholder="搜索文件名..."
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { setFileSearchQuery(fileSearch); setPage(1); } }}
                  className="h-8 w-40 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2"
                  onClick={() => { setFileSearchQuery(fileSearch); setPage(1); }}
                >
                  <Search className="w-3.5 h-3.5" />
                </Button>
                {fileSearchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs px-2"
                    onClick={() => { setFileSearch(""); setFileSearchQuery(""); setPage(1); }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={fileCategory === "" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => { setFileCategory(""); setPage(1); }}
                >
                  全部
                </Button>
                <Button
                  variant={fileCategory === "image" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => { setFileCategory("image"); setPage(1); }}
                >
                  图片
                </Button>
                <Button
                  variant={fileCategory === "cad" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => { setFileCategory("cad"); setPage(1); }}
                >
                  CAD
                </Button>
                <Button
                  variant={fileCategory === "3d" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => { setFileCategory("3d"); setPage(1); }}
                >
                  3D
                </Button>
                <Button
                  variant={fileCategory === "document" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => { setFileCategory("document"); setPage(1); }}
                >
                  文档
                </Button>
                <Button
                  variant={fileCategory === "video" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => { setFileCategory("video"); setPage(1); }}
                >
                  视频
                </Button>
              </div>
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

                          {/* Share indicator with expiry */}
                          {file.shareEnabled && (
                            <Badge
                              className={`absolute top-2 right-2 text-[10px] px-1.5 py-0.5 shadow-sm ${
                                file.shareExpiresAt && new Date(file.shareExpiresAt) < new Date()
                                  ? 'bg-red-500/90 text-white'
                                  : file.shareExpiresAt && new Date(file.shareExpiresAt).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000
                                  ? 'bg-orange-500/90 text-white'
                                  : 'bg-primary/90 text-white'
                              }`}
                            >
                              <Link2 className="w-2.5 h-2.5 mr-0.5" />
                              {file.shareExpiresAt && new Date(file.shareExpiresAt) < new Date()
                                ? '已过期'
                                : '分享中'}
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

                            {/* Generate thumbnail (only show when no thumbnail exists, hide for documents) */}
                            {!file.thumbnailUrl && file.s3Url && file.category !== "document" && (
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

                            {/* Allow download toggle */}
                            {file.shareEnabled && (
                              <Button
                                variant={file.allowDownload ? "default" : "outline"}
                                size="sm"
                                className={`h-8 text-xs gap-1 px-2.5 ${file.allowDownload ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                onClick={() => handleToggleAllowDownload(file.id, !file.allowDownload)}
                              >
                                <Download className="w-3.5 h-3.5" />
                                {file.allowDownload ? "可下载" : "禁下载"}
                              </Button>
                            )}

                            {/* Renew share */}
                            {file.shareEnabled && file.shareExpiresAt && (
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-8 text-xs gap-1 px-2.5 ${
                                  new Date(file.shareExpiresAt) < new Date()
                                    ? 'text-red-500 border-red-300 hover:bg-red-50'
                                    : new Date(file.shareExpiresAt).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000
                                    ? 'text-orange-500 border-orange-300 hover:bg-orange-50'
                                    : 'text-green-600 border-green-300 hover:bg-green-50'
                                }`}
                                onClick={() => handleRenewShare(file.id)}
                                disabled={renewShare.isPending}
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(file.shareExpiresAt) < new Date()
                                  ? '重新分享'
                                  : '续期7天'}
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
        </>
        )}

        {/* Tab: Favorites */}
        {activeTab === "favorites" && (
          <>
            {isApproved && <FavoritesSection />}
          </>
        )}

          </div>

          {/* Right Sidebar Navigation (Desktop only) */}
          {!isMobile && (
            <div className="w-48 shrink-0">
              <div className="sticky top-20">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("files")}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      activeTab === "files"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <FileBox className="w-4 h-4" />
                    我的文件
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      activeTab === "favorites"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Heart className="w-4 h-4" />
                    收藏零件
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      activeTab === "profile"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <User className="w-4 h-4" />
                    个人信息
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
