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
