declare module "@mlightcad/libredwg-web" {
  export enum Dwg_File_Type {
    DWG = 0,
    DXF = 1,
  }

  export interface DwgDatabase {
    tables: {
      LAYER: {
        entries: any[];
      };
      BLOCK_RECORD: {
        entries: any[];
      };
      [key: string]: any;
    };
    entities: any[];
    header: any;
    classes: any[];
    objects: any;
  }

  export function createModule(options?: {
    wasmBinary?: ArrayBuffer;
    locateFile?: (filename: string) => string;
  }): Promise<any>;

  export class LibreDwg {
    static create(wasmPath?: string): Promise<LibreDwg>;
    static createByWasmInstance(wasmInstance: any): LibreDwg;
    dwg_read_data(data: Uint8Array, fileType: Dwg_File_Type): any;
    convert(dwgData: any): DwgDatabase;
    convertEx(dwgData: any): { database: DwgDatabase; stats: any };
    dwg_to_svg(db: DwgDatabase): string;
    dwg_free(dwgData: any): void;
    dwg_get_codepage(dwgData: any): number;
    dwg_get_class(dwgData: any, index: number): any;
  }
}
