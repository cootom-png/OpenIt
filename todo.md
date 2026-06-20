# Project TODO

- [x] 3D文件上传功能（支持STP/STL格式）
- [x] 3D文件在线预览（Three.js渲染）
- [x] 预览交互：旋转、缩放、平移
- [x] 上传+预览集成在同一页面
- [x] 增加CAD文件（DXF）上传支持
- [x] CAD文件浏览器端解析与2D预览渲染（dxf-viewer WebGL引擎）
- [x] 统一文件上传区域支持所有格式（STP/STEP/STL/DXF）
- [x] BUG修复：上传文件后点击"上传其他文件"无法重新上传
- [ ] 研究：STP预览功能做成Windows桌面安装软件的可行性
- [x] 安装@mlightcad/libredwg-web用于浏览器端DWG解析（替代ODA File Converter方案）
- [x] 实现浏览器端DWG→SVG转换预览（libredwg-web WASM引擎 + dwg_to_svg方法）
- [x] 前端集成DWG文件上传与预览流程
- [x] DWG预览功能集成测试验证（15项测试全部通过）
- [x] BUG修复：DWG文件打开时报"falling back to ArrayBuffer instantiation"错误
- [x] BUG修复：DWG文件预览时图像显示非常小，大片空白区域
- [x] BUG修复：DWG文件预览显示为一片黑色，SVG viewBox宽高比极端不均衡(34483×300)
- [x] 改用cad-simple-viewer (WebGL)替代libredwg dwg_to_svg，支持所有DWG实体类型
- [x] 隐藏cad-simple-viewer自带UI控件(关闭按钮、命令栏、下拉按钮)
- [x] 更新右侧面板渲染引擎信息为CAD Viewer (WebGL)
- [x] BUG修复：STP文件上传时报"falling back to ArrayBuffer instantiation"错误
- [x] 将常用CAD字体预集成到CDN，避免每次打开DWG文件都从外网下载字体
- [x] 添加图片格式（JPG/JPEG、PNG、GIF）上传和预览支持
- [x] 添加视频格式（MP4、MOV、WebM、AVI等）上传和预览支持
- [x] 添加PDF文件上传和预览支持
- [x] 添加Word（DOC/DOCX）文件上传和预览支持
- [x] 添加Excel（XLS/XLSX）文件上传和预览支持
- [x] 创建文件上传记录数据库表（file_uploads）
- [x] 创建后端tRPC接口：记录上传、查询统计
- [x] 前端集成：上传文件时自动记录到后端
- [x] 创建独立后台统计页面：上传记录列表、格式分布、不支持格式排行
- [x] 记录不支持的文件格式，便于后期功能开发决策
- [x] BUG修复：STP 和 CAD（DWG/DXF）文件在iOS Safari上无法选择（accept属性限制）

## 第二期：用户体系与文件管理

### 邮箱注册登录
- [x] 数据库：创建 email_users 表（邮箱、密码哈希、昵称、审核状态、角色等）
- [x] 后端：邮箱注册接口（密码bcrypt加密存储）
- [x] 后端：邮箱登录接口（JWT token + cookie）
- [x] 后端：获取当前用户信息接口（emailAuth.me）
- [x] 后端：邮箱用户退出登录接口
- [x] 前端：首页增加登录/注册入口（已登录显示用户名+管理按钮+退出）
- [x] 前端：登录页面（邮箱+密码）
- [x] 前端：注册页面（昵称+邮箱+密码+确认密码）
- [x] 注册后默认待审核状态，需管理员审核通过才能使用完整功能

### 文件持久化与分享
- [x] 数据库：创建 user_files 表（用户ID、文件名、S3路径、分享token、过期时间等）
- [x] 后端：注册用户上传文件持久化到 S3
- [x] 后端：生成分享链接接口
- [x] 后端：通过分享链接访问文件接口
- [x] 后端：用户删除自己文件接口
- [x] 后端：配额限制（50个文件、总500MB、单文件100MB）
- [x] 后端：访客临时文件每周定时清理
- [x] 前端：审核通过用户上传后显示"保存到我的文件"+"生成分享链接"按钮
- [x] 前端：分享链接页面（他人可查看文件预览）
- [x] 前端：用户文件管理页面（查看已上传文件、删除、分享管理）

