import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import {
  Archive,
  ArrowLeft,
  Box,
  Clock,
  Download,
  FileCode2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  HelpCircle,
  Image,
  Lock,
  Mail,
  Monitor,
  MousePointer,
  Search,
  Share2,
  Shield,
  Upload,
  Users,
  Video,
  Zap,
} from "lucide-react";

const supportedFormats = [
  {
    icon: Box,
    title: "3D 模型文件",
    color: "text-blue-500",
    text: "STP / STEP / STL / OBJ / 3MF / IGS / IGES，支持浏览器在线解析和 WebGL 预览。",
  },
  {
    icon: FileText,
    title: "CAD 图纸",
    color: "text-green-500",
    text: "DWG / DXF 图纸可在线打开，适合工程图、加工图和报价图纸快速核对。",
  },
  {
    icon: Archive,
    title: "压缩包",
    color: "text-yellow-600",
    text: "ZIP / RAR / 7Z 支持在线查看文件树、搜索文件名、展开文件夹，并可解压打包下载。",
  },
  {
    icon: FileText,
    title: "PDF 与文档",
    color: "text-red-600",
    text: "PDF / Word / Excel / CSV / Markdown / 文本文件支持在线预览，CSV 支持常见编码识别。",
  },
  {
    icon: Image,
    title: "图片",
    color: "text-orange-500",
    text: "JPG / PNG / GIF / SVG / WebP / BMP / TIFF，可缩放、平移、旋转和下载。",
  },
  {
    icon: Video,
    title: "视频",
    color: "text-red-500",
    text: "MP4 / MOV / WebM 支持播放、暂停、进度跳转和全屏查看。",
  },
  {
    icon: Mail,
    title: "邮件文件",
    color: "text-blue-400",
    text: "EML / MSG 可查看发件人、收件人、主题、日期、正文和附件列表。",
  },
  {
    icon: FileCode2,
    title: "Markdown",
    color: "text-purple-500",
    text: "支持标题、列表、代码块、表格、粗体、斜体等 GitHub 风格 Markdown 语法。",
  },
];

const previewActions = [
  ["3D 模型", "左键拖动旋转，滚轮缩放，右键拖动平移；可根据文件大小选择快速、标准或高精度模式。"],
  ["CAD 图纸", "左键拖动平移，滚轮缩放，适合快速检查 DWG / DXF 图纸细节。"],
  ["PDF / Word / Excel", "滚动浏览、翻页、缩放查看；Excel 可切换工作表。"],
  ["压缩包", "打开 ZIP / RAR / 7Z 后可浏览目录树、搜索文件名、展开或折叠文件夹，并点击“解压下载”。"],
  ["图片 / 视频", "图片支持缩放、平移、旋转；视频支持播放控制、进度跳转和全屏。"],
];

export default function HelpGuide() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader title="操作介绍" icon={<HelpCircle className="h-5 w-5 text-blue-600" />} />

      <main className="mx-auto max-w-4xl px-4 py-5 sm:py-6">
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5 text-blue-600" />
                平台简介
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                零件云图是一款面向工程师、采购、制造、销售和技术支持团队的在线文件预览与分享平台。
                无需安装 CAD、3D 查看器或解压软件，浏览器即可打开 3D 模型、CAD 图纸、PDF、Office 文档、图片、视频、邮件和压缩包。
              </p>
              <p>
                平台支持文件临时预览、登录后保存到个人文件、生成分享链接、客户在线查看，以及 ZIP / RAR / 7Z 压缩包在线查看和解压下载。
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                支持的文件格式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                {supportedFormats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="space-y-2">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Icon className={`h-4 w-4 ${item.color}`} />
                        {item.title}
                      </div>
                      <p className="pl-6 text-muted-foreground">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MousePointer className="h-5 w-5 text-blue-600" />
                预览操作方式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {previewActions.map(([title, text]) => (
                  <div key={title} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                    <MousePointer className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <div>
                      <div className="mb-1 font-medium text-foreground">{title}</div>
                      <p className="text-muted-foreground">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Archive className="h-5 w-5 text-blue-600" />
                压缩包在线查看与解压下载
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span>
                  <strong className="text-foreground">在线浏览：</strong>
                  上传 ZIP、RAR 或 7Z 后，系统会展示压缩包内的文件树，可展开或折叠文件夹，适合先确认客户发来的资料是否完整。
                </span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Search className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span>
                  <strong className="text-foreground">文件搜索：</strong>
                  在搜索框输入零件号、图纸名或后缀名即可过滤文件名，匹配项会高亮显示，包含匹配文件的文件夹会自动展开。
                </span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Download className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span>
                  <strong className="text-foreground">解压下载：</strong>
                  点击“解压下载”后，平台会把压缩包内容解出，并重新打包成一个带原文件名根目录的新 ZIP 文件下载到本地。此功能需要登录账户。
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-blue-600" />
                3D 渲染精度
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>打开 STP / STEP / IGS / IGES 等 3D 文件后，预览区下方会显示模型统计信息，并提供渲染精度选择。</p>
              <Separator />
              <p><strong className="text-foreground">快速模式：</strong>解析速度更快，适合大型文件快速查看。</p>
              <Separator />
              <p><strong className="text-foreground">标准模式：</strong>平衡速度和细节，适合日常预览。</p>
              <Separator />
              <p><strong className="text-foreground">高精度模式：</strong>曲面更细腻，适合精密零件核对，但解析时间会更长。</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-blue-600" />
                上传、保存与分享
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">访客预览：</strong>无需登录即可上传文件进行在线预览，关闭页面后文件不会保存。</p>
              <Separator />
              <p><strong className="text-foreground">保存文件：</strong>注册并审核通过后，可将文件保存到个人账号，便于后续管理和再次分享。</p>
              <Separator />
              <p><strong className="text-foreground">分享链接：</strong>保存文件后可生成分享链接，发送给客户或同事后即可在线查看。分享链接默认有效期为 7 天。</p>
              <Separator />
              <p><strong className="text-foreground">存储额度：</strong>每个用户最多保存 50 个文件，总空间 500MB，单文件不超过 100MB。</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-600" />
                账号与零件库
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>注册时需填写公司名称、电话、姓名、邮箱和密码。账号通过管理员审核后，可使用保存文件、生成分享链接、收藏零件等完整功能。</p>
              <Separator />
              <p>3D 零件库展示平台上的公开模型，支持按名称搜索和按格式筛选。审核通过的用户可打开模型预览并收藏到个人中心。</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-amber-200 bg-amber-50/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-amber-700">
                <Shield className="h-5 w-5" />
                注意事项
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800/80">
              <ul className="space-y-2 pl-4 list-disc">
                <li>建议使用 Chrome、Edge 或 Firefox，并开启硬件加速，以获得更稳定的 3D 和 CAD 预览体验。</li>
                <li>大型 STEP、DWG 或压缩包首次解析可能需要等待，请先使用快速模式或先查看压缩包目录。</li>
                <li>邮件文件仅供在线预览，不会保存到个人账号。</li>
                <li>压缩包“解压下载”需要登录账户；分享页主要用于在线查看，不提供源文件直接下载。</li>
                <li>上传文件请避免包含敏感或机密信息，平台管理员可进行必要的文件管理和问题排查。</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-center pb-8 pt-4">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
