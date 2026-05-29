import { prisma } from "@/lib/db";
import { callClaude } from "@/lib/anthropic";
import type { AgentContext, AgentOutput, AgentType } from "@/lib/builder-types";
import { ProductManagerAgent } from "./productManager";
import { UIUXAgent } from "./uiux";
import { DatabaseAgent } from "./database";
import { BackendAgent } from "./backend";
import { FrontendAgent } from "./frontend";
import { TestingAgent } from "./testing";
import { SecurityAgent } from "./security";
import { DevOpsAgent } from "./devops";
import { DocumentationAgent } from "./documentation";
import { BillingAgent } from "./billing";
import { DebuggingAgent } from "./debugging";

export type PipelineMode = "full" | "frontend-only" | "backend-only" | "spec-only";

interface OrchestratorOptions {
  projectId: string;
  mode?: PipelineMode;
  onProgress?: (message: string, agentType?: AgentType) => void;
}

async function writeLog(projectId: string, message: string, level: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO", agentType?: AgentType) {
  await prisma.agentLog.create({
    data: { projectId, agentType: agentType ?? null, level, message },
  });
}

async function updateProjectStatus(projectId: string, status: string) {
  await prisma.project.update({ where: { id: projectId }, data: { status: status as "PENDING" } });
}

export async function runOrchestrator(options: OrchestratorOptions): Promise<void> {
  const { projectId, mode = "full", onProgress } = options;

  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });

  const notify = async (message: string, agentType?: AgentType, level: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO") => {
    await writeLog(projectId, message, level, agentType);
    onProgress?.(message, agentType);
  };

  await notify("🚀 Pipeline started — analyzing your project...", "ORCHESTRATOR");
  await updateProjectStatus(projectId, "PLANNING");

  // Step 1: Determine tech stack and project name from prompt
  const planningPrompt = `Given this project request: "${project.prompt}"

Output a JSON object:
{
  "projectName": "short descriptive name",
  "techStack": ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
  "pipelineAgents": ["PRODUCT_MANAGER", "UI_UX", "DATABASE", "BACKEND", "FRONTEND"],
  "complexity": "low|medium|high"
}

Choose the most appropriate tech stack. Always include at least: Next.js, TypeScript, Tailwind CSS.`;

  let planResult: { projectName: string; techStack: string[]; pipelineAgents: string[]; complexity: string };
  try {
    const raw = await callClaude("You are a software architect. Respond with JSON only.", planningPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    planResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      projectName: project.name,
      techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
      pipelineAgents: ["PRODUCT_MANAGER", "DATABASE", "BACKEND", "FRONTEND"],
      complexity: "medium",
    };
  } catch {
    planResult = {
      projectName: project.name,
      techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
      pipelineAgents: ["PRODUCT_MANAGER", "DATABASE", "BACKEND", "FRONTEND"],
      complexity: "medium",
    };
  }

  // Update project with tech stack
  await prisma.project.update({
    where: { id: projectId },
    data: { name: planResult.projectName, techStack: planResult.techStack as unknown as object },
  });

  await notify(`📋 Plan ready: ${planResult.projectName} (${planResult.complexity} complexity)`, "ORCHESTRATOR", "SUCCESS");
  await updateProjectStatus(projectId, "BUILDING");

  // Build agent pipeline
  const context: AgentContext = {
    projectId,
    prompt: project.prompt,
    projectName: planResult.projectName,
    techStack: planResult.techStack,
    previousOutputs: {},
  };

  const agentPipeline: { type: string; agent: { run: (ctx: AgentContext) => Promise<AgentOutput> } }[] = [];

  if (mode === "full") {
    agentPipeline.push(
      { type: "PRODUCT_MANAGER", agent: new ProductManagerAgent(projectId) },
      { type: "UI_UX", agent: new UIUXAgent(projectId) },
      { type: "DATABASE", agent: new DatabaseAgent(projectId) },
      { type: "BACKEND", agent: new BackendAgent(projectId) },
      { type: "FRONTEND", agent: new FrontendAgent(projectId) },
      { type: "SECURITY", agent: new SecurityAgent(projectId) },
      { type: "TESTING", agent: new TestingAgent(projectId) },
      { type: "DEVOPS", agent: new DevOpsAgent(projectId) },
      { type: "BILLING_AGENT", agent: new BillingAgent(projectId) },
      { type: "DOCUMENTATION", agent: new DocumentationAgent(projectId) },
      { type: "DEBUGGING", agent: new DebuggingAgent(projectId) },
    );
  } else if (mode === "spec-only") {
    agentPipeline.push({ type: "PRODUCT_MANAGER", agent: new ProductManagerAgent(projectId) });
  } else if (mode === "frontend-only") {
    agentPipeline.push(
      { type: "PRODUCT_MANAGER", agent: new ProductManagerAgent(projectId) },
      { type: "UI_UX", agent: new UIUXAgent(projectId) },
      { type: "FRONTEND", agent: new FrontendAgent(projectId) },
    );
  } else if (mode === "backend-only") {
    agentPipeline.push(
      { type: "PRODUCT_MANAGER", agent: new ProductManagerAgent(projectId) },
      { type: "DATABASE", agent: new DatabaseAgent(projectId) },
      { type: "BACKEND", agent: new BackendAgent(projectId) },
    );
  }

  // Run each agent in sequence
  for (const { type, agent } of agentPipeline) {
    await notify(`⚡ Starting ${type.replace("_", " ").toLowerCase()} agent...`, type as AgentType);

    const agentRunRecord = await prisma.agentRun.create({
      data: { projectId, type: type as AgentType, status: "RUNNING", startedAt: new Date(), input: { prompt: project.prompt } as object },
    });

    try {
      const output = await agent.run(context);
      context.previousOutputs[type] = output;

      await prisma.agentRun.update({
        where: { id: agentRunRecord.id },
        data: { status: "COMPLETED", completedAt: new Date(), output: { summary: output.summary, fileCount: output.files.length } as object },
      });

      await notify(`✅ ${type.replace("_", " ")} complete — ${output.files.length} files generated`, type as AgentType, "SUCCESS");

      // Handle approval requests
      if (output.requiresApproval) {
        await prisma.approval.create({
          data: {
            projectId,
            type: output.requiresApproval.type,
            description: output.requiresApproval.description,
            metadata: (output.requiresApproval.metadata ?? {}) as object,
          },
        });
        await prisma.agentRun.update({ where: { id: agentRunRecord.id }, data: { status: "WAITING_APPROVAL" } });
        await notify(`⏸️ Waiting for approval: ${output.requiresApproval.description}`, type as AgentType, "WARNING");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.agentRun.update({
        where: { id: agentRunRecord.id },
        data: { status: "FAILED", completedAt: new Date() },
      });
      await notify(`❌ ${type} agent failed: ${message}`, type as AgentType, "ERROR");
    }
  }

  // Count total files
  const fileCount = await prisma.generatedFile.count({ where: { projectId } });
  await updateProjectStatus(projectId, "REVIEW");
  await notify(`🎉 Pipeline complete! ${fileCount} files generated. Review your project.`, "ORCHESTRATOR", "SUCCESS");
}
