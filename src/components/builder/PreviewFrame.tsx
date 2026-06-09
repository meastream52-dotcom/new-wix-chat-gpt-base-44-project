"use client";

interface PreviewFrameProps {
  deployUrl: string | null;
  projectStatus: string;
  className?: string;
}

export function PreviewFrame({ deployUrl, projectStatus, className }: PreviewFrameProps) {
  if (deployUrl) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#21262d] bg-[#161b22]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#f85149]" />
            <div className="w-3 h-3 rounded-full bg-[#d29922]" />
            <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
          </div>
          <div className="flex-1 bg-[#21262d] rounded-md px-3 py-1 text-xs text-[#8b949e] truncate">{deployUrl}</div>
          <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#58a6ff] hover:underline shrink-0">Open ↗</a>
        </div>
        <iframe src={deployUrl} className="flex-1 w-full border-0 bg-white" title="Live preview" />
      </div>
    );
  }

  const isBuilding = projectStatus === "BUILDING" || projectStatus === "PLANNING";

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center text-[#4d5566]">
        {isBuilding ? (
          <>
            <div className="text-5xl mb-4 animate-pulse">🚀</div>
            <p className="text-sm font-medium text-[#8b949e]">Building your app...</p>
            <p className="text-xs mt-1">Preview will appear after deployment</p>
          </>
        ) : projectStatus === "REVIEW" ? (
          <>
            <div className="text-5xl mb-4">⚡</div>
            <p className="text-sm font-medium text-[#8b949e]">App built!</p>
            <p className="text-xs mt-1">Approve deployment to see the live preview</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">📱</div>
            <p className="text-sm font-medium text-[#8b949e]">No preview yet</p>
            <p className="text-xs mt-1">Start the build to generate your app</p>
          </>
        )}
      </div>
    </div>
  );
}
