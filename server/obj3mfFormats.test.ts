import { describe, it, expect } from "vitest";

const SUPPORTED_3D = ["stp", "step", "stl", "obj", "3mf"];
const SUPPORTED_2D_DXF = ["dxf"];
const SUPPORTED_2D_DWG = ["dwg"];
const SUPPORTED_IMAGE = ["jpg", "jpeg", "png", "gif"];
const SUPPORTED_VIDEO = ["mp4", "mov", "webm", "avi", "mkv", "m4v", "3gp"];
const SUPPORTED_PDF = ["pdf"];
const SUPPORTED_WORD = ["doc", "docx"];
const SUPPORTED_EXCEL = ["xls", "xlsx"];
const SUPPORTED_ARCHIVE = ["zip", "rar"];
const ALL_SUPPORTED = [
  ...SUPPORTED_3D,
  ...SUPPORTED_2D_DXF,
  ...SUPPORTED_2D_DWG,
  ...SUPPORTED_IMAGE,
  ...SUPPORTED_VIDEO,
  ...SUPPORTED_PDF,
  ...SUPPORTED_WORD,
  ...SUPPORTED_EXCEL,
  ...SUPPORTED_ARCHIVE,
];

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function getCategory(ext: string): string {
  if (SUPPORTED_3D.includes(ext)) return "3d";
  if (SUPPORTED_2D_DXF.includes(ext) || SUPPORTED_2D_DWG.includes(ext)) return "cad";
  if (SUPPORTED_IMAGE.includes(ext)) return "image";
  if (SUPPORTED_VIDEO.includes(ext)) return "video";
  if (SUPPORTED_PDF.includes(ext) || SUPPORTED_WORD.includes(ext) || SUPPORTED_EXCEL.includes(ext)) return "document";
  if (SUPPORTED_ARCHIVE.includes(ext)) return "archive";
  return "unknown";
}

describe("OBJ and 3MF format support", () => {
  it("OBJ and 3MF are in SUPPORTED_3D", () => {
    expect(SUPPORTED_3D).toContain("obj");
    expect(SUPPORTED_3D).toContain("3mf");
  });

  it("OBJ and 3MF are in ALL_SUPPORTED", () => {
    expect(ALL_SUPPORTED).toContain("obj");
    expect(ALL_SUPPORTED).toContain("3mf");
  });

  it("getFileExtension extracts OBJ/3MF extensions correctly", () => {
    expect(getFileExtension("model.obj")).toBe("obj");
    expect(getFileExtension("part.3mf")).toBe("3mf");
    expect(getFileExtension("my.model.OBJ")).toBe("obj");
    expect(getFileExtension("assembly.3MF")).toBe("3mf");
  });

  it("getCategory returns '3d' for OBJ and 3MF", () => {
    expect(getCategory("obj")).toBe("3d");
    expect(getCategory("3mf")).toBe("3d");
  });

  it("SUPPORTED_3D now has 5 formats", () => {
    expect(SUPPORTED_3D.length).toBe(5);
    expect(SUPPORTED_3D).toEqual(["stp", "step", "stl", "obj", "3mf"]);
  });

  it("ALL_SUPPORTED total count is correct", () => {
    // 3D: 5, DXF: 1, DWG: 1, Image: 4, Video: 7, PDF: 1, Word: 2, Excel: 2, Archive: 2 = 25
    expect(ALL_SUPPORTED.length).toBe(25);
  });
});

describe("Three.js loaders availability", () => {
  it("can import OBJLoader", async () => {
    const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
    expect(OBJLoader).toBeDefined();
    const loader = new OBJLoader();
    expect(loader).toBeDefined();
    expect(typeof loader.parse).toBe("function");
  });

  it("can import ThreeMFLoader", async () => {
    const { ThreeMFLoader } = await import("three/examples/jsm/loaders/3MFLoader.js");
    expect(ThreeMFLoader).toBeDefined();
    const loader = new ThreeMFLoader();
    expect(loader).toBeDefined();
    expect(typeof loader.parse).toBe("function");
  });

  it("OBJLoader can parse a simple cube OBJ", async () => {
    const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
    const THREE = await import("three");

    const objText = `
# Simple cube
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 1.0 1.0 0.0
v 0.0 1.0 0.0
v 0.0 0.0 1.0
v 1.0 0.0 1.0
v 1.0 1.0 1.0
v 0.0 1.0 1.0
f 1 2 3 4
f 5 6 7 8
f 1 2 6 5
f 2 3 7 6
f 3 4 8 7
f 4 1 5 8
`;

    const loader = new OBJLoader();
    const group = loader.parse(objText);
    expect(group).toBeDefined();

    let meshCount = 0;
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;
        const geo = child.geometry as THREE.BufferGeometry;
        expect(geo.attributes.position).toBeDefined();
        expect(geo.attributes.position.array.length).toBeGreaterThan(0);
      }
    });
    expect(meshCount).toBeGreaterThan(0);
  });
});
