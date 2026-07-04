/** Quality presets for STEP/IGES tessellation */
export type MeshQuality = "fast" | "standard" | "high";

export const QUALITY_PRESETS: Record<
  MeshQuality,
  { linearDeflection: number; angularDeflection: number; label: string }
> = {
  fast: { linearDeflection: 0.5, angularDeflection: 0.5, label: "快速" },
  standard: { linearDeflection: 0.1, angularDeflection: 0.3, label: "标准" },
  high: { linearDeflection: 0.01, angularDeflection: 0.1, label: "高精度" },
};

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}
