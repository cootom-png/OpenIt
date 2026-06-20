import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: "至少 8 个字符", pass: password.length >= 8 },
    { label: "包含大写字母", pass: /[A-Z]/.test(password) },
    { label: "包含小写字母", pass: /[a-z]/.test(password) },
    { label: "包含数字", pass: /[0-9]/.test(password) },
  ];
  const passCount = checks.filter((c) => c.pass).length;
  const strength = passCount === 0 ? 0 : passCount <= 2 ? 1 : passCount <= 3 ? 2 : 3;
  const strengthLabels = ["", "弱", "中", "强"];
  const strengthColors = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength ? strengthColors[strength] : "bg-slate-600"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          密码强度: {strengthLabels[strength] || ""}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1 text-xs ${c.pass ? "text-green-400" : "text-slate-500"}`}>
            {c.pass ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [, navigate] = useLocation();

  const resetMutation = trpc.emailAuth.resetPasswordWithCode.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("请输入您的注册邮箱");
      return;
    }
    if (!resetCode.trim()) {
      setError("请输入重置码");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (newPassword.length < 8) {
      setError("密码至少需要 8 个字符");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("密码需要包含大写字母、小写字母和数字");
      return;
    }

    try {
      await resetMutation.mutateAsync({
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "重置失败，请重试");
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
          <p className="text-slate-400 mt-1">在线预览、分享CAD和3D文件</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              重置密码
            </CardTitle>
            <CardDescription className="text-slate-400">
              输入管理员提供的重置码和您的新密码
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">密码重置成功！</p>
                    <p className="text-sm text-green-400/80 mt-1">您可以使用新密码登录了。</p>
                  </div>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate("/login")}
                >
                  前往登录
                </Button>
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

                <div className="space-y-2">
                  <Label htmlFor="resetCode" className="text-slate-300">重置码</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="resetCode"
                      type="text"
                      placeholder="输入 6 位数字重置码"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      maxLength={6}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 tracking-widest text-center text-lg font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300">新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="设置新密码"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={newPassword} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">确认新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="再次输入新密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400">两次输入的密码不一致</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      重置中...
                    </>
                  ) : (
                    "重置密码"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          {!success && (
            <CardFooter className="flex flex-col gap-2 border-t border-slate-700/50 pt-4">
              <p className="text-sm text-slate-400">
                还没有重置码？{" "}
                <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium">
                  申请重置
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
