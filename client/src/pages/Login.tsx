import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2, Mail, Lock } from "lucide-react";
import { AuthShell } from "@/components/SiteChrome";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loginLoading, isLoggedIn, emailUser } = useEmailAuth();
  const [, navigate] = useLocation();

  // Get redirect path from URL params
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "/";

  // If already logged in, redirect
  if (isLoggedIn) {
    navigate(redirect);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.user.status === "pending") {
          setError("您的账号正在等待管理员审核，审核通过后即可使用完整功能。");
        } else if (result.user.status === "rejected") {
          setError("您的注册申请已被拒绝，如有疑问请联系管理员。");
        } else {
          navigate(redirect);
        }
      }
    } catch (err: any) {
      setError(err.message || "登录失败，请重试");
    }
  };

  return (
    <AuthShell title="登录" subtitle="在线预览、保存和分享 CAD、3D 与工程文件">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-slate-950">登录</CardTitle>
            <CardDescription className="text-slate-500">
              使用您的邮箱和密码登录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 border-slate-200 bg-slate-50 placeholder:text-slate-400 focus-visible:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700">密码</Label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
                    忘记密码？
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 border-slate-200 bg-slate-50 placeholder:text-slate-400 focus-visible:bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              还没有账号？{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                注册
              </Link>
            </p>
          </CardFooter>
        </Card>
    </AuthShell>
  );
}