### 后台管理
- [x] 后端：用户审核接口（通过/拒绝）
- [x] 后端：用户列表管理接口（搜索、筛选、分页）
- [x] 后端：管理员删除用户接口
- [x] 后端：管理员角色设置/取消接口
- [x] 后端：用户统计接口（总数、待审核、已通过、已拒绝）
- [x] 后端：管理员删除用户文件接口
- [x] 前端：后台用户审核页面（通过/拒绝操作）
- [x] 前端：后台用户管理页面（搜索、筛选、分页、删除、角色管理）
- [x] 前端：后台文件管理页面（查看所有用户文件、可删除）

### 用户个人中心
- [x] 前端：用户个人中心页面（/profile）
- [x] 前端：个人信息展示与修改（昵称）
- [x] 前端：用户已上传文件列表（查看、删除、分享链接管理）
- [x] 前端：存储配额使用情况展示
- [x] 首页 header 增加"我的文件"入口
- [x] 首页登录后显著展示存储配额进度条（文件数 x/50，空间 x/500MB）
- [x] 后端：访客临时文件每周定时清理（含管理员手动触发接口）
- [x] BUG修复：分享链接页面 DWG 文件解析失败（singleton 容器绑定问题）
- [x] 个人中心文件列表增加“预览”按钮，点击后可预览文件（与上传时预览效果一致）
- [x] 优化移动端文件列表为卡片式布局（响应式网格：移动端1列/平板2列/桌面3列）
- [x] 为每个上传的文件生成缩略图预览（保存文件时自动截取预览区域画面）
- [x] 缩略图存储到S3，数据库记录缩略图URL（后端uploadThumbnail接口+前端html2canvas截取）
- [x] BUG修复：个人中心文件卡片不显示缩略图（历史文件无缩略图数据）
- [x] 优化：图片类文件直接用S3原图URL作为缩略图，无需html2canvas截取
- [x] 功能：个人中心卡片增加“生成缩略图”按钮，点击后跳转预览并自动截取缩略图
- [x] BUG修复：DWG/STP等WebGL渲染文件缩略图无法生成（改用canvas.toDataURL直接截取）
- [x] 改用 canvas.toDataURL 直接从 WebGL canvas 获取截图替代 html2canvas（Three.js设置preserveDrawingBuffer+智能选择最大canvas）
- [x] BUG修复：DWG文件缩略图截取为黑色（改用WebGL readPixels直接读取像素+白色背景填充+增加等待时间）
- [x] BUG修复：DWG/STP缩略图改用组件ref方法截取（DWG在渲染帧内readPixels+Three.js强制render+toDataURL）
- [x] 功能：后台管理页面添加退出登录按钮（用户管理、文件管理、统计页面）
- [x] BUG修复：DWG文件分享页面加载失败（Worker路径404错误 → 添加Express静态路由/assets/）
- [x] BUG修复：DWG文件分享加载失败（baseUrl 403错误 → 改用CloudFront CDN地址）
- [x] 将CAD Viewer需要的字体资源下载到自己CDN上，不引用外部网站资源
- [x] 去掉分享页面的下载按钮（分享不允许下载源文件）
- [x] 用实际DWG文件测试分享链接功能（验证通过）
- [x] BUG修复：DWG缩略图截取为全黑（monkey-patch getContext强制preserveDrawingBuffer:true）

## 第三期：密码管理

### 修改密码
- [x] 后端：修改密码接口（验证旧密码 + 设置新密码）
- [x] 后端：密码强度验证（至少8位，包含大小写字母和数字）
- [x] 前端：个人中心添加"修改密码"入口和表单

