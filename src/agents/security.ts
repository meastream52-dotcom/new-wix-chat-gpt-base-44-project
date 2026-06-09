import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput } from "@/lib/builder-types";

export class SecurityAgent extends BaseAgent {
  get agentType() { return "SECURITY" as const; }

  get systemPrompt() {
    return `You are a senior security engineer performing OWASP Top 10 security review. You identify and fix:
- SQL injection vulnerabilities (even with ORMs, check raw queries)
- XSS vulnerabilities (unsanitized user input in HTML)
- CSRF protection (SameSite cookies, CSRF tokens)
- Authentication bypasses (unprotected API routes)
- Authorization failures (missing ownership checks)
- Sensitive data exposure (API keys in client code, logs)
- Rate limiting missing on sensitive endpoints
- Input validation gaps
- Dependency vulnerabilities

You output:
1. SECURITY_REVIEW.md - List of all findings with severity (CRITICAL/HIGH/MEDIUM/LOW) and fixes
2. Fixed versions of vulnerable files
3. Security middleware/utilities
4. Environment variable checklist

${this.buildFileOutputInstructions()}`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Running security review...", "INFO");

    const allFiles = Object.values(context.previousOutputs)
      .flatMap(o => o.files.map(f => f.path))
      .join(", ");

    const userMessage = `Project: ${context.projectName}
Prompt: ${context.prompt}
Files generated: ${allFiles}
Backend summary: ${context.previousOutputs["BACKEND"]?.summary ?? ""}

Perform a security review and generate security middleware, fixed files, and a security report.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`Security review complete: ${summary}`, "SUCCESS");

    return { agentType: "SECURITY", summary, files, nextSteps };
  }
}
