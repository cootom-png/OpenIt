import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileWarning,
  Files,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import AdminNav from "@/components/AdminNav";

const CATEGORY_LABELS: Record<string, string> = {
  "3d": "3D 模型",
  cad: "CAD 图纸",
  image: "图片",
  video: "视频",
  document: "文档",
  unknown: "未知格式",
};

const CATEGORY_COLORS: Record<string, string> = {
  "3d": "bg-blue-500",
  cad: "bg-green-500",
  image: "bg-purple-500",
  video: "bg-orange-500",
  document: "bg-cyan-500",
  unknown: "bg-red-500",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AdminStats() {
  const { user: oauthUser, loading: authLoading } = useAuth();
  const { emailUser, isAdmin: isEmailAdmin, isLoading: emailAuthLoading, logout } = useEmailAuth();
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterSupported, setFilterSupported] = useState<boolean | undefined>(undefined);
  const [filterEncrypted, setFilterEncrypted] = useState<boolean | undefined>(undefined);
  const pageSize = 15;

  const isAdmin = oauthUser?.role === "admin" || isEmailAdmin;

  const statsQuery = trpc.fileUpload.stats.useQuery(undefined, {
    enabled: isAdmin,
  });

  const listQuery = trpc.fileUpload.list.useQuery(
    { page, pageSize, category: filterCategory, isSupported: filterSupported, isEncrypted: filterEncrypted },
    { enabled: isAdmin }
  );

  // Auth loading state
  if (authLoading || emailAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  // Not admin (neither OAuth admin nor email admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">权限不足</h2>
            <p className="text-gray-500 mb-4">请先以管理员身份登录</p>
            <Link href="/admin-login">
              <Button>管理员登录</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = statsQuery.data;
  const list = listQuery.data;
  const totalPages = list ? Math.ceil(list.total / pageSize) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">总上传次数</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.total ?? "—"}
                  </p>
                </div>
                <Files className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">支持的格式</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats?.byExt?.length ?? "—"}
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">不支持的格式</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats?.unsupported?.length ?? "—"}
                  </p>
                </div>
                <FileWarning className="w-10 h-10 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">文件类别数</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats?.byCategory?.length ?? "—"}
                  </p>
                </div>
                <Filter className="w-10 h-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution & Unsupported Formats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">按类别分布</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.byCategory && stats.byCategory.length > 0 ? (
                <div className="space-y-3">
                  {stats.byCategory.map((item) => {
                    const pct = stats.total > 0 ? ((item.count / stats.total) * 100).toFixed(1) : "0";
                    return (
                      <div key={item.category} className="flex items-center gap-3">
                        <div className="w-20 text-sm text-gray-600">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${CATEGORY_COLORS[item.category] || "bg-gray-400"} flex items-center justify-end pr-2`}
                            style={{ width: `${Math.max(Number(pct), 5)}%` }}
                          >
                            <span className="text-xs text-white font-medium">{item.count}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 w-14 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">暂无数据</p>
              )}
            </CardContent>
          </Card>

          {/* Top Extensions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">格式使用排行</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.byExt && stats.byExt.length > 0 ? (
                <div className="space-y-2">
                  {stats.byExt.slice(0, 10).map((item, idx) => (
                    <div key={item.ext} className="flex items-center gap-3">
                      <span className="w-6 text-sm text-gray-400 text-right">{idx + 1}.</span>
                      <Badge variant="outline" className="font-mono">
                        .{item.ext}
                      </Badge>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-400"
                          style={{
                            width: `${Math.max(
                              (item.count / (stats.byExt[0]?.count || 1)) * 100,
                              8
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 font-medium w-10 text-right">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">暂无数据</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unsupported Formats Alert */}
        {stats?.unsupported && stats.unsupported.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-base text-red-700 flex items-center gap-2">
                <FileWarning className="w-5 h-5" />
                用户上传了但不支持的格式（建议后期开发）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {stats.unsupported.map((item) => (
                  <div
                    key={item.ext}
                    className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-2"
                  >
                    <Badge variant="destructive" className="font-mono">
                      .{item.ext}
                    </Badge>
                    <span className="text-sm text-red-600 font-medium">{item.count} 次</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Records Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">上传记录</CardTitle>
              <div className="flex items-center gap-2">
                {/* Category filter */}
                <select
                  className="text-sm border rounded px-2 py-1 bg-white"
                  value={filterCategory || ""}
                  onChange={(e) => {
                    setFilterCategory(e.target.value || undefined);
                    setPage(1);
                  }}
                >
                  <option value="">全部类别</option>
                  <option value="3d">3D 模型</option>
                  <option value="cad">CAD 图纸</option>
                  <option value="image">图片</option>
                  <option value="video">视频</option>
                  <option value="document">文档</option>
                  <option value="unknown">未知格式</option>
                </select>
                {/* Supported filter */}
                <select
                  className="text-sm border rounded px-2 py-1 bg-white"
                  value={filterSupported === undefined ? "" : filterSupported ? "true" : "false"}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilterSupported(v === "" ? undefined : v === "true");
                    setPage(1);
                  }}
                >
                  <option value="">全部状态</option>
                  <option value="true">已支持</option>
                  <option value="false">不支持</option>
                </select>
                {/* Encrypted filter */}
                <select
                  className="text-sm border rounded px-2 py-1 bg-white"
                  value={filterEncrypted === undefined ? "" : filterEncrypted ? "true" : "false"}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilterEncrypted(v === "" ? undefined : v === "true");
                    setPage(1);
                  }}
                >
                  <option value="">全部加密状态</option>
                  <option value="true">加密拦截</option>
                  <option value="false">正常文件</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">时间</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">文件名</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">格式</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">大小</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">类别</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">状态</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">用户</th>
                  </tr>
                </thead>
                <tbody>
                  {list?.records && list.records.length > 0 ? (
                    list.records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                          {formatDate(record.createdAt)}
                        </td>
                        <td className="py-2 px-3 max-w-[200px] truncate" title={record.fileName}>
                          {record.fileName}
                        </td>
                        <td className="py-2 px-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            .{record.fileExt}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                          {formatFileSize(record.fileSize)}
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            variant="secondary"
                            className={`text-xs text-white ${CATEGORY_COLORS[record.category] || "bg-gray-400"}`}
                          >
                            {CATEGORY_LABELS[record.category] || record.category}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          {(record as any).isEncrypted ? (
                            <Badge variant="destructive" className="text-xs bg-red-600">
                              🔒 加密拦截
                            </Badge>
                          ) : record.isSupported ? (
                            <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                              已支持
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              不支持
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {record.userName || "匿名"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        暂无上传记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">
                  共 {list?.total || 0} 条记录，第 {page}/{totalPages} 页
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
