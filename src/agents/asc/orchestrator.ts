import { db } from "@/lib/db";
import type { ProjectContext, AgentResult, SseEvent } from "@/lib/asc-types";
import { RequirementsAgent } from "./requirements-agent";
import { ArchitectAgent } from "./architect-agent";
import { DatabaseAgent } from "./database-agent";
import { BackendAgent } from "./backend-agent";
import { FrontendAgent } from "./frontend-agent";
import { QAAgent } from "./qa-agent";
import { BaseAscAgent } from "./base-agent";

// ─── Pipeline Stage ───────────────────────────────────────────────────────────

interface PipelineStage {
  agent: BaseAscAgent;
  dependsOn: string[];  // artifact types that must exist before this agent runs
  critical?: boolean;   // if true, pipeline halts on failure
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export class AscOrchestrator {
  private emitter: ((event: SseEvent) => void) | null = null;

  setEmitter(emitter: (event: SseEvent) => void) {
    this.emitter = emitter;
  }

  private emit(type: SseEvent["type"], data: string, agentRole?: string) {
    this.emitter?.({
      type,
      agentRole,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  private buildPipeline(): PipelineStage[] {
    return [
      { agent: new RequirementsAgent(), dependsOn: [], critical: true },
      { agent: new ArchitectAgent(), dependsOn: ["PRD"], critical: true },
      { agent: new DatabaseAgent(), dependsOn: ["PRD", "ARCHITECTURE"] },
      { agent: new BackendAgent(), dependsOn: ["PRD", "ARCHITECTURE", "DATABASE_SCHEMA"] },
      { agent: new FrontendAgent(), dependsOn: ["PRD", "ARCHITECTURE", "BACKEND_CODE"] },
      { agent: new QAAgent(), dependsOn: ["BACKEND_CODE", "FRONTEND_CODE"] },
    ];
  }

  async run(projectId: string): Promise<void> {
    const project = await db.ascProject.findUniqueOrThrow({
      where: { id: projectId },
      include: { artifacts: true, messages: true },
    });

    await db.ascProject.update({
      where: { id: projectId },
      data: { status: "RUNNING" },
    });

    this.emit("pipeline_start", `Starting ASC pipeline for "${project.name}"`, "ORCHESTRATOR");

    const pipeline = this.buildPipeline();
    const completedArtifacts: string[] = [];

    try {
      for (const stage of pipeline) {
        // Check dependencies
        const missingDeps = stage.dependsOn.filter((dep) => !completedArtifacts.includes(dep));
        if (missingDeps.length > 0) {
          this.emit("message", `Skipping ${stage.agent.role} — missing: ${missingDeps.join(", ")}`, stage.agent.role);
          continue;
        }

        // Attach emitter to agent
        stage.agent.setEmitter((event) => this.emitter?.(event));

        // Build context with all artifacts produced so far
        const currentArtifacts = await db.ascArtifact.findMany({
          where: { projectId },
        });
        const currentMessages = await db.ascMessage.findMany({
          where: { projectId },
          orderBy: { timestamp: "asc" },
          take: 20,
        });

        const context: ProjectContext = {
          projectId,
          projectName: project.name,
          description: project.description,
          previousArtifacts: currentArtifacts.map((a: typeof currentArtifacts[0]) => ({
            ...a,
            createdAt: a.createdAt.toISOString(),
          })),
          previousMessages: currentMessages.map((m: typeof currentMessages[0]) => ({
            ...m,
            timestamp: m.timestamp.toISOString(),
          })),
        };

        const result: AgentResult = await stage.agent.execute(context);

        if (result.success) {
          completedArtifacts.push(result.artifactType);
        } else if (stage.critical) {
          throw new Error(`Critical agent ${stage.agent.role} failed: ${result.error}`);
        } else {
          this.emit("message", `Warning: ${stage.agent.role} failed — continuing pipeline`, "ORCHESTRATOR");
        }
      }

      await db.ascProject.update({
        where: { id: projectId },
        data: { status: "COMPLETED" },
      });

      const totalCost = await db.ascCostEntry.aggregate({
        where: { projectId },
        _sum: { cost: true, tokens: true },
      });

      this.emit(
        "pipeline_complete",
        `Pipeline complete — ${completedArtifacts.length} artifacts generated. Total cost: $${(totalCost._sum.cost ?? 0).toFixed(4)} (${totalCost._sum.tokens ?? 0} tokens)`,
        "ORCHESTRATOR"
      );
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);

      await db.ascProject.update({
        where: { id: projectId },
        data: { status: "FAILED" },
      });

      this.emit("pipeline_error", `Pipeline failed: ${error}`, "ORCHESTRATOR");
      throw err;
    }
  }
}
