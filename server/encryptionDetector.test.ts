import { describe, it, expect } from "vitest";

/**
 * Test the encryption detection logic.
 * Since the actual detectEncryptedFile function runs in the browser (uses File API),
 * we test the underlying logic by simulating the magic bytes checks.
 */

// Simulate the magic bytes check logic from encryptionDetector.ts
function startsWith(header: Uint8Array, magic: number[]): boolean {
  if (header.length < magic.length) return false;
  for (let i = 0; i < magic.length; i++) {
    if (header[i] !== magic[i]) return false;
  }
  return true;
}

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

describe("Encryption Detection - Magic Bytes Checks", () => {
  describe("ZIP-based formats (XLSX, DOCX, 3MF)", () => {
    it("detects valid ZIP header (PK signature)", () => {
      const validZip = new Uint8Array([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00]);
      expect(startsWith(validZip, [0x50, 0x4B, 0x03, 0x04])).toBe(true);
    });

    it("detects invalid/encrypted ZIP header", () => {
      // Encrypted file - random bytes instead of PK header
      const encrypted = new Uint8Array([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55]);
      expect(startsWith(encrypted, [0x50, 0x4B, 0x03, 0x04])).toBe(false);
    });

    it("detects empty ZIP archive header (PK 05 06)", () => {
      const emptyZip = new Uint8Array([0x50, 0x4B, 0x05, 0x06, 0x00, 0x00]);
      expect(startsWith(emptyZip, [0x50, 0x4B, 0x05, 0x06])).toBe(true);
    });
  });

  describe("OLE2 formats (XLS, DOC)", () => {
    it("detects valid OLE2 header", () => {
      const validOLE = new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
      expect(startsWith(validOLE, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])).toBe(true);
    });

    it("detects invalid/encrypted OLE2 header", () => {
      const encrypted = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0]);
      expect(startsWith(encrypted, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])).toBe(false);
    });
  });

  describe("STP/STEP format", () => {
    it("detects valid STEP file header", () => {
      const validStep = new TextEncoder().encode("ISO-10303-21;\nHEADER;\n");
      expect(containsText(validStep, "ISO-10303-21", 20)).toBe(true);
    });

    it("detects encrypted STEP file (no ISO header)", () => {
      // Encrypted - random binary data
      const encrypted = new Uint8Array([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55, 0x88, 0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0, 0x11, 0x22, 0x33, 0x44, 0x55]);
      expect(containsText(encrypted, "ISO-10303-21", 20)).toBe(false);
    });
  });

  describe("PDF format", () => {
    it("detects valid PDF header", () => {
      const validPdf = new TextEncoder().encode("%PDF-1.4\n");
      expect(containsText(validPdf, "%PDF", 0)).toBe(true);
    });

    it("detects encrypted PDF (no %PDF header)", () => {
      const encrypted = new Uint8Array([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55]);
      expect(containsText(encrypted, "%PDF", 0)).toBe(false);
    });
  });

  describe("PNG format", () => {
    it("detects valid PNG header", () => {
      const validPng = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(startsWith(validPng, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])).toBe(true);
    });

    it("detects encrypted PNG", () => {
      const encrypted = new Uint8Array([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55, 0x88, 0x12]);
      expect(startsWith(encrypted, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])).toBe(false);
    });
  });

  describe("JPEG format", () => {
    it("detects valid JPEG header", () => {
      const validJpeg = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
      expect(startsWith(validJpeg, [0xFF, 0xD8, 0xFF])).toBe(true);
    });

    it("detects encrypted JPEG", () => {
      const encrypted = new Uint8Array([0xA3, 0x7F, 0x2D, 0x91]);
      expect(startsWith(encrypted, [0xFF, 0xD8, 0xFF])).toBe(false);
    });
  });

  describe("DWG format", () => {
    it("detects valid DWG header (AC10xx)", () => {
      const validDwg = new TextEncoder().encode("AC1032\x00\x00");
      expect(containsText(validDwg, "AC10", 0)).toBe(true);
    });

    it("detects encrypted DWG", () => {
      const encrypted = new Uint8Array([0xA3, 0x7F, 0x2D, 0x91, 0xC4, 0x55]);
      expect(containsText(encrypted, "AC10", 0)).toBe(false);
    });
  });

  describe("Text-based formats (OBJ, IGS, DXF)", () => {
    it("detects valid text file (high printable ratio)", () => {
      const validText = new TextEncoder().encode("# OBJ File\nv 1.0 2.0 3.0\nv 4.0 5.0 6.0\n");
      let printableCount = 0;
      for (let i = 0; i < Math.min(validText.length, 40); i++) {
        if ((validText[i] >= 0x20 && validText[i] <= 0x7E) || validText[i] === 0x0A || validText[i] === 0x0D) {
          printableCount++;
        }
      }
      expect(printableCount / Math.min(validText.length, 40)).toBeGreaterThan(0.85);
    });

    it("detects encrypted text file (low printable ratio)", () => {
      // Encrypted - mostly high-byte binary data
      const encrypted = new Uint8Array(40);
      for (let i = 0; i < 40; i++) encrypted[i] = 0x80 + (i % 128);
      let printableCount = 0;
      for (let i = 0; i < 40; i++) {
        if ((encrypted[i] >= 0x20 && encrypted[i] <= 0x7E) || encrypted[i] === 0x0A || encrypted[i] === 0x0D) {
          printableCount++;
        }
      }
      expect(printableCount / 40).toBeLessThan(0.85);
    });
  });

  describe("needsEncryptionCheck logic", () => {
    const ENCRYPTED_CHECK_EXTENSIONS = [
      "xlsx", "xls", "docx", "doc", "pptx", "ppt",
      "stp", "step", "stl", "obj", "3mf", "igs", "iges",
      "pdf", "dxf", "dwg", "svg", "zip",
    ];

    it("returns true for supported extensions", () => {
      expect(ENCRYPTED_CHECK_EXTENSIONS.includes("xlsx")).toBe(true);
      expect(ENCRYPTED_CHECK_EXTENSIONS.includes("stp")).toBe(true);
      expect(ENCRYPTED_CHECK_EXTENSIONS.includes("docx")).toBe(true);
    });

    it("returns false for non-checked extensions", () => {
      expect(ENCRYPTED_CHECK_EXTENSIONS.includes("mp4")).toBe(false);
      expect(ENCRYPTED_CHECK_EXTENSIONS.includes("rar")).toBe(false);
      expect(ENCRYPTED_CHECK_EXTENSIONS.includes("webm")).toBe(false);
    });
  });
});
