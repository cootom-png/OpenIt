import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileBox,
  Trash2,
  Search,
  ArrowLeft,
  HardDrive,
  Users,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LogOut,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  UserCircle,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminNav from "@/components/AdminNav";

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

export default function AdminFiles() {
  const { user: oauthUser } = useAuth();
  const { emailUser, isLoggedIn, isAdmin: isEmailAdmin, logout } = useEmailAuth();
  const [, navigate] = useLocation();

  const isOAuthAdmin = oauthUser?.role === "admin";
  const isAdmin = isOAuthAdmin || isEmailAdmin;

  const [activeTab, setActiveTab] = useState<"files" | "requests">("files");
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Download requests state
  const [drPage, setDrPage] = useState(1);
  const [drStatusFilter, setDrStatusFilter] = useState("all");
  const [drSearchInput, setDrSearchInput] = useState("");
  const [drSearchQuery, setDrSearchQuery] = useState("");

  const queryInput = useMemo(
    () => ({
      page,
      pageSize,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      search: searchQuery || undefined,
    }),
    [page, pageSize, categoryFilter, searchQuery]
  );

  const { data: filesData, refetch } = trpc.adminFiles.list.useQuery(queryInput, { enabled: isAdmin });
  const { data: stats } = trpc.adminFiles.stats.useQuery(undefined, { enabled: isAdmin });

  const deleteMut = trpc.adminFiles.delete.useMutation({
    onSuccess: () => { toast.success("文件已删除"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  // Download requests queries
  const drQueryInput = useMemo(
    () => ({
      page: drPage,
      pageSize,
      status: drStatusFilter === "all" ? undefined : drStatusFilter,
      search: drSearchQuery || undefined,
    }),
    [drPage, pageSize, drStatusFilter, drSearchQuery]
  );
  const { data: drData, refetch: drRefetch } = trpc.adminDownloadRequests.list.useQuery(drQueryInput, { enabled: isAdmin && activeTab === "requests" });
  const { data: drStats } = trpc.adminDownloadRequests.stats.useQuery(undefined, { enabled: isAdmin });
  const updateDrStatus = trpc.adminDownloadRequests.updateStatus.useMutation({
    onSuccess: () => { toast.success("状态已更新"); drRefetch(); },
    onError: (err) => toast.error(err.message),
  });

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <FileBox className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <h2 className="text-lg font-semibold mb-2">无权限访问</h2>
            <p className="text-sm text-muted-foreground mb-4">您没有管理员权限</p>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPages = Math.ceil((filesData?.total || 0) / pageSize);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav onLogout={logout} />
      {/* Sub header with actions */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">文件管理</h2>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" />
            刷新
          </Button>
        </div>
      </header>

      <main className="container py-6 max-w-6xl mx-auto space-y-6">

        {/* Tab Switcher */}
        <div className="flex gap-1 border-b">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "files" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => { setActiveTab("files"); }}
          >
            <FileBox className="w-4 h-4 inline mr-1.5" />
            文件列表
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "requests" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => { setActiveTab("requests"); }}
          >
            <Download className="w-4 h-4 inline mr-1.5" />
            下载申请
            {drStats && drStats.pending > 0 && (
              <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5 py-0">{drStats.pending}</Badge>
            )}
          </button>
        </div>

        {/* Stats Cards - Files Tab */}
        {activeTab === "files" && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileBox className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">总文件数</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalFiles}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">总存储</span>
                </div>
                <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">分享中</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalShared}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards - Requests Tab */}
        {activeTab === "requests" && drStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">总申请</span>
                </div>
                <p className="text-2xl font-bold">{drStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">待处理</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{drStats.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">已通过</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{drStats.approved}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">已拒绝</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{drStats.rejected}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters - Files Tab */}
        {activeTab === "files" && <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-1">
            <Input
              placeholder="搜索文件名或用户..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="类别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类别</SelectItem>
              <SelectItem value="3d">3D 模型</SelectItem>
              <SelectItem value="cad">CAD 图纸</SelectItem>
              <SelectItem value="image">图片</SelectItem>
              <SelectItem value="video">视频</SelectItem>
              <SelectItem value="document">文档</SelectItem>
            </SelectContent>
          </Select>
        </div>}

        {/* Filters - Requests Tab */}
        {activeTab === "requests" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="搜索申请人姓名/邮箱/公司..."
                value={drSearchInput}
                onChange={(e) => setDrSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (() => { setDrSearchQuery(drSearchInput.trim()); setDrPage(1); })()}
                className="max-w-xs"
              />
              <Button variant="outline" size="sm" onClick={() => { setDrSearchQuery(drSearchInput.trim()); setDrPage(1); }}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Select value={drStatusFilter} onValueChange={(v) => { setDrStatusFilter(v); setDrPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Files Table */}
        {activeTab === "files" && <Card>
          <CardContent className="pt-4">
            {filesData && filesData.records.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead className="min-w-[150px]">文件名</TableHead>
                        <TableHead className="w-[80px]">格式</TableHead>
                        <TableHead className="w-[80px]">大小</TableHead>
                        <TableHead className="w-[80px]">类别</TableHead>
                        <TableHead className="w-[120px]">上传者</TableHead>
                        <TableHead className="w-[60px]">分享</TableHead>
                        <TableHead className="w-[60px]">浏览</TableHead>
                        <TableHead className="w-[60px]">申请</TableHead>
                        <TableHead className="w-[130px]">上传时间</TableHead>
                        <TableHead className="w-[80px] text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filesData.records.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="text-xs text-muted-foreground">{file.id}</TableCell>
                          <TableCell>
                            <span className="text-sm truncate block max-w-[180px]" title={file.fileName}>
                              {file.fileName}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{file.fileExt.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatFileSize(file.fileSize)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {categoryLabels[file.category] || file.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs truncate block max-w-[100px]" title={file.ownerNickname || file.ownerEmail}>
                              {file.ownerNickname || file.ownerEmail}
                            </span>
                          </TableCell>
                          <TableCell>
                            {file.shareEnabled ? (
                              <Badge variant="default" className="text-[10px] py-0">开</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] py-0">关</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3" />
                              {file.viewCount ?? 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Download className="w-3 h-3" />
                              {file.downloadRequestCount ?? 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(file.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {file.s3Url && (
                                <a href={file.s3Url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="查看文件">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Button>
                                </a>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" title="删除">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确定要删除文件 "{file.fileName}"（上传者: {file.ownerNickname}）吗？此操作不可撤销。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteMut.mutate({ fileId: file.id })}>
                                      确认删除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">共 {filesData.total} 个文件</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-7" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                      <Button variant="outline" size="sm" className="h-7" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileBox className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">暂无文件</p>
              </div>
            )}
          </CardContent>
        </Card>}

        {/* Download Requests Table */}
        {activeTab === "requests" && (
          <Card>
            <CardContent className="pt-4">
              {drData && drData.records.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">ID</TableHead>
                          <TableHead className="min-w-[120px]">申请人</TableHead>
                          <TableHead className="w-[160px]">邮箱</TableHead>
                          <TableHead className="w-[120px]">电话</TableHead>
                          <TableHead className="w-[120px]">公司</TableHead>
                          <TableHead className="min-w-[120px]">申请文件</TableHead>
                          <TableHead className="w-[80px]">状态</TableHead>
                          <TableHead className="w-[130px]">申请时间</TableHead>
                          <TableHead className="w-[100px] text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drData.records.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="text-xs text-muted-foreground">{req.id}</TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{req.realName}</div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">{req.email}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">{req.phone}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs truncate block max-w-[120px]" title={req.company}>{req.company}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs truncate block max-w-[120px]" title={req.fileName}>
                                {req.fileName}.{req.fileExt}
                              </span>
                              <span className="text-[10px] text-muted-foreground">上传者: {req.ownerNickname}</span>
                            </TableCell>
                            <TableCell>
                              {req.status === "pending" && <Badge variant="outline" className="text-[10px] py-0 text-amber-600 border-amber-300">待处理</Badge>}
                              {req.status === "approved" && <Badge variant="default" className="text-[10px] py-0 bg-green-600">已通过</Badge>}
                              {req.status === "rejected" && <Badge variant="destructive" className="text-[10px] py-0">已拒绝</Badge>}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(req.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              {req.status === "pending" && (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="通过"
                                    onClick={() => updateDrStatus.mutate({ requestId: req.id, status: "approved" })}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="拒绝"
                                    onClick={() => updateDrStatus.mutate({ requestId: req.id, status: "rejected" })}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {Math.ceil((drData.total || 0) / pageSize) > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">共 {drData.total} 条申请</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-7" onClick={() => setDrPage((p) => Math.max(1, p - 1))} disabled={drPage <= 1}>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        <span className="text-xs text-muted-foreground">{drPage} / {Math.ceil((drData.total || 0) / pageSize)}</span>
                        <Button variant="outline" size="sm" className="h-7" onClick={() => setDrPage((p) => p + 1)} disabled={drPage >= Math.ceil((drData.total || 0) / pageSize)}>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无下载申请</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
