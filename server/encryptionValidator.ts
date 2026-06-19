/**
 * 服务端文件头验证器
 * 在文件保存到 S3 前进行二次验证，防止绕过前端检测。
 * 
 * 支持检测：
 * 1. 天锐绿盾加密 — 文件前4字节为固定签名 0x87 0x7D 0x1C 0xB7
 * 2. 其他透明加密软件 — 通过检查文件头是否符合原始格式的 magic bytes 来判断
 */

interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * 检查 Buffer 是否以指定的 magic bytes 开头
 */
function startsWith(buffer: Buffer, magic: number[]): boolean {
  if (buffer.length < magic.length) return false;
  for (let i = 0; i < magic.length; i++) {
    if (buffer[i] !== magic[i]) return false;
  }
  return true;
}

/**
 * 检查 Buffer 是否包含指定文本
 */
function containsText(buffer: Buffer, text: string, maxOffset: number = 0): boolean {
  const textBuf = Buffer.from(text, "utf-8");
  const searchEnd = maxOffset > 0 ? Math.min(maxOffset, buffer.length - textBuf.length) : buffer.length - textBuf.length;
  for (let offset = 0; offset <= searchEnd; offset++) {
    if (buffer.subarray(offset, offset + textBuf.length).equals(textBuf)) return true;
  }
  return false;
}

/**
 * 检查 Buffer 前 N 字节中可打印 ASCII 字符的比例
 */
function printableRatio(buffer: Buffer, checkBytes: number = 40): number {
  const len = Math.min(buffer.length, checkBytes);
  if (len === 0) return 1;
  let count = 0;
  for (let i = 0; i < len; i++) {
    const b = buffer[i];
    if ((b >= 0x20 && b <= 0x7E) || b === 0x0A || b === 0x0D || b === 0x09) {
      count++;
    }
  }
  return count / len;
}

/**
 * 天锐绿盾加密文件签名
 * 加密文件前4字节固定为 0x87 0x7D 0x1C 0xB7
 * 文件结构: 512字节头部（元数据+零填充）+ 加密后的原始文件内容
 */
const ZHONGRUI_GREENSHIELD_MAGIC = [0x87, 0x7D, 0x1C, 0xB7];

/**
 * 检测是否为天锐绿盾加密文件
 */
function isZhongruiEncrypted(buffer: Buffer): boolean {
  return startsWith(buffer, ZHONGRUI_GREENSHIELD_MAGIC);
}

/**
 * 各格式的服务端验证规则
 */