### 忘记密码（管理员手动重置 + 安全码验证）
- [x] 后端：用户提交重置请求接口（通知管理员）
- [x] 后端：管理员生成重置码接口（存数据库，有效期限制）
- [x] 后端：用户通过重置码设置新密码接口
- [x] 前端：登录页添加"忘记密码"链接
- [x] 前端：忘记密码页面（输入邮箱提交重置请求）
- [x] 前端：重置密码页面（输入重置码 + 新密码完成重置）
- [x] 前端：管理后台用户列表增加"生成重置码"按钮

### UI 优化
- [x] 将"我的文件"入口移到顶部 header 用户名旁边（移动端更易发现）

### 注册流程优化
- [x] 数据库：email_users 表增加 company（公司名称）、phone（电话）、realName（姓名）字段
- [x] 后端：注册接口增加 company、phone、realName 参数
- [x] 前端：注册页面增加公司名称、电话、姓名输入框
- [x] 前端：注册页面提示"不提供完整信息将无法使用文件保存和分享功能"

### 3D零件库
- [x] 后端：公开接口列出所有已上传的3D零件（含缩略图）
- [x] 前端：3D零件库页面（卡片缩略图展示）
- [x] 前端：注册用户点击缩略图可查看3D预览
- [x] 前端：未注册用户点击缩略图提示需注册审批
- [x] 前端：header添加"3D零件库"入口链接

### 分享链接有效期
- [x] 数据库：files 表增加 shareExpiresAt 字段（分享过期时间）
- [x] 后端：创建分享时自动设置7天过期时间
- [x] 后端：访问分享链接时检查是否过期，过期返回 expired 标记
- [x] 后端：重新分享接口 renewShare（重置过期时间为7天后）
- [x] 前端：分享页面过期时显示"链接已过期"提示
- [x] 前端：分享页面显示分享到期日期
- [x] 前端：个人中心文件列表显示分享状态和剩余有效期
- [x] 前端：个人中心支持重新开启分享（重置有效期）

### 3D零件库搜索
- [x] 后端：3D零件列表接口增加 search 参数（按文件名模糊搜索）
- [x] 前端：3D零件库页面添加搜索输入框

### BUG修复
- [x] BUG：后台管理页面退出按钮点击无反应（logout后先navigate再refetch）
- [x] UI：去掉页眉上的格式标签文字（3D: STP/STEP/STL、CAD: DXF/DWG、IMG/DOC/PDF）
- [x] 去掉首页右侧操作提示说明文字
- [x] 新建独立"操作说明"帮助页面，介绍网站功能和使用注意事项
- [x] 首页添加"操作说明"链接入口
- [x] BUG修复：后台管理页面退出按钮仍然无反应，管理员无法正常退出

## 第四期：大文件上传优化
- [x] BUG修复：视频文件保存到S3时报 "The string did not match the expected pattern" 错误
- - [x] 后端：分片上传接口（初始化上传、上传分片、合并完成）
- [x] 后端：支持断点续传（记录已上传分片，网络恢复后继续）
- [x] 前端：大文件自动分片上传（超过5MB自动切片）
- [x] 前端：上传进度条显示（实时百分比+速度）
- [x] 前端：网络中断自动重试机制
- [x] 前端：图片上传前自动压缩（降分辨率到2000px+JPEG质量85%）
- [x] 集成到现有"保存到我的文件"流程

## 第五期：视频缩略图自动生成
- [x] 前端：视频上传保存时自动截取视频画面作为缩略图
- [x] 集成到分片上传完成后的流程中
- [x] BUG修复：视频缩略图生成失败（跨域/canvas taint问题）
- [x] BUG修复：视频缩略图生成失败 — context.ts 始终解析 email session（不再仅在 OAuth 缺失时检查）
- [x] BUG修复：captureViaProxy 增加调试日志和超时时间（20s→45s），增加 crossOrigin 属性
- [x] 首页底部添加管理员（Manus OAuth）登录入口
- [x] BUG修复：管理员登录链接 OAuth URL 构建不正确，点击后跳转到 manus.im 首页而非授权页
- [x] BUG修复：管理员 OAuth 授权后不能自动返回首页（Manus OAuth 平台限制，改用管理员密码登录方案）
- [x] 管理员独立密码登录入口（替代 Manus OAuth）
- [x] 分享链接添加"允许下载"选项，用户可自行设置是否允许他人下载

