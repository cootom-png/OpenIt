import { useState, useEffect, useRef } from "react";
import { Mail, User, Users, Calendar, Paperclip, FileText, AlertCircle } from "lucide-react";

export interface EmailData {
  subject: string;
  from: string;
  to: string;
  cc?: string;
  date: string;
  textContent?: string;
  htmlContent?: string;
  attachments: { name: string; size?: number; contentType?: string }[];
}

interface EmailViewerProps {
  file: File;
  onInfo?: (info: { subject: string; from: string; attachmentCount: number }) => void;
}

/**
 * Parse .eml file content using eml-parse-js
 */
async function parseEmlFile(file: File): Promise<EmailData> {
  const { readEml } = await import("eml-parse-js");
  const text = await file.text();

  return new Promise((resolve, reject) => {
    const result = readEml(text);
    if (result instanceof Error || typeof result === "string") {
      reject(new Error(typeof result === "string" ? result : result.message));
      return;
    }

    const data = result as any;

    // Format email address
    const formatAddr = (addr: any): string => {
      if (!addr) return "未知";
      if (Array.isArray(addr)) {
        return addr.map((a) => (a.name ? `${a.name} <${a.email}>` : a.email)).join("; ");
      }
      return addr.name ? `${addr.name} <${addr.email}>` : addr.email || "未知";
    };

    // Format date
    let dateStr = "";
    if (data.date) {
      try {
        const d = data.date instanceof Date ? data.date : new Date(data.date);
        dateStr = d.toLocaleString("zh-CN");
      } catch {
        dateStr = String(data.date);
      }
    }

    const attachments = (data.attachments || []).map((att: any) => ({
      name: att.name || att.filename || "未命名附件",
      contentType: att.contentType || att.mimeType || "application/octet-stream",
      size: att.data ? (att.data instanceof Uint8Array ? att.data.length : att.data.length) : undefined,
    }));

    resolve({
      subject: data.subject || "(无主题)",
      from: formatAddr(data.from),
      to: formatAddr(data.to),
      cc: data.cc ? formatAddr(data.cc) : undefined,
      date: dateStr,
      textContent: data.text || undefined,
      htmlContent: data.html || undefined,
      attachments,
    });
  });
}

/**
 * Parse .msg file content using dotmsg
 */
async function parseMsgFile(file: File): Promise<EmailData> {
  const { DotMsgParser } = await import("dotmsg");
  const parser = new DotMsgParser();
  const buffer = await file.arrayBuffer();
  await parser.parseBuffer(new Uint8Array(buffer));

  const attachments = (parser.getAttachments() || []).map((att: any) => ({
    name: att.getFilename?.() || att.filename || "未命名附件",
    contentType: "application/octet-stream",
    size: att.getContent?.()?.length || att.content?.length || undefined,
  }));

  // Format date
  let dateStr = "";
  const sentDate = parser.getSentDate();
  if (sentDate) {
    try {
      const d = new Date(sentDate);
      dateStr = isNaN(d.getTime()) ? sentDate : d.toLocaleString("zh-CN");
    } catch {
      dateStr = sentDate;
    }
  }

  return {
    subject: parser.getSubject() || "(无主题)",
    from: parser.getSenderName()
      ? `${parser.getSenderName()} <${parser.getSenderEmail() || ""}>`
      : parser.getSenderEmail() || "未知",
    to: parser.getTo() || "未知",
    cc: parser.getCC()?.join("; ") || undefined,
    date: dateStr,
    textContent: parser.getTextContent() || undefined,
    htmlContent: parser.getHTMLContent() || undefined,
    attachments,
  };
}

export default function EmailViewer({ file, onInfo }: EmailViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [showHtml, setShowHtml] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let cancelled = false;

    const parseEmail = async () => {
      try {
        setLoading(true);
        setError(null);

        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        let data: EmailData;

        if (ext === "eml") {
          data = await parseEmlFile(file);
        } else if (ext === "msg") {
          data = await parseMsgFile(file);
        } else {
          throw new Error(`不支持的邮件格式: .${ext}`);
        }

        if (cancelled) return;

        setEmailData(data);
        setShowHtml(!!data.htmlContent);

        onInfo?.({
          subject: data.subject,
          from: data.from,
          attachmentCount: data.attachments.length,
        });
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || "解析邮件文件失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    parseEmail();
    return () => { cancelled = true; };
  }, [file]);

  // Write HTML content to iframe for safe rendering
  useEffect(() => {
    if (showHtml && emailData?.htmlContent && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #333;
                padding: 16px;
                margin: 0;
                word-wrap: break-word;
              }
              img { max-width: 100%; height: auto; }
              table { border-collapse: collapse; max-width: 100%; }
              td, th { border: 1px solid #ddd; padding: 8px; }
              a { color: #2563eb; }
              pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
            </style>
          </head>
          <body>${emailData.htmlContent}</body>
          </html>
        `);
        doc.close();
      }
    }
  }, [showHtml, emailData?.htmlContent]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">正在解析邮件文件...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ minHeight: "400px" }}>
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">邮件解析失败</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!emailData) return null;

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      {/* Email Header */}
      <div className="border-b bg-muted/30 px-4 py-3 flex-shrink-0">
        <h2 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="truncate">{emailData.subject}</span>
        </h2>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground w-10 flex-shrink-0">发件人</span>
            <span className="text-foreground break-all">{emailData.from}</span>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground w-10 flex-shrink-0">收件人</span>
            <span className="text-foreground break-all">{emailData.to}</span>
          </div>
          {emailData.cc && (
            <div className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground w-10 flex-shrink-0">抄送</span>
              <span className="text-foreground break-all">{emailData.cc}</span>
            </div>
          )}
          {emailData.date && (
            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground w-10 flex-shrink-0">日期</span>
              <span className="text-foreground">{emailData.date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Attachments Bar */}
      {emailData.attachments.length > 0 && (
        <div className="border-b bg-amber-50/50 px-4 py-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Paperclip className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-amber-700 font-medium">
              附件 ({emailData.attachments.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {emailData.attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-white border border-amber-200 rounded px-2 py-1 text-xs text-amber-800"
              >
                <FileText className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[150px]">{att.name}</span>
                {att.size && (
                  <span className="text-amber-500 flex-shrink-0">
                    ({formatSize(att.size)})
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-500 mt-1">仅预览模式，附件不可下载</p>
        </div>
      )}

      {/* Content Toggle */}
      {emailData.htmlContent && emailData.textContent && (
        <div className="border-b px-4 py-1.5 flex gap-2 flex-shrink-0">
          <button
            className={`text-xs px-2 py-1 rounded ${showHtml ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            onClick={() => setShowHtml(true)}
          >
            HTML 视图
          </button>
          <button
            className={`text-xs px-2 py-1 rounded ${!showHtml ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            onClick={() => setShowHtml(false)}
          >
            纯文本
          </button>
        </div>
      )}

      {/* Email Body */}
      <div className="flex-1 overflow-auto min-h-0">
        {showHtml && emailData.htmlContent ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
            title="邮件内容"
            style={{ minHeight: "300px" }}
          />
        ) : emailData.textContent ? (
          <div className="p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono">
            {emailData.textContent}
          </div>
        ) : (
          <div className="p-4 text-sm text-muted-foreground italic">
            此邮件没有可显示的正文内容
          </div>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
