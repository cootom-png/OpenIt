import { describe, it, expect } from "vitest";
import { validateFileHeader } from "./encryptionValidator";

describe("Server-side Encryption Validator", () => {
  describe("天锐绿盾加密签名检测", () => {
    it("rejects file with Zhongrui GreenShield magic signature (0x877d1cb7)", () => {
      // 模拟天锐绿盾加密文件头：前4字节为 0x87 0x7D 0x1C 0xB7
      const zhongruiHeader = Buffer.alloc(32);
      zhongruiHeader[0] = 0x87;
      zhongruiHeader[1] = 0x7D;
      zhongruiHeader[2] = 0x1C;
      zhongruiHeader[3] = 0xB7;
      zhongruiHeader[4] = 0x19;
      zhongruiHeader[5] = 0x00;
      zhongruiHeader[6] = 0x02;
      zhongruiHeader[7] = 0x00;

      // 应该对所有格式都检测出加密
      expect(validateFileHeader(zhongruiHeader, "docx").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "xlsx").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "pdf").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "stp").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "dwg").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "png").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "jpg").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "stl").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "obj").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "svg").isValid).toBe(false);
    });

    it("rejects Zhongrui encrypted file even for unknown extensions", () => {
      const zhongruiHeader = Buffer.from([0x87, 0x7D, 0x1C, 0xB7, 0x19, 0x00, 0x02, 0x00]);
      // 即使是没有专门验证规则的格式，也应该检测出天锐绿盾加密
      expect(validateFileHeader(zhongruiHeader, "mp4").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "rar").isValid).toBe(false);
      expect(validateFileHeader(zhongruiHeader, "txt").isValid).toBe(false);
    });

    it("includes Zhongrui in the rejection reason", () => {
      const zhongruiHeader = Buffer.from([0x87, 0x7D, 0x1C, 0xB7, 0x19, 0x00, 0x02, 0x00]);
      const result = validateFileHeader(zhongruiHeader, "docx");
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("天锐绿盾");
    });
  });

  describe("ZIP-based formats (xlsx, docx, 3mf, zip)", () => {
    it("accepts valid ZIP file (PK header)", () => {
      const validZip = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
      expect(validateFileHeader(validZip, "xlsx").isValid).toBe(true);
      expect(validateFileHeader(validZip, "docx").isValid).toBe(true);
      expect(validateFileHeader(validZip, "3mf").isValid).toBe(true);
      expect(validateFileHeader(validZip, "zip").isValid).toBe(true);
    });

    it("rejects encrypted ZIP file", () => {
      const encrypted = Buffer.from([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55, 0x88, 0x12]);
      expect(validateFileHeader(encrypted, "xlsx").isValid).toBe(false);
      expect(validateFileHeader(encrypted, "docx").isValid).toBe(false);
    });
  });

  describe("OLE2 formats (xls, doc)", () => {
    it("accepts valid OLE2 file", () => {
      const validOLE = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
      expect(validateFileHeader(validOLE, "xls").isValid).toBe(true);
      expect(validateFileHeader(validOLE, "doc").isValid).toBe(true);
    });

    it("rejects encrypted OLE2 file", () => {
      const encrypted = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0]);
      expect(validateFileHeader(encrypted, "xls").isValid).toBe(false);
      expect(validateFileHeader(encrypted, "doc").isValid).toBe(false);
    });
  });

  describe("STP/STEP format", () => {
    it("accepts valid STEP file", () => {
      const validStep = Buffer.from("ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION", "utf-8");
      expect(validateFileHeader(validStep, "stp").isValid).toBe(true);
      expect(validateFileHeader(validStep, "step").isValid).toBe(true);
    });

    it("rejects encrypted STEP file", () => {
      const encrypted = Buffer.alloc(64, 0xA3);
      expect(validateFileHeader(encrypted, "stp").isValid).toBe(false);
    });
  });

  describe("Text-based formats (obj, igs, dxf)", () => {
    it("accepts valid OBJ file (high printable ratio)", () => {
      const validObj = Buffer.from("# OBJ File\nv 1.0 2.0 3.0\nv 4.0 5.0 6.0\nf 1 2 3\n", "utf-8");
      expect(validateFileHeader(validObj, "obj").isValid).toBe(true);
    });

    it("accepts valid IGES file", () => {
      const validIgs = Buffer.from("                                                                        S      1", "utf-8");
      expect(validateFileHeader(validIgs, "igs").isValid).toBe(true);
    });

    it("rejects encrypted text file (mostly binary)", () => {
      const encrypted = Buffer.alloc(64);
      for (let i = 0; i < 64; i++) encrypted[i] = 0x80 + (i % 128);
      expect(validateFileHeader(encrypted, "obj").isValid).toBe(false);
      expect(validateFileHeader(encrypted, "igs").isValid).toBe(false);
      expect(validateFileHeader(encrypted, "dxf").isValid).toBe(false);
    });
  });

  describe("STL format", () => {
    it("accepts valid text STL", () => {
      const validStl = Buffer.from("solid MyPart\nfacet normal 0 0 1\n", "utf-8");
      expect(validateFileHeader(validStl, "stl").isValid).toBe(true);
    });

    it("accepts valid binary STL (low high-byte ratio)", () => {
      const binaryStl = Buffer.alloc(84, 0x00);
      binaryStl.write("Binary STL", 0, "utf-8");
      expect(validateFileHeader(binaryStl, "stl").isValid).toBe(true);
    });

    it("rejects encrypted STL (high-byte dominated)", () => {
      const encrypted = Buffer.alloc(84, 0xEE);
      expect(validateFileHeader(encrypted, "stl").isValid).toBe(false);
    });
  });

  describe("DWG format", () => {
    it("accepts valid DWG file (AC10 header)", () => {
      const validDwg = Buffer.from("AC1032\x00\x00\x00\x00", "utf-8");
      expect(validateFileHeader(validDwg, "dwg").isValid).toBe(true);
    });

    it("rejects encrypted DWG file", () => {
      const encrypted = Buffer.from([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55]);
      expect(validateFileHeader(encrypted, "dwg").isValid).toBe(false);
    });
  });

  describe("PDF format", () => {
    it("accepts valid PDF file", () => {
      const validPdf = Buffer.from("%PDF-1.4\n1 0 obj\n", "utf-8");
      expect(validateFileHeader(validPdf, "pdf").isValid).toBe(true);
    });

    it("rejects encrypted PDF", () => {
      const encrypted = Buffer.alloc(20, 0xA3);
      expect(validateFileHeader(encrypted, "pdf").isValid).toBe(false);
    });
  });

  describe("Image formats", () => {
    it("accepts valid PNG", () => {
      const validPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
      expect(validateFileHeader(validPng, "png").isValid).toBe(true);
    });

    it("accepts valid JPEG", () => {
      const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      expect(validateFileHeader(validJpeg, "jpg").isValid).toBe(true);
      expect(validateFileHeader(validJpeg, "jpeg").isValid).toBe(true);
    });

    it("rejects encrypted images", () => {
      const encrypted = Buffer.from([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55, 0x88, 0x12]);
      expect(validateFileHeader(encrypted, "png").isValid).toBe(false);
      expect(validateFileHeader(encrypted, "jpg").isValid).toBe(false);
    });
  });

  describe("SVG format", () => {
    it("accepts valid SVG with xml declaration", () => {
      const validSvg = Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg">', "utf-8");
      expect(validateFileHeader(validSvg, "svg").isValid).toBe(true);
    });

    it("accepts valid SVG without xml declaration", () => {
      const validSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100">', "utf-8");
      expect(validateFileHeader(validSvg, "svg").isValid).toBe(true);
    });

    it("rejects encrypted SVG", () => {
      const encrypted = Buffer.alloc(64, 0xA3);
      expect(validateFileHeader(encrypted, "svg").isValid).toBe(false);
    });
  });

  describe("Video and archive formats", () => {
    it("accepts valid MP4 (ftyp header)", () => {
      const validMp4 = Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D]);
      expect(validateFileHeader(validMp4, "mp4").isValid).toBe(true);
    });

    it("rejects encrypted MP4", () => {
      const encrypted = Buffer.from([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55, 0x88, 0x12]);
      expect(validateFileHeader(encrypted, "mp4").isValid).toBe(false);
    });

    it("accepts valid RAR", () => {
      const validRar = Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x01, 0x00]);
      expect(validateFileHeader(validRar, "rar").isValid).toBe(true);
    });

    it("rejects encrypted RAR", () => {
      const encrypted = Buffer.from([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55, 0x88, 0x12]);
      expect(validateFileHeader(encrypted, "rar").isValid).toBe(false);
    });
  });

  describe("Unknown/unsupported formats", () => {
    it("passes through unknown extensions (without Zhongrui signature)", () => {
      const anyBuffer = Buffer.from([0xA3, 0x7F, 0x2D, 0x91]);
      expect(validateFileHeader(anyBuffer, "txt").isValid).toBe(true);
      expect(validateFileHeader(anyBuffer, "csv").isValid).toBe(true);
    });

    it("passes through files that are too small", () => {
      const tiny = Buffer.from([0x00, 0x01, 0x02]);
      expect(validateFileHeader(tiny, "xlsx").isValid).toBe(true);
    });
  });
});
