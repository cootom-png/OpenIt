import { useState } from "react";
import { Link } from "wouter";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2, Mail, Lock, User, ArrowLeft, CheckCircle2, Building2, Phone, Info } from "lucide-react";

function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: "至少8位", ok: password.length >= 8 },
    { label: "包含大写字母", ok: /[A-Z]/.test(password) },
    { label: "包含小写字母", ok: /[a-z]/.test(password) },
    { label: "包含数字", ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
      {checks.map((c) => (
        <span key={c.label} className={`text-xs ${c.ok ? "text-green-400" : "text-slate-500"}`}>
          {c.ok ? "✓" : "○"} {c.label}
        </span>
      ))}
    </div>
  );
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [realName, setRealName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { register, registerLoading } = useEmailAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    // Client-side password strength validation
    if (password.length < 8) { setError("密码至少8位"); return; }
    if (!/[A-Z]/.test(password)) { setError("密码需包含至少一个大写字母"); return; }
    if (!/[a-z]/.test(password)) { setError("密码需包含至少一个小写字母"); return; }
    if (!/[0-9]/.test(password)) { setError("密码需包含至少一个数字"); return; }

    try {
      await register(email, password, nickname, realName, company, phone);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "注册失败，请重试");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm shadow-2xl">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">注册成功</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                您的注册申请已提交，请等待管理员审核。<br />
                审核通过后您将可以使用完整功能。
              </p>
              <div className="pt-2 space-y-2">
                <Link href="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    前往登录
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    返回首页
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">零件云图</h1>
          <p className="text-slate-400 mt-1">医疗推车零件库 & 在线预览管理</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">注册账号</CardTitle>
            <CardDescription className="text-slate-400">
              注册后需管理员审核通过才能使用完整功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Important notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm mb-4">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>请填写真实的公司名称、姓名和电话，否则将无法使用文件保存和分享功能。管理员将根据您提供的信息进行审核。</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Section: Personal Info */}
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">个人信息</p>

                <div className="space-y-2">
                  <Label htmlFor="realName" className="text-slate-300">
                    姓名 <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="realName"
                      type="text"
                      placeholder="您的真实姓名"
                      value={realName}
                      onChange={(e) => setRealName(e.target.value)}
                      required
                      maxLength={50}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-300">
                    公司名称 <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="company"
                      type="text"
                      placeholder="您所在的公司名称"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                      maxLength={100}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">
                    电话 <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="您的联系电话"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      maxLength={20}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Account Info */}
              <div className="space-y-3 pt-2 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider pt-2">账号信息</p>

                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-slate-300">昵称</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="显示用的昵称"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      required
                      maxLength={50}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    邮箱 <span className="text-red-400">*</span>
                  </Label>
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
                  <Label htmlFor="password" className="text-slate-300">
                    密码 <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="至少8位，含大小写字母和数字"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>
                  <PasswordStrengthIndicator password={password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">确认密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="再次输入密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-400">两次输入的密码不一致</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={registerLoading}
              >
                {registerLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    注册中...
                  </>
                ) : (
                  "注册"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-700/50 pt-4">
            <p className="text-sm text-slate-400">
              已有账号？{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                登录
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
