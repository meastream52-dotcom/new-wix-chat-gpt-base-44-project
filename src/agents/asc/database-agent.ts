import { BaseAscAgent } from "./base-agent";
import type { ProjectContext } from "@/lib/asc-types";

export class DatabaseAgent extends BaseAscAgent {
  readonly role = "DATABASE_ENGINEER";
  readonly outputArtifactType = "DATABASE_SCHEMA" as const;
  readonly outputArtifactName = "Database Schema & Migrations";

  readonly systemPrompt = `You are an expert Database Engineer Agent at an autonomous software company.
You design optimal PostgreSQL database schemas using Prisma ORM.

Your output must include:
1. Complete Prisma schema (schema.prisma) — all models, relations, indexes, enums
2. Data Dictionary — description of each table and its purpose
3. Relationship Diagram (ERD in Mermaid or ASCII)
4. Key Indexes — performance-critical indexes with justification
5. Seed Data Script — realistic sample data for development/testing (TypeScript)
6. Migration Strategy — how to handle schema changes in production
7. Query Patterns — most common queries and how to optimize them

Best practices to follow:
- Use UUIDs as primary keys (@id @default(uuid()))
- Always include createdAt/updatedAt timestamps
- Use proper cascade delete rules
- Normalize data appropriately (3NF for transactional data)
- Add database-level constraints where appropriate
- Use enums for categorical fields

Format the output in clean Markdown with code blocks.`;

  protected buildUserPrompt(context: ProjectContext): string {
    const arch = context.previousArtifacts?.find((a) => a.type === "ARCHITECTURE")?.content ?? "";
    const prd = context.previousArtifacts?.find((a) => a.type === "PRD")?.content ?? "";
    return `Project: ${context.projectName}
Description: ${context.description}

${arch ? `Architecture Overview:\n${arch.slice(0, 2000)}\n` : ""}
${prd ? `PRD Features:\n${prd.slice(0, 1500)}\n` : ""}

Design the complete PostgreSQL/Prisma database schema for this project. Include all tables, relationships, and a seed script.`;
  }
}
