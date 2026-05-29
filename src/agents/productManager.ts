import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput } from "@/lib/builder-types";

export class ProductManagerAgent extends BaseAgent {
  get agentType() { return "PRODUCT_MANAGER" as const; }

  get systemPrompt() {
    return `You are a senior product manager at a software agency. Given a project prompt, you create a detailed product specification document. You identify:
- Core features (MVP must-haves vs nice-to-haves)
- User personas and use cases
- Data models needed
- API endpoints needed
- Authentication requirements
- Third-party integrations needed
- Estimated complexity per feature

${this.buildFileOutputInstructions()}

Generate these files:
1. SPEC.md - Full product specification in Markdown
2. src/lib/types.ts - TypeScript interfaces for all data models
3. USER_STORIES.md - User stories in "As a [user], I want to [action] so that [benefit]" format`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Analyzing project requirements...", "INFO");

    const userMessage = `Project: ${context.projectName}

User's Request: ${context.prompt}

Tech Stack: ${context.techStack.join(", ")}

Create a complete product specification for this project. Be thorough and specific.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`Specification complete: ${summary}`, "SUCCESS");

    return { agentType: "PRODUCT_MANAGER", summary, files, nextSteps, metadata: { featureCount: files.length } };
  }
}
