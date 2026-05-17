import type { ParsedMeshData } from "@/components/ThreeViewer";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import * as THREE from "three";

const WASM_CDN_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663486221484/3j4sFbGUefQfhYED2wtVaa/occt-import-js_dde0c27b.wasm";

let occtInstance: any = null;

async function getOcctInstance(): Promise<any> {
  if (occtInstance) return occtInstance;

  // Pre-fetch WASM as ArrayBuffer to avoid MIME type issues with instantiateStreaming
  // CDN may not serve .wasm files with correct application/wasm MIME type,
  // causing "falling back to ArrayBuffer instantiation" console errors
  const wasmResponse = await fetch(WASM_CDN_URL);
  const wasmBinary = await wasmResponse.arrayBuffer();

  // Dynamic import of occt-import-js
  const occtimportjs = (await import("occt-import-js")).default;

  // Pass wasmBinary directly to bypass instantiateStreaming and avoid MIME errors
  occtInstance = await occtimportjs({
    wasmBinary: wasmBinary,
    locateFile: (filename: string) => {
      if (filename.endsWith(".wasm")) {
        return WASM_CDN_URL;
      }
      return filename;
    },
  });

  return occtInstance;
}

export async function parseStepFile(fileBuffer: Uint8Array): Promise<ParsedMeshData> {
  const occt = await getOcctInstance();
  const result = occt.ReadStepFile(fileBuffer, {
    linearUnit: "millimeter",
    linearDeflection: 0.5,
    angularDeflection: 0.5,
  });

  if (!result.success) {
    throw new Error("Failed to parse STEP file");
  }

  return {
    meshes: result.meshes.map((mesh: any) => ({
      name: mesh.name || "unnamed",
      color: mesh.color || undefined,
      attributes: {
        position: { array: Array.from(mesh.attributes.position.array) },
        normal: mesh.attributes.normal
          ? { array: Array.from(mesh.attributes.normal.array) }
          : undefined,
      },
      index: { array: Array.from(mesh.index.array) },
    })),
    root: result.root,
  };
}

export function parseStlFile(fileBuffer: ArrayBuffer): ParsedMeshData {
  const loader = new STLLoader();
  const geometry = loader.parse(fileBuffer);

  const positions = Array.from(geometry.attributes.position.array);
  const normals = geometry.attributes.normal
    ? Array.from(geometry.attributes.normal.array)
    : undefined;

  // STL doesn't have indices by default, create them
  const indexArray: number[] = [];
  for (let i = 0; i < positions.length / 3; i++) {
    indexArray.push(i);
  }

  return {
    meshes: [
      {
        name: "STL Model",
        color: [0.6, 0.7, 0.8],
        attributes: {
          position: { array: positions },
          normal: normals ? { array: normals } : undefined,
        },
        index: { array: indexArray },
      },
    ],
  };
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function parseObjFile(text: string): ParsedMeshData {
  const loader = new OBJLoader();
  const group = loader.parse(text);
  const meshes: ParsedMeshData["meshes"] = [];

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry as THREE.BufferGeometry;
      // Ensure geometry has computed normals
      if (!geometry.attributes.normal) {
        geometry.computeVertexNormals();
      }

      const positions = Array.from(geometry.attributes.position.array);
      const normals = geometry.attributes.normal
        ? Array.from(geometry.attributes.normal.array)
        : undefined;

      let indexArray: number[];
      if (geometry.index) {
        indexArray = Array.from(geometry.index.array);
      } else {
        indexArray = [];
        for (let i = 0; i < positions.length / 3; i++) {
          indexArray.push(i);
        }
      }

      // Try to get color from material
      let color: [number, number, number] | undefined;
      const mat = child.material as THREE.MeshPhongMaterial;
      if (mat && mat.color) {
        color = [mat.color.r, mat.color.g, mat.color.b];
      }

      meshes.push({
        name: child.name || "OBJ Mesh",
        color: color || [0.7, 0.7, 0.75],
        attributes: {
          position: { array: positions },
          normal: normals ? { array: normals } : undefined,
        },
        index: { array: indexArray },
      });
    }
  });

  if (meshes.length === 0) {
    throw new Error("OBJ 文件中未找到有效的网格数据");
  }

  return { meshes };
}

export function parse3mfFile(buffer: ArrayBuffer): ParsedMeshData {
  const loader = new ThreeMFLoader();
  const group = loader.parse(buffer);
  const meshes: ParsedMeshData["meshes"] = [];

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry as THREE.BufferGeometry;
      if (!geometry.attributes.normal) {
        geometry.computeVertexNormals();
      }

      const positions = Array.from(geometry.attributes.position.array);
      const normals = geometry.attributes.normal
        ? Array.from(geometry.attributes.normal.array)
        : undefined;

      let indexArray: number[];
      if (geometry.index) {
        indexArray = Array.from(geometry.index.array);
      } else {
        indexArray = [];
        for (let i = 0; i < positions.length / 3; i++) {
          indexArray.push(i);
        }
      }

      // Try to get color from material
      let color: [number, number, number] | undefined;
      const mat = child.material as THREE.MeshPhongMaterial;
      if (mat && mat.color) {
        color = [mat.color.r, mat.color.g, mat.color.b];
      }

      meshes.push({
        name: child.name || "3MF Mesh",
        color: color || [0.6, 0.75, 0.8],
        attributes: {
          position: { array: positions },
          normal: normals ? { array: normals } : undefined,
        },
        index: { array: indexArray },
      });
    }
  });

  if (meshes.length === 0) {
    throw new Error("3MF 文件中未找到有效的网格数据");
  }

  return { meshes };
}

export async function parseFile(
  file: File
): Promise<{ data: ParsedMeshData; parseTime: number }> {
  const ext = getFileExtension(file.name);
  const startTime = performance.now();

  if (ext === "stp" || ext === "step") {
    const buffer = await file.arrayBuffer();
    const data = await parseStepFile(new Uint8Array(buffer));
    return { data, parseTime: performance.now() - startTime };
  } else if (ext === "stl") {
    const buffer = await file.arrayBuffer();
    const data = parseStlFile(buffer);
    return { data, parseTime: performance.now() - startTime };
  } else if (ext === "obj") {
    const text = await file.text();
    const data = parseObjFile(text);
    return { data, parseTime: performance.now() - startTime };
  } else if (ext === "3mf") {
    const buffer = await file.arrayBuffer();
    const data = parse3mfFile(buffer);
    return { data, parseTime: performance.now() - startTime };
  } else {
    throw new Error(`不支持的文件格式: .${ext}。请使用 .stp, .step, .stl, .obj 或 .3mf 文件。`);
  }
}
