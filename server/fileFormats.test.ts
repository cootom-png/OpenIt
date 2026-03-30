import { describe, expect, it } from "vitest";

// Test file extension detection and format support logic
// These mirror the frontend constants in Home.tsx

const SUPPORTED_3D = ["stp", "step", "stl"];
const SUPPORTED_2D = ["dxf"];
const ALL_SUPPORTED = [...SUPPORTED_3D, ...SUPPORTED_2D];

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function getViewerMode(ext: string): "3d" | "2d" | null {
  if (SUPPORTED_3D.includes(ext)) return "3d";
  if (SUPPORTED_2D.includes(ext)) return "2d";
  return null;
}

describe("File format detection", () => {
  it("extracts file extensions correctly", () => {
    expect(getFileExtension("model.stp")).toBe("stp");
    expect(getFileExtension("model.STEP")).toBe("step");
    expect(getFileExtension("drawing.DXF")).toBe("dxf");
    expect(getFileExtension("part.stl")).toBe("stl");
    expect(getFileExtension("file.with.dots.stp")).toBe("stp");
    expect(getFileExtension("noext")).toBe("noext");
    expect(getFileExtension("")).toBe("");
  });

  it("identifies 3D file formats", () => {
    expect(getViewerMode("stp")).toBe("3d");
    expect(getViewerMode("step")).toBe("3d");
    expect(getViewerMode("stl")).toBe("3d");
  });

  it("identifies 2D CAD file formats", () => {
    expect(getViewerMode("dxf")).toBe("2d");
  });

  it("returns null for unsupported formats", () => {
    expect(getViewerMode("dwg")).toBeNull();
    expect(getViewerMode("pdf")).toBeNull();
    expect(getViewerMode("jpg")).toBeNull();
    expect(getViewerMode("obj")).toBeNull();
    expect(getViewerMode("")).toBeNull();
  });

  it("ALL_SUPPORTED includes all formats", () => {
    expect(ALL_SUPPORTED).toContain("stp");
    expect(ALL_SUPPORTED).toContain("step");
    expect(ALL_SUPPORTED).toContain("stl");
    expect(ALL_SUPPORTED).toContain("dxf");
    expect(ALL_SUPPORTED.length).toBe(4);
  });
});