## 第六期：3D零件库申请下载与统计

### 申请下载功能
- [x] 数据库：创建 download_requests 表（申请人信息、文件ID、状态、时间）
- [x] 后端：提交下载申请接口（填写 email/电话/公司/姓名）
- [x] 后端：查询文件的下载申请列表接口（文件上传者可查看）
- [x] 前端：3D零件库页面添加"申请下载"按钮和弹窗表单
- [x] 前端：后台管理文件页面显示下载申请列表（Tab切换）
- [x] 后端：管理员审核下载申请（通过/拒绝）

### 文件浏览与下载统计
- [x] 数据库：user_files 表增加 viewCount（浏览次数）和 downloadRequestCount（申请次数）字段
- [x] 后端：3D零件预览时自动增加浏览计数
- [x] 后端：提交下载申请时自动增加申请计数
- [x] 前端：3D零件库卡片显示浏览次数
- [x] 前端：后台管理文件列表显示浏览次数和申请次数

## 第七期：压缩包格式支持

- [x] 前端：添加 ZIP/RAR 格式到允许上传的文件类型列表
- [x] 前端：ZIP 文件预览组件（展示包内文件清单：文件名、大小、层级）
- [x] 前端：RAR 文件预览组件（展示包内文件清单）
- [x] 安装 JSZip 和 node-unrar-js 解析库
- [x] 后端：文件格式分类中增加"压缩包"类别
- [x] 测试验证 ZIP/RAR 上传和预览功能

## 第八期：OBJ 和 3MF 格式支持

- [x] 前端：添加 OBJ/3MF 格式到允许上传的文件类型列表
- [x] 前端：fileParser.ts 中添加 OBJ 解析（Three.js OBJLoader）
- [x] 前端：fileParser.ts 中添加 3MF 解析（Three.js 3MFLoader）
- [x] 前端：ShareView.tsx 中添加 OBJ/3MF 格式识别
- [x] 测试验证 OBJ/3MF 上传和3D预览功能

## BUG修复

- [x] BUG：/admin/stats 页面已登录用户被提示需要登录，点击登录后又弹回同一页面（登录循环）

## 第九期：后台优化与 IGES 格式支持

- [x] 统一 AdminFiles 页面认证逻辑（已确认存在双重认证，无需修改）
- [x] 添加后台页面间导航菜单（AdminNav 组件，统计/用户管理/文件管理 Tab 切换）
- [x] 添加 IGES/IGS 格式的3D预览支持（复用 occt-import-js 引擎 ReadIgesFile）

- [x] BUG：RAR 文件预览时 WASM 加载失败（已改用服务端 libarchive-wasm 解析）

- [x] 预览框添加全屏切换功能（全屏/退出全屏按钮）

## 第十期：全屏预览体验优化

- [x] 全屏模式下显示文件名和操作提示（半透明叠加层）
- [x] 键盘快捷键支持（F键进入全屏，Esc退出）
- [x] 3D零件库页面也加全屏预览功能

## 第十一期：SVG 预览 + 零件库格式筛选

- [x] 添加 SVG 格式上传支持和浏览器原生预览
- [x] 3D零件库页面添加按文件格式筛选下拉框

## 待办提醒（等用户准备好后执行）

- [ ] 下载申请审核通过后邮件通知（需要用户提供 SMTP 服务器配置：地址、端口、用户名、密码/API Key）

## 第十二期：绿盾加密文件检测与拦截

