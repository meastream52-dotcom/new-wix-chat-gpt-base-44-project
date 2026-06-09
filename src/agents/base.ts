import { prisma } from "@/lib/db";
import { callClaude, extractJsonFromResponse } from "@/lib/anthropic";
import type { AgentContext, AgentOutput, GeneratedFileInput } from "@/lib/builder-types";

export abstract class BaseAgent {
  protected projectId: string;
  protected agentRunId: string | null = null;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  abstract get agentType(): string;
  abstract get systemPrompt(): string;
  abstract run(context: AgentContext): Promise<AgentOutput>;

  protected async log(message: string, level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "SUCCESS" = "INFO", metadata?: unknown) {
    await prisma.agentLog.create({
      data: {
        projectId: this.projectId,
        agentType: this.agentType as "ORCHESTRATOR",
        level,
        message,
        metadata: metadata ? (metadata as object) : undefined,
      },
    });
  }

  protected async callAgent(userMessage: string): Promise<string> {
    return callClaude(this.systemPrompt, userMessage);
  }

  protected async writeFiles(files: GeneratedFileInput[]): Promise<void> {
    for (const file of files) {
      await prisma.generatedFile.upsert({
        where: { projectId_path: { projectId: this.projectId, path: file.path } },
        update: { content: file.content, language: file.language, version: { increment: 1 }, agentType: this.agentType as "ORCHESTRATOR", updatedAt: new Date() },
        create: { projectId: this.projectId, path: file.path, content: file.content, language: file.language, agentType: this.agentType as "ORCHESTRATOR" },
      });
    }
  }

  protected async updateRunStatus(status: string) {
    if (!this.agentRunId) return;
    await prisma.agentRun.update({
      where: { id: this.agentRunId },
      data: { status: status as "PENDING", ...(status === "RUNNING" ? { startedAt: new Date() } : {}), ...(status === "COMPLETED" || status === "FAILED" ? { completedAt: new Date() } : {}) },
    });
  }

  protected parseAgentOutput(raw: string): { files: GeneratedFileInput[]; summary: string; nextSteps?: string[] } {
    try {
      const parsed = extractJsonFromResponse(raw) as { files?: GeneratedFileInput[]; summary?: string; nextSteps?: string[] };
      return {
        files: parsed.files ?? [],
        summary: parsed.summary ?? "Completed.",
        nextSteps: parsed.nextSteps,
      };
    } catch {
      return { files: [], summary: raw.slice(0, 500) };
    }
  }

  protected buildFileOutputInstructions(): string {
    return `
IMPORTANT: Respond with a JSON object in this EXACT format (no markdown outside the JSON):
{
  "summary": "Brief description of what you built",
  "files": [
    {
      "path": "relative/path/to/file.ts",
      "content": "full file content here",
      "language": "typescript"
    }
  ],
  "nextSteps": ["optional array of suggested next steps"]
}

Generate COMPLETE, production-ready file contents. Do not use placeholder comments like "// add implementation here".`;
  }
}
