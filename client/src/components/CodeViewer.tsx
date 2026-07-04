import { useEffect, useState } from "react";

interface CodeViewerProps {
  file: File;
  hideDownload?: boolean;
}

// Simple syntax highlighting for CSS
function highlightCSS(code: string): string {
  return code
    // Comments
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>')
    // Strings
    .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="code-string">$&</span>')
    // Properties (before colon)
    .replace(/([a-z-]+)(\s*:)/g, '<span class="code-property">$1</span>$2')
    // Values with units
    .replace(/(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms|deg|fr)/g, '<span class="code-number">$1$2</span>')
    // Colors
    .replace(/(#[0-9a-fA-F]{3,8})/g, '<span class="code-color">$1</span>')
    // Selectors (lines that end with {)
    .replace(/^([^{}\n]+)(\{)/gm, '<span class="code-selector">$1</span>$2')
    // Keywords
    .replace(/\b(import|from|!important|@media|@keyframes|@font-face|@import|@charset|@supports|@layer)\b/g, '<span class="code-keyword">$1</span>');
}

export default function CodeViewer({ file }: CodeViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  useEffect(() => {
    const readFile = async () => {
      try {
        setLoading(true);
        setError(null);
        const text = await file.text();
        setContent(text);
      } catch (err) {
        setError("无法读取文件");
        console.error("Code file read error:", err);
      } finally {
        setLoading(false);
      }
    };
    readFile();
  }, [file]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">正在加载文件...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ minHeight: "400px" }}>
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const lines = content.split("\n");
  const highlighted = ext === "css" ? highlightCSS(content) : content;

  return (
    <div className="w-full h-full overflow-auto bg-[#1e1e1e]" style={{ minHeight: "400px" }}>
      {/* Header bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#569cd6]">{ext.toUpperCase()}</span>
          <span className="text-xs text-[#808080]">{file.name}</span>
        </div>
        <span className="text-xs text-[#808080]">{lines.length} 行</span>
      </div>

      {/* Code content */}
      <div className="flex font-mono text-sm leading-6">
        {/* Line numbers */}
        <div className="sticky left-0 select-none text-right pr-4 pl-4 py-4 text-[#858585] bg-[#1e1e1e] border-r border-[#3c3c3c]" style={{ minWidth: "3.5rem" }}>
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code */}
        <pre className="flex-1 py-4 px-4 overflow-x-auto text-[#d4d4d4] m-0">
          {ext === "css" ? (
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          ) : (
            <code>{content}</code>
          )}
        </pre>
      </div>

      {/* Syntax highlighting styles */}
      <style>{`
        .code-comment { color: #6a9955; }
        .code-string { color: #ce9178; }
        .code-property { color: #9cdcfe; }
        .code-number { color: #b5cea8; }
        .code-color { color: #ce9178; }
        .code-selector { color: #d7ba7d; }
        .code-keyword { color: #c586c0; }
      `}</style>
    </div>
  );
}
