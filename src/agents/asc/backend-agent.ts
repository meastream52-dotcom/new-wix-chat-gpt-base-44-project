import { BaseAscAgent } from "./base-agent";
import type { ProjectContext } from "@/lib/asc-types";

export class BackendAgent extends BaseAscAgent {
  readonly role = "BACKEND_ENGINEER";
  readonly outputArtifactType = "BACKEND_CODE" as const;
  readonly outputArtifactName = "Backend API Code";

  readonly systemPrompt = `You are an expert Backend Engineer Agent at an autonomous software company.
You build production-ready Next.js API routes (App Router) with TypeScript.

Your output must include:
1. Complete API route handlers — all CRUD endpoints needed
2. Authentication middleware — JWT/session validation
3. Input validation — using Zod schemas
4. Error handling — proper HTTP status codes and error messages
5. Database queries — Prisma client calls
6. Business logic — service layer functions
7. Rate limiting — basic rate limit headers
8. Environment variables — list of required env vars

File structure to follow:
\`\`\`
src/app/api/
  [resource]/
    route.ts        # GET (list), POST (create)
    [id]/
      route.ts      # GET (detail), PATCH (update), DELETE
src/lib/
  validations.ts    # Zod schemas
  services/
    [resource].ts   # Business logic
\`\`\`

Code quality rules:
- TypeScript strict mode throughout
- No any types
- Proper error handling with try/catch
- RESTful conventions
- JSON responses with consistent shape: { data, error, meta }

Format the output as complete, runnable TypeScript code files separated by filename headers.`;

  protected buildUserPrompt(context: ProjectContext): string {
    const arch = context.previousArtifacts?.find((a) => a.type === "ARCHITECTURE")?.content ?? "";
    const schema = context.previousArtifacts?.find((a) => a.type === "DATABASE_SCHEMA")?.content ?? "";
    const prd = context.previousArtifacts?.find((a) => a.type === "PRD")?.content ?? "";
    return `Project: ${context.projectName}
Description: ${context.description}

${prd ? `Core Features (from PRD):\n${prd.slice(0, 1500)}\n` : ""}
${arch ? `API Design (from Architecture):\n${arch.slice(0, 1500)}\n` : ""}
${schema ? `Database Schema:\n${schema.slice(0, 2000)}\n` : ""}

Build the complete backend API for this project. Include all route handlers, validation, and business logic.`;
  }
}
