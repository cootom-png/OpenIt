declare module "dxf-viewer" {
  import { Color } from "three";

  interface DxfViewerOptions {
    canvasWidth?: number;
    canvasHeight?: number;
    autoResize?: boolean;
    clearColor?: Color;
    clearAlpha?: number;
    canvasAlpha?: boolean;
    canvasPremultipliedAlpha?: boolean;
    antialias?: boolean;
    colorCorrection?: boolean;
    blackWhiteInversion?: boolean;
    pointSize?: number;
    preserveDrawingBuffer?: boolean;
    sceneOptions?: {
      wireframeMesh?: boolean;
    };
    retainParsedDxf?: boolean;
  }

  interface LayerInfo {
    name: string;
    displayName: string;
    color: number;
  }

  interface LoadParams {
    url: string;
    fonts?: string[];
    progressCbk?: (phase: string, processedSize: number, totalSize: number) => void;
    workerFactory?: () => Worker;
  }

  export class DxfViewer {
    constructor(domContainer: HTMLElement, options?: DxfViewerOptions);
    HasRenderer(): boolean;
    Load(params: LoadParams): Promise<void>;
    Render(): void;
    GetLayers(nonEmptyOnly?: boolean): LayerInfo[];
    ShowLayer(name: string, show: boolean): void;
    Clear(): void;
    Destroy(): void;
    SetSize(width: number, height: number): void;
    Subscribe(eventName: string, eventHandler: (...args: any[]) => void): void;
    Unsubscribe(eventName: string, eventHandler: (...args: any[]) => void): void;
  }

  export class DxfFetcher {
    constructor(url: string, encoding?: string);
    Fetch(progressCbk?: (phase: string, receivedSize: number, totalSize: number) => void): Promise<any>;
  }
}
