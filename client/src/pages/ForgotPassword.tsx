import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const requestReset = trpc.emailAuth.requestPasswordReset.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("请输入您的注册邮箱");
      return;
    }

    try {
      await requestReset.mutateAsync({ email: email.trim() });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "提交失败，请重试");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            返回登录
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">零件云图</h1>
          <p className="text-slate-400 mt-1">医疗推车零件库 & 在线预览管理</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">忘记密码</CardTitle>
            <CardDescription className="text-slate-400">
              输入您的注册邮箱，我们将通知管理员为您生成密码重置码
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">重置请求已提交</p>
                    <p className="text-sm text-green-400/80">
                      管理员将为您生成密码重置码，请通过微信或电话联系管理员获取重置码。
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 text-sm text-slate-300 space-y-2">
                  <p className="font-medium">下一步操作：</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>联系管理员获取 6 位数字重置码</li>
                    <li>前往重置密码页面输入重置码和新密码</li>
                  </ol>
                </div>
                <Link href="/reset-password">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    我已获得重置码，去重置密码
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50">
                    返回登录
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">注册邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={requestReset.isPending}
                >
                  {requestReset.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    "提交重置请求"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          {!submitted && (
            <CardFooter className="flex flex-col gap-2 border-t border-slate-700/50 pt-4">
              <p className="text-sm text-slate-400">
                已有重置码？{" "}
                <Link href="/reset-password" className="text-blue-400 hover:text-blue-300 font-medium">
                  重置密码
                </Link>
              </p>
              <p className="text-sm text-slate-400">
                想起密码了？{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  返回登录
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
