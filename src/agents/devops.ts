import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput, ApprovalRequest } from "@/lib/builder-types";

export class DevOpsAgent extends BaseAgent {
  get agentType() { return "DEVOPS" as const; }

  get systemPrompt() {
    return `You are a senior DevOps engineer specializing in modern cloud deployment. You create:
- Dockerfile with multi-stage builds
- docker-compose.yml for local development
- GitHub Actions CI/CD workflow (.github/workflows/ci.yml, deploy.yml)
- Vercel configuration (vercel.json)
- Environment variable documentation
- Health check endpoints
- Deployment runbook

Best practices:
- Use specific image versions, not :latest
- Layer caching optimization in Dockerfile
- Secrets management (never hardcode secrets)
- Zero-downtime deployments
- Rollback procedures

${this.buildFileOutputInstructions()}

NOTE: You will flag when actual deployment needs user approval.`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Setting up deployment configuration...", "INFO");

    const userMessage = `Project: ${context.projectName}
Prompt: ${context.prompt}
Tech Stack: ${context.techStack.join(", ")}

Generate all DevOps configuration: Dockerfile, docker-compose, GitHub Actions, Vercel config, and deployment documentation.
Do NOT trigger actual deployment - just generate the configuration files.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`DevOps config ready: ${summary}`, "SUCCESS");
    await this.log("Deployment requires user approval before going live", "WARNING");

    const requiresApproval: ApprovalRequest = {
      type: "DEPLOY",
      description: `Deploy ${context.projectName} to production on Vercel. This will make the app publicly accessible.`,
      metadata: { environment: "production", techStack: context.techStack },
    };

    return { agentType: "DEVOPS", summary, files, nextSteps, requiresApproval };
  }
}
