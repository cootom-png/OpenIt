import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  file: File;
  hideDownload?: boolean;
}

export default function MarkdownViewer({ file, hideDownload }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const readFile = async () => {
      try {
        setLoading(true);
        setError(null);
        const text = await file.text();
        setContent(text);
      } catch (err) {
        setError("无法读取 Markdown 文件");
        console.error("Markdown read error:", err);
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
          <p className="text-sm text-gray-500">正在加载 Markdown 文件...</p>
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

  return (
    <div className="w-full h-full overflow-auto bg-white" style={{ minHeight: "400px" }}>
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <article className="prose prose-sm md:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:px-3 prose-th:py-2 prose-th:bg-gray-50 prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
