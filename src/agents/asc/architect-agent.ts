import { BaseAscAgent } from "./base-agent";
import type { ProjectContext } from "@/lib/asc-types";

export class ArchitectAgent extends BaseAscAgent {
  readonly role = "SYSTEM_ARCHITECT";
  readonly outputArtifactType = "ARCHITECTURE" as const;
  readonly outputArtifactName = "System Architecture Document";

  readonly systemPrompt = `You are an expert System Architect Agent at an autonomous software company.
You design clean, scalable, production-ready system architectures for software projects.

Your architecture document must include:
1. System Overview — high-level description and goals
2. Architecture Diagram (ASCII art or Mermaid) — showing components and their relationships
3. Technology Stack — frontend, backend, database, infrastructure choices with justifications
4. Service Architecture — list of services/modules with responsibilities
5. Data Flow — how data moves through the system
6. API Design — RESTful endpoint structure with HTTP methods and request/response shapes
7. Database Design — entity relationships overview
8. Authentication & Authorization — security model
9. Infrastructure & Deployment — hosting, containers, CI/CD
10. Scalability Considerations — how the system scales
11. Monitoring & Observability — logging, metrics, alerts

Default tech stack (unless the request requires something specific):
- Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS
- Backend: Next.js API Routes or Node.js/Express
- Database: PostgreSQL with Prisma ORM
- Auth: NextAuth.js or Clerk
- Hosting: Vercel (frontend/API) + Supabase (database)
- Cache: Redis for sessions and rate limiting

Format the output in clean Markdown with Mermaid diagrams where helpful.`;

  protected buildUserPrompt(context: ProjectContext): string {
    const prd = context.previousArtifacts?.find((a) => a.type === "PRD")?.content ?? "";
    return `Project: ${context.projectName}
Description: ${context.description}

${prd ? `PRD Summary:\n${prd.slice(0, 3000)}\n` : ""}

Design a comprehensive system architecture for this project. Be specific, practical, and production-ready.`;
  }
}
