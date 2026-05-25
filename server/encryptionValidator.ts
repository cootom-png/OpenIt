/**
 * 服务端文件头验证器
 * 在文件保存到 S3 前进行二次验证，防止绕过前端检测。
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
    // Text STL starts with "solid"
    if (containsText(buf.subarray(0, 10), "solid", 0)) return { isValid: true };
    // Binary STL: check that header is not mostly high bytes (encryption signature)
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
  gif: (buf) => ({
    isValid: containsText(buf.subarray(0, 10), "GIF87a", 0) || containsText(buf.subarray(0, 10), "GIF89a", 0),
    reason: "GIF 文件头异常，可能已被加密",
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
  const validator = VALIDATORS[ext];

  // 没有对应验证规则的格式，放行
  if (!validator) {
    return { isValid: true };
  }

  // 文件太小无法判断，放行
  if (fileBuffer.length < 4) {
    return { isValid: true };
  }

  return validator(fileBuffer);
}
