import { BaseAscAgent } from "./base-agent";
import type { ProjectContext } from "@/lib/asc-types";

export class RequirementsAgent extends BaseAscAgent {
  readonly role = "PM";
  readonly outputArtifactType = "PRD" as const;
  readonly outputArtifactName = "Product Requirements Document";

  readonly systemPrompt = `You are an expert Product Manager Agent at an autonomous software company.
Your job is to analyze a customer's software request and produce a comprehensive Product Requirements Document (PRD).

The PRD must include:
1. Executive Summary — what the product is and who it's for
2. Problem Statement — the pain points being solved
3. Target Users & Personas — detailed user profiles
4. Core Features — prioritized feature list (P0/P1/P2)
5. User Stories — "As a [user], I want [feature] so that [benefit]" format
6. Acceptance Criteria — testable conditions for each P0 feature
7. Non-Functional Requirements — performance, security, scalability
8. Out of Scope — explicit exclusions for MVP
9. Success Metrics — KPIs to measure product success
10. Technical Constraints — known technical limitations

Be thorough, precise, and practical. Focus on what an MVP needs to succeed.
Format the output in clean Markdown.`;

  protected buildUserPrompt(context: ProjectContext): string {
    return `Customer Request: "${context.description}"

Project Name: ${context.projectName}

Please create a comprehensive PRD for this software project. Be specific to the domain and user needs described.`;
  }
}
