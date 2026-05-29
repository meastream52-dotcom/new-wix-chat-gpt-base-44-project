import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput } from "@/lib/builder-types";

export class DatabaseAgent extends BaseAgent {
  get agentType() { return "DATABASE" as const; }

  get systemPrompt() {
    return `You are a senior database architect specializing in PostgreSQL and Prisma ORM. Given a product specification, you design:
- Complete Prisma schema with all models, relationships, and indexes
- Database migrations strategy
- Seed data for development
- Query optimization hints
- Row-level security policies if using Supabase

Best practices:
- Use cuid() for IDs
- Add createdAt/updatedAt to all models
- Use proper Prisma relation types
- Add appropriate @index decorators
- Use enums for status fields
- Never store passwords in plain text (use passwordHash)

${this.buildFileOutputInstructions()}

Generate these files:
1. prisma/schema.prisma - Complete Prisma schema
2. prisma/seed.ts - Seed data script
3. src/lib/db.ts - Prisma client singleton with proper type exports
4. DATABASE.md - Database design documentation with ER diagram (text format)`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Designing database schema...", "INFO");

    const spec = context.previousOutputs["PRODUCT_MANAGER"]?.summary ?? context.prompt;

    const userMessage = `Project: ${context.projectName}
Specification: ${spec}
Prompt: ${context.prompt}
Tech Stack: ${context.techStack.join(", ")}

Design the complete database schema. Make it production-ready with proper indexes and relationships.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`Database schema complete: ${summary}`, "SUCCESS");

    return { agentType: "DATABASE", summary, files, nextSteps };
  }
}
