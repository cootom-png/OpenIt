declare module "occt-import-js" {
  interface OcctImportJsOptions {
    locateFile?: (filename: string) => string;
    wasmBinary?: ArrayBuffer;
  }

  interface OcctMeshAttribute {
    array: Float32Array | number[];
  }

  interface OcctBrepFace {
    first: number;
    last: number;
    color: [number, number, number] | null;
  }

  interface OcctMesh {
    name: string;
    color?: [number, number, number];
    brep_faces: OcctBrepFace[];
    attributes: {
      position: OcctMeshAttribute;
      normal?: OcctMeshAttribute;
    };
    index: {
      array: Uint32Array | number[];
    };
  }

  interface OcctNode {
    name: string;
    meshes?: number[];
    children?: OcctNode[];
  }

  interface OcctResult {
    success: boolean;
    root: OcctNode;
    meshes: OcctMesh[];
  }

  interface ReadParams {
    linearUnit?: "millimeter" | "centimeter" | "meter" | "inch" | "foot";
    linearDeflectionType?: "bounding_box_ratio" | "absolute_value";
    linearDeflection?: number;
    angularDeflection?: number;
  }

  interface OcctInstance {
    ReadStepFile(content: Uint8Array, params: ReadParams | null): OcctResult;
    ReadBrepFile(content: Uint8Array, params: ReadParams | null): OcctResult;
    ReadIgesFile(content: Uint8Array, params: ReadParams | null): OcctResult;
  }

  function occtimportjs(options?: OcctImportJsOptions): Promise<OcctInstance>;
  export default occtimportjs;
}
