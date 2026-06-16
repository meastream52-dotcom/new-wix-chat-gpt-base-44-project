import { getAnthropicClient, DEFAULT_MODEL, estimateCost } from "@/lib/anthropic";
import { db } from "@/lib/db";
import type { ProjectContext, AgentResult, AscArtifactType, SseEvent } from "@/lib/asc-types";

export abstract class BaseAscAgent {
  abstract readonly role: string;
  abstract readonly systemPrompt: string;
  abstract readonly outputArtifactType: AscArtifactType;
  abstract readonly outputArtifactName: string;

  protected emit: ((event: SseEvent) => void) | null = null;

  setEmitter(emitter: (event: SseEvent) => void) {
    this.emit = emitter;
  }

  protected send(type: SseEvent["type"], data: string) {
    this.emit?.({
      type,
      agentRole: this.role,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async execute(context: ProjectContext): Promise<AgentResult> {
    const taskRecord = await db.ascTask.create({
      data: {
        projectId: context.projectId,
        agentRole: this.role,
        type: this.outputArtifactType,
        status: "RUNNING",
        input: context as object,
        startedAt: new Date(),
      },
    });

    this.send("agent_start", `${this.role} agent starting…`);

    try {
      const userPrompt = this.buildUserPrompt(context);
      const client = getAnthropicClient();

      let fullContent = "";
      let inputTokens = 0;
      let outputTokens = 0;

      const stream = await client.messages.stream({
        model: DEFAULT_MODEL,
        max_tokens: 8192,
        system: this.systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          fullContent += event.delta.text;
          this.send("agent_progress", event.delta.text);
        }
        if (event.type === "message_delta" && event.usage) {
          outputTokens = event.usage.output_tokens;
        }
        if (event.type === "message_start" && event.message.usage) {
          inputTokens = event.message.usage.input_tokens;
        }
      }

      const totalTokens = inputTokens + outputTokens;
      const cost = estimateCost(inputTokens, outputTokens);

      await db.ascArtifact.create({
        data: {
          projectId: context.projectId,
          type: this.outputArtifactType,
          name: this.outputArtifactName,
          content: fullContent,
          version: 1,
        },
      });

      await db.ascCostEntry.create({
        data: {
          projectId: context.projectId,
          agentRole: this.role,
          tokens: totalTokens,
          cost,
        },
      });

      await db.ascMessage.create({
        data: {
          projectId: context.projectId,
          fromAgentRole: this.role,
          content: `Completed: ${this.outputArtifactName}`,
          type: "SUCCESS",
        },
      });

      await db.ascTask.update({
        where: { id: taskRecord.id },
        data: {
          status: "COMPLETED",
          output: { content: fullContent, tokens: totalTokens, cost },
          completedAt: new Date(),
        },
      });

      this.send("agent_complete", `${this.role} completed — ${totalTokens} tokens ($${cost.toFixed(4)})`);

      return {
        success: true,
        artifactType: this.outputArtifactType,
        artifactName: this.outputArtifactName,
        content: fullContent,
        tokensUsed: totalTokens,
        cost,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);

      await db.ascTask.update({
        where: { id: taskRecord.id },
        data: { status: "FAILED", completedAt: new Date() },
      });

      await db.ascMessage.create({
        data: {
          projectId: context.projectId,
          fromAgentRole: this.role,
          content: `Failed: ${error}`,
          type: "ERROR",
        },
      });

      this.send("agent_error", `${this.role} failed: ${error}`);

      return {
        success: false,
        artifactType: this.outputArtifactType,
        artifactName: this.outputArtifactName,
        content: "",
        tokensUsed: 0,
        cost: 0,
        error,
      };
    }
  }

  protected abstract buildUserPrompt(context: ProjectContext): string;
}
