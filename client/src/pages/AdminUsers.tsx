import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, CheckCircle, XCircle, Trash2, Search, Users, Clock, UserCheck, UserX,
  Shield, Loader2, ChevronLeft, ChevronRight, BarChart3, LogOut,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user: oauthUser } = useAuth();
  const { emailUser, isAdmin: isEmailAdmin, logout } = useEmailAuth();
  const [, navigate] = useLocation();

  const isAdmin = oauthUser?.role === "admin" || isEmailAdmin;

  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const queryInput = useMemo(() => ({
    page,
    pageSize,
    status: statusFilter !== "all" ? statusFilter as "pending" | "approved" | "rejected" : undefined,
    search: searchQuery || undefined,
  }), [page, pageSize, statusFilter, searchQuery]);

  const { data: usersData, isLoading, refetch } = trpc.adminUsers.list.useQuery(queryInput, {
    enabled: isAdmin,
  });
  const { data: stats } = trpc.adminUsers.stats.useQuery(undefined, {
    enabled: isAdmin,
  });

  const approveMutation = trpc.adminUsers.approve.useMutation({
    onSuccess: () => { toast.success("用户已通过审核"); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const rejectMutation = trpc.adminUsers.reject.useMutation({
    onSuccess: () => { toast.success("用户已被拒绝"); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.adminUsers.delete.useMutation({
    onSuccess: () => { toast.success("用户已删除"); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const updateRoleMutation = trpc.adminUsers.updateRole.useMutation({
    onSuccess: () => { toast.success("角色已更新"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-700">无权访问</h2>
            <p className="text-sm text-slate-500 mt-2">此页面仅管理员可访问</p>
            <Link href="/">
              <Button className="mt-4" variant="outline">返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPages = Math.ceil((usersData?.total || 0) / pageSize);

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">待审核</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">已通过</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">已拒绝</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const roleBadge = (role: string) => {
    if (role === "admin") {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">管理员</Badge>;
    }
    return <Badge variant="outline" className="text-slate-500">普通用户</Badge>;
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                首页
              </Button>
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-semibold text-slate-800">用户管理</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/stats">
              <Button variant="outline" size="sm" className="gap-1">
                <BarChart3 className="w-4 h-4" />
                统计
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={async () => {
                try {
                  await logout();
                  navigate("/");
                } catch {
                  navigate("/");
                }
              }}
            >
              <LogOut className="w-4 h-4" />
              退出
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    <p className="text-xs text-slate-500">总用户</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-slate-500">待审核</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    <p className="text-xs text-slate-500">已通过</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <UserX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    <p className="text-xs text-slate-500">已拒绝</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="搜索邮箱或昵称..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} variant="outline" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="approved">已通过</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">用户列表</CardTitle>
            <CardDescription>共 {usersData?.total || 0} 个用户</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : !usersData?.records.length ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>暂无用户数据</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>昵称</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>文件数</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.records.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-sm text-slate-500">{user.id}</TableCell>
                          <TableCell className="font-medium">{user.nickname}</TableCell>
                          <TableCell className="text-sm text-slate-600">{user.email}</TableCell>
                          <TableCell>{statusBadge(user.status)}</TableCell>
                          <TableCell>{roleBadge(user.role)}</TableCell>
                          <TableCell className="text-sm text-slate-600">{user.fileCount}</TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {user.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-green-600 hover:bg-green-50 border-green-200"
                                    onClick={() => approveMutation.mutate({ userId: user.id })}
                                    disabled={approveMutation.isPending}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                    通过
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-red-600 hover:bg-red-50 border-red-200"
                                    onClick={() => rejectMutation.mutate({ userId: user.id })}
                                    disabled={rejectMutation.isPending}
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-1" />
                                    拒绝
                                  </Button>
                                </>
                              )}
                              {user.status === "rejected" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-green-600 hover:bg-green-50 border-green-200"
                                  onClick={() => approveMutation.mutate({ userId: user.id })}
                                  disabled={approveMutation.isPending}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                  通过
                                </Button>
                              )}
                              {user.status === "approved" && user.role !== "admin" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-purple-600 hover:bg-purple-50 border-purple-200"
                                  onClick={() => updateRoleMutation.mutate({ userId: user.id, role: "admin" })}
                                  disabled={updateRoleMutation.isPending}
                                >
                                  <Shield className="w-3.5 h-3.5 mr-1" />
                                  设为管理员
                                </Button>
                              )}
                              {user.role === "admin" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-slate-600 hover:bg-slate-50"
                                  onClick={() => updateRoleMutation.mutate({ userId: user.id, role: "user" })}
                                  disabled={updateRoleMutation.isPending}
                                >
                                  取消管理员
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-red-600 hover:bg-red-50 border-red-200"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认删除用户</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确定要删除用户 <strong>{user.nickname}</strong>（{user.email}）吗？此操作不可撤销。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => deleteMutation.mutate({ userId: user.id })}
                                    >
                                      删除
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
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-slate-500">
                      第 {page} / {totalPages} 页
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
