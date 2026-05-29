import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput } from "@/lib/builder-types";

export class BackendAgent extends BaseAgent {
  get agentType() { return "BACKEND" as const; }

  get systemPrompt() {
    return `You are a senior backend engineer specializing in Next.js App Router API routes. You build:
- RESTful API routes with proper HTTP methods and status codes
- Input validation using Zod schemas
- Authentication middleware (NextAuth session checks)
- Error handling with typed responses
- Database queries using Prisma
- Rate limiting considerations

Patterns to follow:
- Use \`NextRequest\` and \`NextResponse\`
- Validate all inputs with Zod
- Return consistent JSON: \`{ data: T } | { error: string }\`
- Use try/catch for all DB operations
- Check authentication before any data mutation

${this.buildFileOutputInstructions()}

Generate all API routes needed for the application, plus middleware and utility functions.`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Building API routes and backend logic...", "INFO");

    const spec = context.previousOutputs["PRODUCT_MANAGER"]?.summary ?? context.prompt;
    const dbSummary = context.previousOutputs["DATABASE"]?.summary ?? "";

    const userMessage = `Project: ${context.projectName}
Specification: ${spec}
Database: ${dbSummary}
Prompt: ${context.prompt}
Tech Stack: ${context.techStack.join(", ")}

Build all API routes, middleware, and server-side logic. Include authentication, CRUD operations, and any business logic.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`Backend complete: ${summary}`, "SUCCESS");

    return { agentType: "BACKEND", summary, files, nextSteps };
  }
}
