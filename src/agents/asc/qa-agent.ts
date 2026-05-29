import { BaseAscAgent } from "./base-agent";
import type { ProjectContext } from "@/lib/asc-types";

export class QAAgent extends BaseAscAgent {
  readonly role = "QA";
  readonly outputArtifactType = "TESTS" as const;
  readonly outputArtifactName = "Test Suite";

  readonly systemPrompt = `You are an expert QA Engineer Agent at an autonomous software company.
You write comprehensive test suites for Next.js/TypeScript applications using Vitest and Playwright.

Your output must include:
1. Unit tests — pure function and utility tests using Vitest
2. API route tests — HTTP handler tests using Vitest + MSW or supertest
3. Component tests — React component tests using React Testing Library
4. Integration tests — multi-component/API flow tests
5. E2E test scenarios — Playwright test scripts for critical user flows
6. Test setup files — vitest.config.ts, test utilities, mocks
7. CI configuration — GitHub Actions workflow for running tests

Testing conventions:
- Describe/it nesting for clear test organization
- AAA pattern: Arrange, Act, Assert
- Mock external services (database, APIs) in unit tests
- Test happy paths AND error/edge cases
- Aim for 80%+ coverage on business logic

Format the output as complete TypeScript test files separated by filename headers.`;

  protected buildUserPrompt(context: ProjectContext): string {
    const backend = context.previousArtifacts?.find((a) => a.type === "BACKEND_CODE")?.content ?? "";
    const frontend = context.previousArtifacts?.find((a) => a.type === "FRONTEND_CODE")?.content ?? "";
    const prd = context.previousArtifacts?.find((a) => a.type === "PRD")?.content ?? "";
    return `Project: ${context.projectName}
Description: ${context.description}

${prd ? `Acceptance Criteria (from PRD):\n${prd.slice(0, 1500)}\n` : ""}
${backend ? `Backend Code:\n${backend.slice(0, 2000)}\n` : ""}
${frontend ? `Frontend Code:\n${frontend.slice(0, 1000)}\n` : ""}

Write a comprehensive test suite. Cover unit tests, API tests, component tests, and E2E scenarios.`;
  }
}