const VALIDATORS: Record<string, (buffer: Buffer) => ValidationResult> = {
  // ZIP-based: XLSX, DOCX, PPTX, 3MF, ZIP
  xlsx: (buf) => ({
    isValid: startsWith(buf, [0x50, 0x4B, 0x03, 0x04]) || startsWith(buf, [0x50, 0x4B, 0x05, 0x06]),
    reason: "Excel 文件头异常，可能已被加密",
  }),
  docx: (buf) => ({
    isValid: startsWith(buf, [0x50, 0x4B, 0x03, 0x04]) || startsWith(buf, [0x50, 0x4B, 0x05, 0x06]),
    reason: "Word 文件头异常，可能已被加密",
  }),
  pptx: (buf) => ({
    isValid: startsWith(buf, [0x50, 0x4B, 0x03, 0x04]) || startsWith(buf, [0x50, 0x4B, 0x05, 0x06]),
    reason: "PowerPoint 文件头异常，可能已被加密",
  }),
  "3mf": (buf) => ({
    isValid: startsWith(buf, [0x50, 0x4B, 0x03, 0x04]) || startsWith(buf, [0x50, 0x4B, 0x05, 0x06]),
    reason: "3MF 文件头异常，可能已被加密",
  }),
  zip: (buf) => ({
    isValid: startsWith(buf, [0x50, 0x4B, 0x03, 0x04]) || startsWith(buf, [0x50, 0x4B, 0x05, 0x06]),
    reason: "ZIP 文件头异常，可能已被加密",
  }),
  // OLE2: XLS, DOC, PPT
  xls: (buf) => ({
    isValid: startsWith(buf, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]),
    reason: "Excel 文件头异常，可能已被加密",
  }),
  doc: (buf) => ({
    isValid: startsWith(buf, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]),
    reason: "Word 文件头异常，可能已被加密",
  }),
  ppt: (buf) => ({
    isValid: startsWith(buf, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]),
    reason: "PowerPoint 文件头异常，可能已被加密",
  }),
  // Text-based CAD: STP, STEP
  stp: (buf) => ({
    isValid: containsText(buf.subarray(0, 64), "ISO-10303-21", 20),
    reason: "STEP 文件头异常，可能已被加密",
  }),
  step: (buf) => ({
    isValid: containsText(buf.subarray(0, 64), "ISO-10303-21", 20),
    reason: "STEP 文件头异常，可能已被加密",
  }),
  // Text-based: OBJ, IGS, IGES, DXF
  obj: (buf) => ({
    isValid: printableRatio(buf) > 0.85,
    reason: "OBJ 文件内容异常，可能已被加密",
  }),
  igs: (buf) => ({
    isValid: printableRatio(buf) > 0.85,
    reason: "IGES 文件内容异常，可能已被加密",
  }),
  iges: (buf) => ({
    isValid: printableRatio(buf) > 0.85,
    reason: "IGES 文件内容异常，可能已被加密",
  }),
  dxf: (buf) => ({
    isValid: printableRatio(buf) > 0.85,
    reason: "DXF 文件内容异常，可能已被加密",
  }),
  // Binary CAD: DWG
  dwg: (buf) => ({
    isValid: containsText(buf.subarray(0, 10), "AC10", 0) || containsText(buf.subarray(0, 10), "AC2.", 0),
    reason: "DWG 文件头异常，可能已被加密",
  }),
  // STL: text or binary
  stl: (buf) => {
    if (containsText(buf.subarray(0, 10), "solid", 0)) return { isValid: true };
    let highByteCount = 0;
    const checkLen = Math.min(buf.length, 20);
    for (let i = 0; i < checkLen; i++) {
      if (buf[i] > 0x7F) highByteCount++;
    }
    return {
      isValid: highByteCount / checkLen < 0.7,
      reason: "STL 文件头异常，可能已被加密",
    };
  },
  // PDF
  pdf: (buf) => ({
    isValid: containsText(buf.subarray(0, 10), "%PDF", 0),
    reason: "PDF 文件头异常，可能已被加密",
  }),
  // SVG (XML-based)
  svg: (buf) => {
    const text = buf.subarray(0, 64).toString("utf-8");
    return {
      isValid: text.includes("<?xml") || text.includes("<svg") || text.includes("<!DOCTYPE svg"),
      reason: "SVG 文件内容异常，可能已被加密",
    };
  },
  // Images
  png: (buf) => ({
    isValid: startsWith(buf, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    reason: "PNG 文件头异常，可能已被加密",
  }),
  jpg: (buf) => ({
    isValid: startsWith(buf, [0xFF, 0xD8, 0xFF]),
    reason: "JPEG 文件头异常，可能已被加密",
  }),
  jpeg: (buf) => ({
    isValid: startsWith(buf, [0xFF, 0xD8, 0xFF]),
    reason: "JPEG 文件头异常，可能已被加密",
  }),
  jfif: (buf) => ({
    isValid: startsWith(buf, [0xFF, 0xD8, 0xFF]),
    reason: "JFIF 文件头异常，可能已被加密",
  }),
  gif: (buf) => ({
    isValid: containsText(buf.subarray(0, 10), "GIF87a", 0) || containsText(buf.subarray(0, 10), "GIF89a", 0),
    reason: "GIF 文件头异常，可能已被加密",
  }),
  // RAR
  rar: (buf) => ({
    isValid: startsWith(buf, [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07]),
    reason: "RAR 文件头异常，可能已被加密",
  }),
  // Video
  mp4: (buf) => ({
    isValid: buf.length >= 8 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70,
    reason: "MP4 文件头异常，可能已被加密",
  }),
  mov: (buf) => ({
    isValid: buf.length >= 8 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70,
    reason: "MOV 文件头异常，可能已被加密",
  }),
  webm: (buf) => ({
    isValid: startsWith(buf, [0x1A, 0x45, 0xDF, 0xA3]),
    reason: "WebM 文件头异常，可能已被加密",
  }),
};

/**
 * 服务端验证文件是否被加密
 * @param fileBuffer 文件内容 Buffer
 * @param fileExt 文件扩展名（不含点号）
 * @returns 验证结果
 */
export function validateFileHeader(fileBuffer: Buffer, fileExt: string): ValidationResult {
  const ext = fileExt.toLowerCase();

  // 文件太小无法判断，放行
  if (fileBuffer.length < 4) {
    return { isValid: true };
  }

  // 优先检测：天锐绿盾加密签名（适用于所有文件格式）
  if (isZhongruiEncrypted(fileBuffer)) {
    return {
      isValid: false,
      reason: "检测到天锐绿盾加密签名，该文件已被加密",
    };
  }

  // 其次检测：文件头不符合原始格式签名
  const validator = VALIDATORS[ext];
  if (!validator) {
    return { isValid: true };
  }

  return validator(fileBuffer);
}
