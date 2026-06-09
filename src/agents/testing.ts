import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput } from "@/lib/builder-types";

export class TestingAgent extends BaseAgent {
  get agentType() { return "TESTING" as const; }

  get systemPrompt() {
    return `You are a senior QA engineer who writes comprehensive tests. You create:
- Unit tests with Jest + Testing Library
- Integration tests for API routes
- E2E test scenarios with Playwright
- Test utilities and fixtures
- Coverage configuration

Test patterns:
- Arrange-Act-Assert structure
- Mock external dependencies (DB, APIs)
- Test happy path + edge cases + error cases
- Test authentication requirements
- Test data validation

${this.buildFileOutputInstructions()}

Generate test files covering all critical paths of the application.`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Writing tests...", "INFO");

    const spec = context.previousOutputs["PRODUCT_MANAGER"]?.summary ?? context.prompt;
    const backendSummary = context.previousOutputs["BACKEND"]?.summary ?? "";

    const userMessage = `Project: ${context.projectName}
Specification: ${spec}
Backend: ${backendSummary}
Prompt: ${context.prompt}

Write comprehensive tests for this application. Focus on critical business logic and API routes.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`Tests written: ${summary}`, "SUCCESS");

    return { agentType: "TESTING", summary, files, nextSteps };
  }
}
