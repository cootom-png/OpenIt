/**
 * 加密文件检测器
 * 通过检查文件头（Magic Bytes）判断文件是否被透明加密软件加密。
 * 
 * 支持检测：
 * 1. 天锐绿盾加密 — 文件前4字节为固定签名 0x87 0x7D 0x1C 0xB7，
 *    后跟512字节头部（含元数据+零填充），原始文件内容从偏移0x200开始被加密。
 * 2. 其他透明加密软件 — 通过检查文件头是否符合原始格式的 magic bytes 来判断。
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
 * 天锐绿盾加密文件签名
 * 加密文件前4字节固定为 0x87 0x7D 0x1C 0xB7
 */
const ZHONGRUI_GREENSHIELD_MAGIC = [0x87, 0x7D, 0x1C, 0xB7];

/**
 * 检测是否为天锐绿盾加密文件
 * 特征：前4字节为 0x877d1cb7，偏移0x1A到0x1FF全为零，文件体从0x200开始
 */
function isZhongruiEncrypted(header: Uint8Array): boolean {
  return startsWith(header, ZHONGRUI_GREENSHIELD_MAGIC);
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
      if (header.length < 10) return true;
      let printableCount = 0;
      for (let i = 0; i < Math.min(header.length, 40); i++) {
        if ((header[i] >= 0x20 && header[i] <= 0x7E) || header[i] === 0x0A || header[i] === 0x0D) {
          printableCount++;
        }
      }
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
      if (containsText(header, "solid", 0)) return true;
      if (header.length >= 10) {
        let highByteCount = 0;
        for (let i = 0; i < Math.min(header.length, 20); i++) {
          if (header[i] > 0x7F) highByteCount++;
        }
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
  // RAR
  rar: {
    check: (header) => startsWith(header, [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07]),
    label: "RAR 压缩包 (.rar)",
  },
  // MP4/MOV
  mp4: {
    check: (header) => {
      // MP4/MOV: 偏移4-7为 "ftyp"
      if (header.length >= 8) {
        return header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70;
      }
      return true;
    },
    label: "MP4 视频 (.mp4)",
  },
  mov: {
    check: (header) => {
      if (header.length >= 8) {
        return header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70;
      }
      return true;
    },
    label: "MOV 视频 (.mov)",
  },
  webm: {
    check: (header) => startsWith(header, [0x1A, 0x45, 0xDF, 0xA3]),
    label: "WebM 视频 (.webm)",
  },
};

/**
 * 检测文件是否被加密
 * @param file 要检测的文件
 * @returns 检测结果
 */
export async function detectEncryptedFile(file: File): Promise<DetectionResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  try {
    const header = await readFileHeader(file, 64);

    // 文件太小，无法判断
    if (header.length < 4) {
      return { isEncrypted: false };
    }

    // 优先检测：天锐绿盾加密签名（适用于所有文件格式）
    if (isZhongruiEncrypted(header)) {
      const formatLabel = FORMAT_SIGNATURES[ext]?.label || `${ext.toUpperCase()} 文件`;
      return {
        isEncrypted: true,
        message: `检测到该${formatLabel}已被天锐绿盾加密软件加密。加密文件上传后他人无法正常打开，请先解密后再上传。`,
      };
    }

    // 其次检测：文件头不符合原始格式签名（其他加密软件或文件损坏）
    const detector = FORMAT_SIGNATURES[ext];
    if (!detector) {
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
    return { isEncrypted: false };
  }
}

/**
 * 需要检测的文件扩展名列表（加密软件常加密的格式）
 */
export const ENCRYPTED_CHECK_EXTENSIONS = [
  "xlsx", "xls", "docx", "doc", "pptx", "ppt",
  "stp", "step", "stl", "obj", "3mf", "igs", "iges",
  "pdf", "dxf", "dwg", "svg", "zip", "rar",
  "mp4", "mov", "webm",
  "jpg", "jpeg", "png", "gif",
];

/**
 * 判断文件是否需要进行加密检测
 */
export function needsEncryptionCheck(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return ENCRYPTED_CHECK_EXTENSIONS.includes(ext);
}
