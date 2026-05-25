/**
 * 加密文件检测器
 * 通过检查文件头（Magic Bytes）判断文件是否被透明加密软件（如天锐绿盾）加密。
 * 加密后的文件头会被破坏，不再符合原始格式的签名特征。
 */

interface DetectionResult {
  isEncrypted: boolean;
  message?: string;
}

/**
 * 读取文件的前N个字节
 */
async function readFileHeader(file: File, bytes: number = 64): Promise<Uint8Array> {
  const slice = file.slice(0, bytes);
  const buffer = await slice.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * 检查字节数组是否以指定的 magic bytes 开头
 */
function startsWith(header: Uint8Array, magic: number[]): boolean {
  if (header.length < magic.length) return false;
  for (let i = 0; i < magic.length; i++) {
    if (header[i] !== magic[i]) return false;
  }
  return true;
}

/**
 * 检查字节数组是否包含指定的文本（ASCII）
 */
function containsText(header: Uint8Array, text: string, maxOffset: number = 0): boolean {
  const textBytes = new TextEncoder().encode(text);
  const searchEnd = maxOffset > 0 ? Math.min(maxOffset, header.length - textBytes.length) : header.length - textBytes.length;
  for (let offset = 0; offset <= searchEnd; offset++) {
    let match = true;
    for (let i = 0; i < textBytes.length; i++) {
      if (header[offset + i] !== textBytes[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

/**
 * 各格式的正常文件头签名
 */
const FORMAT_SIGNATURES: Record<string, { check: (header: Uint8Array, file: File) => boolean; label: string }> = {
  // XLSX, DOCX, PPTX - 都是 ZIP 格式，以 PK (50 4B 03 04) 开头
  xlsx: {
    check: (header) => startsWith(header, [0x50, 0x4B, 0x03, 0x04]) || startsWith(header, [0x50, 0x4B, 0x05, 0x06]),
    label: "Excel 文件 (.xlsx)",
  },
  docx: {
    check: (header) => startsWith(header, [0x50, 0x4B, 0x03, 0x04]) || startsWith(header, [0x50, 0x4B, 0x05, 0x06]),
    label: "Word 文件 (.docx)",
  },
  pptx: {
    check: (header) => startsWith(header, [0x50, 0x4B, 0x03, 0x04]) || startsWith(header, [0x50, 0x4B, 0x05, 0x06]),
    label: "PowerPoint 文件 (.pptx)",
  },
  // XLS, DOC, PPT - OLE2 格式，以 D0 CF 11 E0 A1 B1 1A E1 开头
  xls: {
    check: (header) => startsWith(header, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]),
    label: "Excel 文件 (.xls)",
  },
  doc: {
    check: (header) => startsWith(header, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]),
    label: "Word 文件 (.doc)",
  },
  ppt: {
    check: (header) => startsWith(header, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]),
    label: "PowerPoint 文件 (.ppt)",
  },
  // STP/STEP - 纯文本格式，以 "ISO-10303-21" 开头
  stp: {
    check: (header) => containsText(header, "ISO-10303-21", 20),
    label: "STEP 文件 (.stp/.step)",
  },
  step: {
    check: (header) => containsText(header, "ISO-10303-21", 20),
    label: "STEP 文件 (.stp/.step)",
  },
  // IGES - 纯文本格式，每行80字符，第73列标识字符
  igs: {
    check: (header) => {
      // IGES 文件通常以空格或字符开头，第73列为 S/G/D/P/T
      // 简单检测：前几个字节应该是可打印ASCII字符
      if (header.length < 10) return true; // 太短无法判断
      let printableCount = 0;
      for (let i = 0; i < Math.min(header.length, 40); i++) {
        if ((header[i] >= 0x20 && header[i] <= 0x7E) || header[i] === 0x0A || header[i] === 0x0D) {
          printableCount++;
        }
      }
      // IGES 是纯文本，至少90%应该是可打印字符
      return printableCount / Math.min(header.length, 40) > 0.85;
    },
    label: "IGES 文件 (.igs/.iges)",
  },
  iges: {
    check: (header) => FORMAT_SIGNATURES.igs.check(header, null as unknown as File),
    label: "IGES 文件 (.igs/.iges)",
  },
  // STL 文本格式以 "solid" 开头，二进制格式有80字节头
  stl: {
    check: (header) => {
      // 文本 STL 以 "solid" 开头
      if (containsText(header, "solid", 0)) return true;
      // 二进制 STL: 80字节头 + 4字节三角面数量，头部通常包含可打印字符或全零
      if (header.length >= 10) {
        // 二进制STL头部不应该全是高位字节（加密特征）
        let highByteCount = 0;
        for (let i = 0; i < Math.min(header.length, 20); i++) {
          if (header[i] > 0x7F) highByteCount++;
        }
        // 正常二进制STL头部大多是可打印字符或零
        return highByteCount / Math.min(header.length, 20) < 0.7;
      }
      return true;
    },
    label: "STL 文件 (.stl)",
  },
  // OBJ - 纯文本格式，以 # 注释或 v/vt/vn/f 开头
  obj: {
    check: (header) => {
      let printableCount = 0;
      for (let i = 0; i < Math.min(header.length, 40); i++) {
        if ((header[i] >= 0x20 && header[i] <= 0x7E) || header[i] === 0x0A || header[i] === 0x0D) {
          printableCount++;
        }
      }
      return printableCount / Math.min(header.length, 40) > 0.85;
    },
    label: "OBJ 文件 (.obj)",
  },
  // 3MF - ZIP 格式
  "3mf": {
    check: (header) => startsWith(header, [0x50, 0x4B, 0x03, 0x04]) || startsWith(header, [0x50, 0x4B, 0x05, 0x06]),
    label: "3MF 文件 (.3mf)",
  },
  // PDF
  pdf: {
    check: (header) => containsText(header, "%PDF", 0),
    label: "PDF 文件 (.pdf)",
  },
  // ZIP
  zip: {
    check: (header) => startsWith(header, [0x50, 0x4B, 0x03, 0x04]) || startsWith(header, [0x50, 0x4B, 0x05, 0x06]),
    label: "ZIP 压缩包 (.zip)",
  },
  // DXF - 纯文本 CAD 格式
  dxf: {
    check: (header) => {
      let printableCount = 0;
      for (let i = 0; i < Math.min(header.length, 40); i++) {
        if ((header[i] >= 0x20 && header[i] <= 0x7E) || header[i] === 0x0A || header[i] === 0x0D || header[i] === 0x09) {
          printableCount++;
        }
      }
      return printableCount / Math.min(header.length, 40) > 0.85;
    },
    label: "DXF 文件 (.dxf)",
  },
  // DWG - 二进制 CAD 格式，以 "AC10" 开头
  dwg: {
    check: (header) => containsText(header, "AC10", 0) || containsText(header, "AC2.", 0),
    label: "DWG 文件 (.dwg)",
  },
  // SVG - XML 格式
  svg: {
    check: (header) => {
      const text = new TextDecoder().decode(header);
      return text.includes("<?xml") || text.includes("<svg") || text.includes("<!DOCTYPE svg");
    },
    label: "SVG 文件 (.svg)",
  },
  // PNG
  png: {
    check: (header) => startsWith(header, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    label: "PNG 图片 (.png)",
  },
  // JPEG
  jpg: {
    check: (header) => startsWith(header, [0xFF, 0xD8, 0xFF]),
    label: "JPEG 图片 (.jpg)",
  },
  jpeg: {
    check: (header) => startsWith(header, [0xFF, 0xD8, 0xFF]),
    label: "JPEG 图片 (.jpeg)",
  },
  // GIF
  gif: {
    check: (header) => containsText(header, "GIF87a", 0) || containsText(header, "GIF89a", 0),
    label: "GIF 图片 (.gif)",
  },
};

/**
 * 检测文件是否被加密
 * @param file 要检测的文件
 * @returns 检测结果
 */
export async function detectEncryptedFile(file: File): Promise<DetectionResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  // 查找对应的格式签名检测器
  const detector = FORMAT_SIGNATURES[ext];
  if (!detector) {
    // 没有对应的检测规则，放行
    return { isEncrypted: false };
  }

  try {
    const header = await readFileHeader(file, 64);

    // 文件太小，无法判断
    if (header.length < 4) {
      return { isEncrypted: false };
    }

    const isValid = detector.check(header, file);

    if (!isValid) {
      return {
        isEncrypted: true,
        message: `检测到 ${detector.label} 的文件头异常，该文件可能已被加密软件加密。加密文件上传后他人无法正常打开，请先解密后再上传。`,
      };
    }

    return { isEncrypted: false };
  } catch {
    // 读取失败，放行
    return { isEncrypted: false };
  }
}

/**
 * 需要检测的文件扩展名列表（绿盾常加密的格式）
 */
export const ENCRYPTED_CHECK_EXTENSIONS = [
  "xlsx", "xls", "docx", "doc", "pptx", "ppt",
  "stp", "step", "stl", "obj", "3mf", "igs", "iges",
  "pdf", "dxf", "dwg", "svg", "zip",
];

/**
 * 判断文件是否需要进行加密检测
 */
export function needsEncryptionCheck(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return ENCRYPTED_CHECK_EXTENSIONS.includes(ext);
}
