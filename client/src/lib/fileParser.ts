import type { ParsedMeshData } from "@/components/ThreeViewer";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
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
  } else {
    throw new Error(`Unsupported file format: .${ext}. Please use .stp, .step, or .stl files.`);
  }
}
