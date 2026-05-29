"use client";
import { useState } from "react";
import { clsx } from "clsx";

interface FileNode {
  id: string;
  path: string;
  language: string | null;
  agentType: string | null;
  updatedAt: Date | string;
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
  file?: FileNode;
}

function buildTree(files: FileNode[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const pathSoFar = parts.slice(0, i + 1).join("/");

      let node = current.find((n) => n.name === part);
      if (!node) {
        node = { name: part, path: pathSoFar, isDir: !isLast, children: [], file: isLast ? file : undefined };
        current.push(node);
      }
      if (!isLast) current = node.children;
    }
  }

  const sort = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .map((n) => ({ ...n, children: sort(n.children) }))
      .sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1));

  return sort(root);
}

const FILE_ICONS: Record<string, string> = {
  ts: "🟦", tsx: "⚛️", js: "🟨", jsx: "⚛️", json: "📋", md: "📝",
  css: "🎨", prisma: "🗄️", env: "🔑", yml: "⚙️", yaml: "⚙️", sh: "💻",
  py: "🐍", sql: "🗄️", dockerfile: "🐳",
};

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return FILE_ICONS[ext] ?? "📄";
}

interface FileTreeProps {
  files: FileNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  className?: string;
}

function TreeNodeView({ node, depth, selectedPath, onSelect }: { node: TreeNode; depth: number; selectedPath: string | null; onSelect: (path: string) => void }) {
  const [open, setOpen] = useState(true);

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 w-full text-left text-xs text-[#8b949e] hover:text-white py-1 px-2 rounded hover:bg-[#21262d]/50 transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <span className="shrink-0">{open ? "▼" : "▶"}</span>
          <span>📁</span>
          <span className="truncate">{node.name}</span>
        </button>
        {open && node.children.map((child) => (
          <TreeNodeView key={child.path} node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={clsx(
        "flex items-center gap-1.5 w-full text-left text-xs py-1 px-2 rounded transition-colors",
        selectedPath === node.path ? "bg-[#21262d] text-white" : "text-[#8b949e] hover:text-white hover:bg-[#21262d]/50"
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="shrink-0">{getFileIcon(node.name)}</span>
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileTree({ files, selectedPath, onSelect, className }: FileTreeProps) {
  const tree = buildTree(files);

  if (files.length === 0) {
    return (
      <div className={clsx("flex items-center justify-center text-[#4d5566] text-xs py-8", className)}>
        No files yet
      </div>
    );
  }

  return (
    <div className={clsx("py-2", className)}>
      {tree.map((node) => (
        <TreeNodeView key={node.path} node={node} depth={0} selectedPath={selectedPath} onSelect={onSelect} />
      ))}
    </div>
  );
}
