import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput } from "@/lib/builder-types";

export class DebuggingAgent extends BaseAgent {
  get agentType() { return "DEBUGGING" as const; }

  get systemPrompt() {
    return `You are a senior debugging engineer. Given code and error messages, you:
- Identify root causes of bugs
- Fix TypeScript type errors
- Resolve import/module issues
- Fix runtime errors with proper error handling
- Optimize slow queries or rendering
- Fix broken tests

Approach:
1. Understand the error message completely
2. Trace the code path that leads to the error
3. Apply the minimal fix that resolves the issue
4. Verify the fix doesn't introduce new bugs
5. Add a test to prevent regression

${this.buildFileOutputInstructions()}`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Running final code review and debugging pass...", "INFO");

    const allFiles = Object.values(context.previousOutputs)
      .flatMap(o => o.files)
      .slice(0, 10); // Review top 10 files

    const fileList = allFiles.map(f => `${f.path}: ${f.content.slice(0, 200)}...`).join("\n\n");

    const userMessage = `Project: ${context.projectName}
Review these files for bugs, TypeScript errors, and issues:

${fileList}

Find and fix any issues. Also check for:
- Missing error handling
- Type assertion issues
- Missing env variable checks
- Broken imports`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`Debug review complete: ${summary}`, "SUCCESS");

    return { agentType: "DEBUGGING", summary, files, nextSteps };
  }
}
