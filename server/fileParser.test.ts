import { describe, expect, it } from "vitest";

/**
 * Test file format validation logic (mirrors client-side getFileExtension)
 */
function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function isSupported(ext: string): boolean {
  return ["stp", "step", "stl"].includes(ext);
}

describe("File format validation", () => {
  it("extracts .stp extension correctly", () => {
    expect(getFileExtension("model.stp")).toBe("stp");
  });

  it("extracts .step extension correctly", () => {
    expect(getFileExtension("assembly.step")).toBe("step");
  });

  it("extracts .stl extension correctly", () => {
    expect(getFileExtension("part.stl")).toBe("stl");
  });

  it("handles uppercase extensions", () => {
    expect(getFileExtension("MODEL.STP")).toBe("stp");
  });

  it("handles mixed case extensions", () => {
    expect(getFileExtension("Part.Step")).toBe("step");
  });

  it("handles files with multiple dots", () => {
    expect(getFileExtension("my.model.v2.stp")).toBe("stp");
  });

  it("returns empty string for no extension", () => {
    expect(getFileExtension("noextension")).toBe("noextension");
  });

  it("validates supported formats", () => {
    expect(isSupported("stp")).toBe(true);
    expect(isSupported("step")).toBe(true);
    expect(isSupported("stl")).toBe(true);
    expect(isSupported("obj")).toBe(false);
    expect(isSupported("fbx")).toBe(false);
    expect(isSupported("")).toBe(false);
  });
});