- [x] 实现前端文件头检测工具函数（检查 XLSX/DOCX/STP 等格式的 magic bytes）
- [x] 在上传流程中集成加密检测，拦截加密文件并提示用户
- [x] 测试验证加密检测功能

## 第十三期：加密检测增强

- [x] 前端：加密文件拦截事件记录到后台统计（记录文件名、格式、时间、用户）
- [x] 服务端：文件保存前进行文件头二次验证，防止绕过前端检测
- [x] 测试验证

## 第十四期：加密文件体验优化

- [x] 后台统计页面增加"加密拦截"筛选标签，快速查看被拦截的加密文件记录
- [x] 加密文件预览时显示红色醒目提示"此文件为加密文件，不能外传和保存，只能预览"
- [x] 加密文件预览时上传按钮置灰不可点击

## 品�- [x] 全站品牌名称从"CORITON 康瑞通"更新为"零件云图"

## 加密检测升级

- [x] 分析天锐绿盾加密文件二进制特征（magic: 0x877d1cb7, 512字节头部）
- [x] 前端加密检测器加入天锐绿盾签名优先检测
- [x] 服务端加密验证器加入天锐绿盾签名优先检测
- [x] 新增 MP4/MOV/WebM/RAR 格式的加密检测支持
- [x] 更新测试用例覆盖天锐绿盾检测场景（175项全部通过）�零件云图”

## Encryption Detection Upgrade

- [x] Analyzed Zhongrui GreenShield encrypted file binary signature (magic: 0x877d1cb7, 512-byte header)
- [x] Frontend encryption detector: added Zhongrui GreenShield signature priority detection
- [x] Server encryption validator: added Zhongrui GreenShield signature priority detection
- [x] Added MP4/MOV/WebM/RAR format encryption detection support
- [x] Updated test cases covering Zhongrui detection scenarios (175 tests all passed)

## Encryption Detection Flow Fix

- [x] Fix: encrypted files now intercepted before reaching Word/PDF/Excel parsers (no more JSZip error)
- [x] New "encrypted" viewer mode shows full-page red warning with lock icon, file info, and guidance
- [x] Sidebar encrypted warning card updated to match new viewerMode-based detection
- [x] Save button correctly disabled for encrypted files using viewerMode check
- [x] Corrected encryption software name from "中锐绿盾" to "天锐绿盾" across all files
- [x] All 175 tests pass

## JFIF 图片格式支持

- [x] 添加 .jfif 格式到支持的图片格式列表
- [x] 添加 .jfif 到加密检测扩展名列表

## 图片格式扩展

- [x] 首页格式标签中添加 .JFIF 显示
- [x] 添加 .webp 格式支持（上传、预览、加密检测）
- [x] 添加 .bmp 格式支持（上传、预览、加密检测）
- [x] 添加 .tiff/.tif 格式支持（上传、预览、加密检测）

## STP 预览质量优化

- [x] STP 文件 3D 渲染锯齿感优化（提高抗锯齿质量/添加清晰度设置）
  - ThreeViewer: 启用 antialias + 高 pixelRatio + MeshStandardMaterial(PBR) + HemisphereLight + 3方向光
  - fileParser: 默认 linearDeflection 从 0.5 降到 0.1，曲面网格更精细
  - 添加渲染精度选择器（快速/标准/高精度），切换后自动重新解析
- [x] Logo 和"零件云图"标题添加返回主页链接（Link href="/"）

## BUG修复：全屏退出布局异常

- [x] BUG：CAD/3D STP 文件全屏后按 ESC 返回，右侧面板（文件信息、模型统计）显示到屏幕外

## UI优化：右侧面板按钮位置调整

- [x] 将操作按钮（上传其他文件、保存我的文件、我的文件）移到文件信息和模型统计之间，按钮顺序：上传其他文件 > 保存我的文件 > 我的文件

## UI优化：模型统计位置调整

