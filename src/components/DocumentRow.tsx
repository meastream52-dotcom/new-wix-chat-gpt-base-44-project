"use client";

import { clsx } from "clsx";
import { useState } from "react";

type DocStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

interface ExtractedField {
  fieldName: string;
  fieldValue: string;
  confidence: number;
}

interface DocumentRowProps {
  id: string;
  name: string;
  fileType?: string | null;
  fileSize?: number | null;
  status: DocStatus;
  extracted: ExtractedField[];
  createdAt: string;
  onDelete?: (id: string) => void;
}

const STATUS_STYLES: Record<DocStatus, string> = {
  PENDING: "text-[#8b949e] bg-[#8b949e]/10",
  PROCESSING: "text-[#d29922] bg-[#d29922]/10",
  DONE: "text-[#3fb950] bg-[#3fb950]/10",
  FAILED: "text-[#f85149] bg-[#f85149]/10",
};

export function DocumentRow({ id, name, fileType, fileSize, status, extracted, createdAt, onDelete }: DocumentRowProps) {
  const [expanded, setExpanded] = useState(false);

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden hover:border-[#30363d] transition-colors">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-lg text-[#8b949e]">
          {fileType?.includes("pdf") ? "📄" : fileType?.includes("image") ? "🖼" : "📝"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[#e6edf3] text-sm truncate">{name}</div>
          <div className="text-[10px] text-[#8b949e] flex gap-2 mt-0.5">
            {fileType && <span>{fileType}</span>}
            {fileSize && <span>{formatSize(fileSize)}</span>}
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <span className={clsx("text-xs px-2 py-1 rounded-full font-medium shrink-0", STATUS_STYLES[status])}>
          {status}
        </span>
        {status === "DONE" && extracted.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#58a6ff] hover:text-[#79c0ff] transition-colors shrink-0"
          >
            {expanded ? "Hide" : "View Extracted"} ({extracted.length})
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="text-[#f85149]/50 hover:text-[#f85149] text-xs transition-colors shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {expanded && extracted.length > 0 && (
        <div className="border-t border-[#21262d] px-4 py-3 bg-[#0f1117]">
          <div className="text-[10px] font-mono text-[#8b949e]/60 uppercase mb-2">Extracted Data</div>
          <div className="grid grid-cols-2 gap-2">
            {extracted.map((field, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="text-[10px] text-[#8b949e] font-medium">{field.fieldName}</div>
                  <div className="text-xs text-[#e6edf3]">{field.fieldValue}</div>
                </div>
                <div
                  className="text-[9px] font-mono shrink-0 mt-1"
                  style={{ color: field.confidence > 0.8 ? "#3fb950" : field.confidence > 0.6 ? "#d29922" : "#f85149" }}
                >
                  {Math.round(field.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
