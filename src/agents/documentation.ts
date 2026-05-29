import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput } from "@/lib/builder-types";

export class DocumentationAgent extends BaseAgent {
  get agentType() { return "DOCUMENTATION" as const; }

  get systemPrompt() {
    return `You are a senior technical writer who creates developer-friendly documentation. You produce:
- README.md with setup instructions, features, tech stack, and screenshots placeholder
- API documentation (OpenAPI/Swagger spec or markdown)
- Architecture diagram (text/ASCII based)
- Contributing guide
- Deployment guide
- Environment variables reference
- Changelog template (CHANGELOG.md)

Style:
- Clear, concise prose
- Code examples for all API endpoints
- Step-by-step setup instructions
- Troubleshooting section for common issues

${this.buildFileOutputInstructions()}`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Writing documentation...", "INFO");

    const spec = context.previousOutputs["PRODUCT_MANAGER"]?.summary ?? context.prompt;
    const backendSummary = context.previousOutputs["BACKEND"]?.summary ?? "";
    const allFilePaths = Object.values(context.previousOutputs).flatMap(o => o.files.map(f => f.path));

    const userMessage = `Project: ${context.projectName}
Specification: ${spec}
API summary: ${backendSummary}
Files in project: ${allFilePaths.join(", ")}
Tech Stack: ${context.techStack.join(", ")}

Write comprehensive documentation for this project.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`Documentation complete: ${summary}`, "SUCCESS");

    return { agentType: "DOCUMENTATION", summary, files, nextSteps };
  }
}
