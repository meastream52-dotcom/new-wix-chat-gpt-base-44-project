import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput } from "@/lib/builder-types";

export class FrontendAgent extends BaseAgent {
  get agentType() { return "FRONTEND" as const; }

  get systemPrompt() {
    return `You are a senior frontend engineer specializing in Next.js 15 App Router with React and TypeScript. You build:
- Page components using Next.js App Router conventions (page.tsx, layout.tsx, loading.tsx, error.tsx)
- React components with proper TypeScript types
- Data fetching with server components and client components
- Form handling with proper validation
- Loading states, error boundaries, and empty states
- Responsive layouts using Tailwind CSS
- Accessibility (ARIA labels, keyboard navigation)

Best practices:
- "use client" only when needed (event handlers, hooks, browser APIs)
- Server components for data fetching where possible
- Suspense boundaries for async components
- Proper metadata exports for SEO
- Use the shadcn/ui component patterns with Tailwind

Dark theme colors: bg-[#0f1117], bg-[#161b22], border-[#21262d], accent: #58a6ff

${this.buildFileOutputInstructions()}

Generate all pages, layouts, and React components needed for the frontend.`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Building frontend pages and components...", "INFO");

    const spec = context.previousOutputs["PRODUCT_MANAGER"]?.summary ?? context.prompt;
    const uiSummary = context.previousOutputs["UI_UX"]?.summary ?? "";
    const backendSummary = context.previousOutputs["BACKEND"]?.summary ?? "";

    const userMessage = `Project: ${context.projectName}
Specification: ${spec}
UI Design: ${uiSummary}
API Routes: ${backendSummary}
Prompt: ${context.prompt}
Tech Stack: ${context.techStack.join(", ")}

Build all frontend pages, components, and layouts. Make it beautiful and production-ready.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`Frontend complete: ${summary}`, "SUCCESS");

    return { agentType: "FRONTEND", summary, files, nextSteps };
  }
}