- [x] 将模型统计信息从右侧面板移到左侦3D预览框下方（电脑端），并合并精度选择器到同一行

## UI优化：信息面板位置 & 按钮样式

- [x] 图片信息移到图片预览框下方（与3D模型统计位置一致）
- [x] CAD图纸信息移到图纸预览框下方（与3D模型统计位置一致）
- [x] "上传其他文件"按钮改为蓝色背景（与"保存到我的文件"一样突出）

## 文案 & 帮助页面更新

- [x] 注册页面网站介绍改为"在线预览、分享CAD和3D文件"（同时更新了登录、忘记密码、重置密码页面）
- [x] 操作说明页面根据最新改动更新内容（新增渲染精度设置、页面布局说明、更新支持格式列表）

## 域名替换 & 收藏功能

- [x] 将所有旧域名 coritonparts-3j4sfbgu.manus.space 替换为 cloudparts.manus.space（检查结果：代码中无硬编码旧域名，所有分享链接均使用 window.location.origin 动态生成）
- [x] 3D零件库添加收藏功能（注册用户可收藏别人发布的3D零件）
- [x] 用户后台增加"收藏零件"列表页面

## 个人中心筛选功能 & 版本号

- [x] 我的文件：添加按格式筛选、按名字搜索、快捷分类按钮（图片、CAD、3D、文档、视频）
- [x] 收藏零件：添加类似的筛选功能（搜索 + 图片/CAD/3D 快捷按钮）
- [x] 页面底部（管理员登录位置）显示版本号（v1.2.0，已添加到首页、个人中心、零件库页面）

## BUG修复：收藏零件查看改为直接预览

- [x] 收藏零件"查看"按钮改为"预览"，点击后直接打开文件预览，不跳转到零件库页面

## BUG修复：远程文件精度切换无效

- [x] 远程加载的3D文件（通过URL参数预览）切换精度无反应，因为 loadRemoteFile 没有设置 currentFileObj，导致 handleQualityChange 判断 currentFileObj 为 null 而跳过重新解析（已修复）

## BUG修复：CAD图纸左键拖拽平移无效

- [x] CAD图纸（DXF/DWG）左键拖拽平移功能无反应（DWG查看器加载后设置 viewMode=PAN，DXF查看器已原生支持左键平移）

## 网页描述更新 & CAD操作说明 & 版本号

- [x] 更新所有网页 head 描述（title/meta description）为"零件云图-在线预览、分享CAD和3D文件"
- [x] 更新CAD操作说明：按住滚轮拖动平移（DwgViewer提示、Home.tsx提示、HelpGuide操作说明）
- [x] 更新版本号为 v1.3.0（首页、零件库、个人中心）

## BUG修复：PDF预览首页空白

- [x] PDF文件预览时第一页显示空白（原因：加载完成后容器尚未布局，clientWidth/Height为0导致fitScale无效；修复：添加containerReady状态+ResizeObserver等待容器尺寸就绪后再渲染）

## 新增格式支持：CSV 和 7z

- [x] 添加 .csv 文件预览支持（BOM表格，表格形式展示，支持搜索/分页/缩放）
- [x] 添加 .7z 压缩包支持（服务端 libarchive-wasm 解析，文件列表展示）

## BUG修复：CSV中文乱码

- [x] CSV文件中文字符乱码（使用 jschardet 自动检测编码，支持 GBK/GB2312/GB18030/Big5/UTF-8/UTF-16 等，并在工具栏显示检测到的编码）

## SEO优化：首页

- [x] 添加关键词 meta 标签（CAD在线预览,3D文件查看器,STP预览 等10个关键词）
- [x] 添加 H2 标题（"在线预览CAD和3D文件"）
- [x] 标题长度调整为39字符（"零件云图 - 在线预览、分享CAD和3D文件 | STP/DWG/DXF查看器"）
- [x] 描述长度调整为94字符（包含支持格式和功能介绍）
- [x] 添加 document.title 设置（useEffect 中动态设置）
