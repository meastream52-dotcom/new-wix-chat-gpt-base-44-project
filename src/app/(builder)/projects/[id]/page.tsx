"use client";
import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { AgentLog } from "@/components/builder/AgentLog";
import { FileTree } from "@/components/builder/FileTree";
import { PipelineStatus } from "@/components/builder/PipelineStatus";
import { ApprovalModal } from "@/components/builder/ApprovalModal";
import { ChatInterface } from "@/components/builder/ChatInterface";
import { PreviewFrame } from "@/components/builder/PreviewFrame";
import type { AgentLogEntry, ApprovalRecord, ConversationMessage } from "@/lib/builder-types";

type Tab = "logs" | "files" | "pipeline" | "preview";

interface FileRecord { id: string; path: string; language: string | null; agentType: string | null; updatedAt: string; }
interface AgentRunRecord { id: string; type: string; status: string; completedAt: string | null; }

interface ProjectData {
  id: string;
  name: string;
  prompt: string;
  status: string;
  repoUrl: string | null;
  deployUrl: string | null;
  agentRuns: AgentRunRecord[];
  approvals: ApprovalRecord[];
  _count: { files: number; logs: number };
}

function ProjectPageContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const autostart = searchParams.get("autostart") === "true";

  const [project, setProject] = useState<ProjectData | null>(null);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("logs");
  const [pendingApproval, setPendingApproval] = useState<ApprovalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/builder/projects/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data.data);
      const pending = data.data.approvals?.find((a: ApprovalRecord) => a.status === "PENDING");
      setPendingApproval(pending ?? null);
    }
  }, [params.id]);

  const fetchFiles = useCallback(async () => {
    const res = await fetch(`/api/builder/projects/${params.id}/files`);
    if (res.ok) {
      const data = await res.json();
      setFiles(data.data);
    }
  }, [params.id]);

  const openFile = async (path: string) => {
    setSelectedFile(path);
    setActiveTab("files");
    const res = await fetch(`/api/builder/projects/${params.id}/files?path=${encodeURIComponent(path)}`);
    if (res.ok) {
      const data = await res.json();
      setFileContent(data.data?.content ?? "");
    }
  };

  const connectSSE = useCallback(() => {
    if (sseRef.current) sseRef.current.close();
    const es = new EventSource(`/api/builder/projects/${params.id}/logs`);
    sseRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "log") {
        setLogs((prev) => [...prev, data as AgentLogEntry]);
      } else if (data.type === "done") {
        fetchProject();
        fetchFiles();
        setBuilding(false);
        es.close();
      }
    };

    es.onerror = () => { es.close(); setBuilding(false); };
  }, [params.id, fetchProject, fetchFiles]);

  const startBuild = async (mode = "full") => {
    setBuilding(true);
    setLogs([]);
    setActiveTab("logs");
    const res = await fetch(`/api/builder/projects/${params.id}/orchestrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    if (res.ok) {
      connectSSE();
      fetchProject();
    } else {
      setBuilding(false);
    }
  };

  const handleChat = (message: string) => {
    const userMsg: ConversationMessage = { role: "user", content: message, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    // For MVP, trigger a focused rebuild based on chat
    const botMsg: ConversationMessage = {
      role: "assistant",
      content: `Got it! I'll update the project: "${message}". Starting a new build pass...`,
      timestamp: new Date().toISOString(),
      agentType: "ORCHESTRATOR",
    };
    setMessages((prev) => [...prev, botMsg]);
    startBuild("full");
  };

  useEffect(() => {
    Promise.all([fetchProject(), fetchFiles()]).finally(() => setLoading(false));
  }, [fetchProject, fetchFiles]);

  useEffect(() => {
    if (autostart && project && project.status === "PENDING") {
      router.replace(`/projects/${params.id}`, { scroll: false });
      startBuild();
    }
  }, [autostart, project]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll when building
  useEffect(() => {
    if (!building) return;
    const interval = setInterval(() => { fetchProject(); fetchFiles(); }, 3000);
    return () => clearInterval(interval);
  }, [building, fetchProject, fetchFiles]);

  useEffect(() => {
    return () => sseRef.current?.close();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-[#4d5566] text-sm">Loading...</div>;
  }
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[#8b949e]">Project not found</p>
        <Link href="/dashboard" className="text-[#58a6ff] hover:underline text-sm">← Dashboard</Link>
      </div>
    );
  }

  const isBuilding = building || project.status === "BUILDING" || project.status === "PLANNING";
  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "logs", label: "Logs", count: logs.length },
    { id: "files", label: "Files", count: files.length },
    { id: "pipeline", label: "Pipeline", count: project.agentRuns.length },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Approval modal */}
      {pendingApproval && (
        <ApprovalModal
          approval={pendingApproval}
          projectId={project.id}
          onResolved={() => { setPendingApproval(null); fetchProject(); }}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#21262d] bg-[#161b22] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="text-[#8b949e] hover:text-white text-sm transition-colors shrink-0">←</Link>
          <div className="min-w-0">
            <h1 className="font-semibold text-white text-sm truncate">{project.name}</h1>
            <p className="text-xs text-[#4d5566] truncate">{project.prompt.slice(0, 80)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener" className="text-xs text-[#8b949e] hover:text-white bg-[#21262d] px-3 py-1.5 rounded-lg transition-colors">
              GitHub ↗
            </a>
          )}
          {project.deployUrl && (
            <a href={project.deployUrl} target="_blank" rel="noopener" className="text-xs text-[#3fb950] hover:text-white bg-[#3fb950]/10 px-3 py-1.5 rounded-lg transition-colors">
              Live ↗
            </a>
          )}
          {!isBuilding && (
            <button
              onClick={() => startBuild()}
              className="bg-[#58a6ff] hover:bg-[#79b8ff] text-[#0f1117] font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors"
            >
              {project.status === "PENDING" ? "Start Build" : "Rebuild"}
            </button>
          )}
          {isBuilding && (
            <div className="flex items-center gap-2 text-sm text-[#58a6ff]">
              <span className="w-2 h-2 rounded-full bg-[#58a6ff] animate-pulse" />
              Building...
            </div>
          )}
        </div>
      </header>

      {/* Main split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat */}
        <div className="w-80 shrink-0 border-r border-[#21262d] flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#21262d] text-xs font-medium text-[#8b949e] uppercase tracking-wider">
            Chat
          </div>
          <ChatInterface
            messages={messages}
            onSend={handleChat}
            loading={isBuilding}
            projectStatus={project.status}
            className="flex-1 overflow-hidden"
          />
        </div>

        {/* Right: Tabbed panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#21262d] bg-[#161b22] shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-4 py-2.5 text-sm border-b-2 transition-colors flex items-center gap-1.5",
                  activeTab === tab.id
                    ? "border-[#58a6ff] text-white"
                    : "border-transparent text-[#8b949e] hover:text-white"
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-xs bg-[#21262d] text-[#8b949e] px-1.5 py-0.5 rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {/* Logs */}
            {activeTab === "logs" && (
              <div className="h-full overflow-y-auto bg-[#0f1117] py-2">
                <AgentLog logs={logs} />
              </div>
            )}

            {/* Files */}
            {activeTab === "files" && (
              <div className="flex h-full">
                <div className="w-52 shrink-0 border-r border-[#21262d] overflow-y-auto bg-[#161b22]">
                  <FileTree files={files} selectedPath={selectedFile} onSelect={openFile} />
                </div>
                <div className="flex-1 overflow-auto p-4 bg-[#0f1117]">
                  {selectedFile ? (
                    <div>
                      <div className="text-xs text-[#4d5566] mb-3 font-mono">{selectedFile}</div>
                      <pre className="text-xs text-[#e6edf3] font-mono whitespace-pre-wrap leading-relaxed">{fileContent}</pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#4d5566] text-sm">
                      Select a file to view its contents
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pipeline */}
            {activeTab === "pipeline" && (
              <div className="h-full overflow-y-auto p-4">
                <PipelineStatus agentRuns={project.agentRuns} projectStatus={project.status} />
              </div>
            )}

            {/* Preview */}
            {activeTab === "preview" && (
              <PreviewFrame deployUrl={project.deployUrl} projectStatus={project.status} className="h-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-[#4d5566] text-sm">Loading...</div>}>
      <ProjectPageContent />
    </Suspense>
  );
}
