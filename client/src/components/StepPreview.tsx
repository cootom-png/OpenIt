import { useState, useEffect, useRef } from "react";
import ThreeViewer, { type ParsedMeshData } from "@/components/ThreeViewer";
import { parseFile } from "@/lib/fileParser";
import { Loader2 } from "lucide-react";

interface StepPreviewProps {
  fileUrl: string;
  fileName: string;
  fileExt: string;
  className?: string;
}

/**
 * Standalone 3D preview component that fetches a file from S3 URL,
 * parses it with WASM, and renders with ThreeViewer.
 */
export default function StepPreview({ fileUrl, fileName, fileExt, className }: StepPreviewProps) {
  const [meshData, setMeshData] = useState<ParsedMeshData | null>(null);
  const [status, setStatus] = useState<"loading" | "parsing" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [parseInfo, setParseInfo] = useState<{ meshCount: number; vertexCount: number; parseTime: number } | null>(null);
  const loadedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!fileUrl || loadedUrlRef.current === fileUrl) return;
    loadedUrlRef.current = fileUrl;

    let cancelled = false;

    async function load() {
      try {
        setStatus("loading");
        setMeshData(null);
        setErrorMsg("");

        // Fetch file from S3
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`下载失败: ${response.status}`);
        const blob = await response.blob();
        const file = new File([blob], fileName || `model.${fileExt}`);

        if (cancelled) return;
        setStatus("parsing");

        // Parse with WASM
        const { data, parseTime } = await parseFile(file);
        if (cancelled) return;

        let totalVerts = 0;
        data.meshes.forEach((m) => {
          totalVerts += m.attributes.position.array.length / 3;
        });

        setMeshData(data);
        setParseInfo({ meshCount: data.meshes.length, vertexCount: totalVerts, parseTime });
        setStatus("ready");
      } catch (err: any) {
        if (cancelled) return;
        console.error("[StepPreview] Error:", err);
        setErrorMsg(err.message || "加载失败");
        setStatus("error");
      }
    }

    load();
    return () => { cancelled = true; };
  }, [fileUrl, fileName, fileExt]);

  return (
    <div className={`relative w-full h-full ${className || ""}`}>
      {/* Loading / Parsing overlay */}
      {(status === "loading" || status === "parsing") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <p className="text-sm text-muted-foreground">
            {status === "loading" ? "正在下载 3D 模型..." : "正在解析 3D 模型（首次加载需初始化 WASM 引擎）..."}
          </p>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-red-500 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* 3D Viewer */}
      <ThreeViewer meshData={meshData} className="w-full h-full" />

      {/* Info bar */}
      {parseInfo && status === "ready" && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-4 text-xs text-muted-foreground bg-white/70 backdrop-blur-sm rounded-md py-1.5 px-3">
          <span>网格: {parseInfo.meshCount}</span>
          <span>顶点: {parseInfo.vertexCount.toLocaleString()}</span>
          <span>解析: {parseInfo.parseTime}ms</span>
          <span className="text-slate-400">左键旋转 / 滚轮缩放 / 右键平移</span>
        </div>
      )}
    </div>
  );
}
