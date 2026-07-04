import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Box,
  FileText,
  Image,
  Video,
  FileSpreadsheet,
  Upload,
  Share2,
  Shield,
  MousePointer,
  HelpCircle,
  Monitor,
  Users,
  Clock,
  FolderOpen,
  Lock,
  Zap,
  Archive,
  Mail,
  FileCode2,
  Search,
  Download,
} from "lucide-react";

export default function HelpGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                首页
              </Button>
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h1 className="text-base font-semibold">操作说明</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="space-y-6">

          {/* 平台简介 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                平台简介
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                零件云图是一款在线文件预览与分享工具，支持 3D 模型、CAD 图纸、图片、视频、文档、邮件、Markdown、压缩包等多种格式的上传、在线预览和分享。
              </p>
              <p>
                注册用户可将文件保存到个人账户，生成分享链接发送给客户或同事查看。无需安装任何软件，浏览器即可打开 STP、DWG 等专业格式文件。
              </p>
            </CardContent>
          </Card>

          {/* 支持的文件格式 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                支持的文件格式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Box className="w-4 h-4 text-blue-500" />
                    3D 模型文件
                  </div>
                  <p className="text-muted-foreground pl-6">
                    STP / STEP / STL / OBJ / 3MF / IGS 格式，使用 WASM 引擎在浏览器端解析渲染
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <FileText className="w-4 h-4 text-green-500" />
                    CAD 图纸
                  </div>
                  <p className="text-muted-foreground pl-6">
                    DXF 使用 WebGL 引擎渲染；DWG 使用 CAD Viewer WebGL 引擎渲染
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Image className="w-4 h-4 text-orange-500" />
                    图片
                  </div>
                  <p className="text-muted-foreground pl-6">
                    JPG / JFIF / PNG / GIF / SVG / WebP / BMP / TIFF 格式，支持缩放、平移、旋转、下载
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Video className="w-4 h-4 text-red-500" />
                    视频
                  </div>
                  <p className="text-muted-foreground pl-6">
                    MP4 / MOV / WebM 格式，支持播放、暂停、进度跳转、全屏
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <FileText className="w-4 h-4 text-red-600" />
                    PDF 文档
                  </div>
                  <p className="text-muted-foreground pl-6">
                    支持翻页、缩放、旋转、下载
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Office 文档
                  </div>
                  <p className="text-muted-foreground pl-6">
                    Word (DOCX)、Excel (XLSX)、CSV 支持在线预览；CSV 支持编码自动检测（GBK/UTF-8 等）
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Archive className="w-4 h-4 text-yellow-600" />
                    压缩包
                  </div>
                  <p className="text-muted-foreground pl-6">
                    ZIP / RAR / 7z 格式，支持在线浏览文件树、关键字搜索文件名、解压下载（ZIP 格式）
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Mail className="w-4 h-4 text-blue-400" />
                    邮件文件
                  </div>
                  <p className="text-muted-foreground pl-6">
                    EML / MSG 格式，在线预览邮件头（发件人、收件人、主题、日期）、正文及附件列表，仅预览不保存
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <FileCode2 className="w-4 h-4 text-purple-500" />
                    Markdown 文档
                  </div>
                  <p className="text-muted-foreground pl-6">
                    .md 格式，支持 GitHub 风格 Markdown 渲染（标题、列表、代码块、表格等），可保存到我的文件
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作方式 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-blue-600" />
                预览操作方式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Box className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground mb-1">3D 模型</div>
                    <p className="text-muted-foreground">左键拖拽旋转 / 滚轮缩放 / 右键拖拽平移 / 双击全屏</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <FileText className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground mb-1">2D 图纸 (DXF / DWG)</div>
                    <p className="text-muted-foreground">左键拖拽平移 / 按住滚轮左右移动 / 滚轮缩放</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Image className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground mb-1">图片</div>
                    <p className="text-muted-foreground">拖拽平移 / 滚轮缩放 / 工具栏旋转和下载</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Video className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground mb-1">视频</div>
                    <p className="text-muted-foreground">点击播放/暂停 / 拖动进度条跳转 / 全屏播放</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <FileText className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground mb-1">PDF / Word / Excel</div>
                    <p className="text-muted-foreground">滚动浏览 / 翻页 / 缩放查看 / 切换工作表（Excel）</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Archive className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground mb-1">压缩包 (ZIP / RAR / 7z)</div>
                    <p className="text-muted-foreground">展开/折叠文件夹 / 搜索框过滤文件名 / 点击"解压下载"将压缩包解压为带根文件夹的新 ZIP 下载</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Mail className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground mb-1">邮件 (EML / MSG)</div>
                    <p className="text-muted-foreground">查看邮件头信息（发件人、收件人、主题、日期）、正文内容（HTML 或纯文本）及附件列表；邮件文件仅供预览，不支持保存</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <FileCode2 className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground mb-1">Markdown (.md)</div>
                    <p className="text-muted-foreground">渲染为格式化文档，支持标题、列表、代码块、表格、粗体、斜体等 GitHub 风格语法</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 压缩包搜索与解压 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Archive className="w-5 h-5 text-blue-600" />
                压缩包搜索与解压下载
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div className="flex items-start gap-2">
                <Search className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">文件搜索：</span>
                  <span className="ml-1">打开压缩包后，顶部搜索框可输入关键字实时过滤文件树。匹配的文件名会高亮显示，包含匹配文件的文件夹会自动展开。搜索结果统计显示"匹配数 / 总文件数"。</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Download className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">解压下载：</span>
                  <span className="ml-1">点击右上角"解压下载"按钮，系统会将压缩包内所有文件解压并自动创建以原文件名命名的根文件夹，重新打包为新的 ZIP 文件后下载到本地。此功能需要登录账户。</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 渲染精度设置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                3D 渲染精度设置
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                打开 STP / STEP / IGS / IGES 格式的 3D 文件后，预览框下方会显示模型统计信息（零件数量、顶点数、解析耗时）以及精度选择器。
              </p>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">快速模式：</span>
                <span>解析速度快，适合大型文件快速预览，网格较粗。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">标准模式：</span>
                <span>平衡精度与速度，推荐日常使用。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">高精度模式：</span>
                <span>曲面最光滑，适合精密零件查看，解析时间较长。</span>
              </div>
              <Separator />
              <p>
                切换精度后系统会自动重新解析文件，解析完成后 3D 视图自动更新。图片和 CAD 文件的信息也会显示在预览框正下方。
              </p>
            </CardContent>
          </Card>

          {/* 文件上传与保存 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                文件上传与保存
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">访客上传：</span>
                <span>无需登录即可上传文件进行在线预览，但文件不会保存，关闭页面后丢失。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">注册用户：</span>
                <span>上传文件后可点击"保存到我的文件"将文件持久化存储到个人账户，支持后续管理和分享。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">仅预览格式：</span>
                <span>邮件文件（EML / MSG）仅供在线预览，不支持保存到账户。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">上传其他文件：</span>
                <span>预览文件后，点击蓝色的"上传其他文件"按钮可快速切换到新文件。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">存储配额：</span>
                <span>每个用户最多保存 50 个文件，总空间 500MB，单文件不超过 100MB。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">大文件提示：</span>
                <span>STEP 等 3D 文件首次加载需要初始化 WASM 引擎，可能需要几秒钟，请耐心等待。</span>
              </div>
            </CardContent>
          </Card>

          {/* 文件分享 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                文件分享
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">生成链接：</span>
                <span>保存文件后，点击"生成分享链接"即可获得一个可分享的 URL，发送给他人即可查看文件预览。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <span>分享链接默认有效期为 <strong className="text-foreground">7 天</strong>，过期后链接自动失效。可在"我的文件"中续期或重新开启分享。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <span>分享页面仅供在线预览，不提供源文件下载功能，保护文件安全。</span>
              </div>
            </CardContent>
          </Card>

          {/* 注册与账户 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                注册与账户
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">注册信息：</span>
                <span>注册时需填写公司名称、电话、姓名、邮箱和密码。信息不完整将无法使用文件保存和分享功能。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">审核流程：</span>
                <span>注册后需等待管理员审核通过，审核通过后方可使用完整功能（保存文件、生成分享链接等）。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">密码要求：</span>
                <span>密码至少 8 位，需包含大写字母、小写字母和数字。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">忘记密码：</span>
                <span>在登录页点击"忘记密码"，提交重置请求后联系管理员获取重置码，凭重置码设置新密码。</span>
              </div>
            </CardContent>
          </Card>

          {/* 3D零件库 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                3D 零件库
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                3D 零件库展示平台上所有用户上传的 3D 模型文件（STP/STEP/STL），以卡片缩略图形式呈现，支持按名称搜索和按格式筛选。
              </p>
              <Separator />
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <span>注册并审核通过的用户可点击缩略图查看 3D 在线预览；未注册或未审核用户仅可浏览缩略图。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <FolderOpen className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <span>审核通过的用户还可以收藏感兴趣的零件，在个人中心"收藏零件"标签页中统一管理。</span>
              </div>
            </CardContent>
          </Card>

          {/* 页面布局说明 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                页面布局
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">左侧区域：</span>
                <span>文件预览区，包括 3D 模型、CAD 图纸、图片、视频等的可视化展示。预览框下方显示对应的文件统计信息（模型统计、图片信息、图纸信息等）。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">右侧区域：</span>
                <span>文件信息面板和操作按钮。包括文件名、大小、格式等基本信息，以及"上传其他文件"、"保存到我的文件"、"我的文件"等操作入口。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">顶部导航：</span>
                <span>点击左上角 Logo 或"零件云图"标题可随时返回首页。右侧提供 3D 零件库、登录/注册入口。</span>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground shrink-0">个人中心：</span>
                <span>登录后点击用户名进入个人中心，包含三个标签页：我的文件（文件管理与配额）、收藏零件（收藏的 3D 零件）、个人信息（修改昵称和密码）。</span>
              </div>
            </CardContent>
          </Card>

          {/* 注意事项 */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                <Shield className="w-5 h-5" />
                注意事项
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800/80 space-y-2">
              <ul className="space-y-2 list-disc pl-4">
                <li>请使用现代浏览器（Chrome、Edge、Firefox）访问本平台，以获得最佳预览体验。</li>
                <li>3D 模型和 CAD 图纸依赖 WebGL 渲染，请确保浏览器已启用硬件加速。</li>
                <li>大文件（如复杂 STEP 模型）解析可能需要较长时间，可先使用"快速模式"预览再切换到高精度。</li>
                <li>分享链接有效期为 7 天，过期后需在"我的文件"中手动续期。</li>
                <li>邮件文件（EML / MSG）仅供在线预览，不会保存到账户，关闭页面后不可恢复。</li>
                <li>压缩包"解压下载"功能需要登录账户后才能使用。</li>
                <li>上传的文件请勿包含敏感或机密信息，平台管理员可查看所有文件。</li>
                <li>如遇到问题，请联系管理员获取帮助。</li>
              </ul>
            </CardContent>
          </Card>

          {/* 返回首页 */}
          <div className="flex justify-center pt-4 pb-8">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
