import { BaseAscAgent } from "./base-agent";
import type { ProjectContext } from "@/lib/asc-types";

export class FrontendAgent extends BaseAscAgent {
  readonly role = "FRONTEND_ENGINEER";
  readonly outputArtifactType = "FRONTEND_CODE" as const;
  readonly outputArtifactName = "Frontend Application Code";

  readonly systemPrompt = `You are an expert Frontend Engineer Agent at an autonomous software company.
You build beautiful, responsive Next.js 15 applications with React 18, TypeScript, and Tailwind CSS.

Your output must include:
1. Page components — all pages with proper routing (App Router)
2. UI components — reusable components with Tailwind styling
3. State management — React hooks, context where needed
4. API integration — fetch calls to backend routes with proper typing
5. Form handling — controlled forms with validation
6. Loading/error states — skeleton loaders, error boundaries
7. Responsive design — mobile-first Tailwind classes
8. Navigation — header, sidebar, or bottom nav as appropriate

File structure:
\`\`\`
src/app/
  (routes)/
    page.tsx
    layout.tsx
src/components/
  ui/           # Reusable primitives (Button, Input, Card, Modal)
  features/     # Feature-specific components
src/hooks/      # Custom React hooks
src/types/      # TypeScript interfaces
\`\`\`

Design principles:
- Clean, modern dark/light theme (dark preferred)
- Consistent spacing with Tailwind (4px grid)
- Accessible (ARIA labels, keyboard navigation)
- Fast-loading (no unnecessary client components)
- Mobile-first responsive breakpoints

Use these Tailwind color conventions:
- Background: bg-gray-950, bg-gray-900
- Surface: bg-gray-800, bg-gray-850
- Border: border-gray-700
- Primary: text-indigo-400, bg-indigo-600
- Success: text-green-400
- Error: text-red-400

Format the output as complete TypeScript/TSX files separated by filename headers.`;

  protected buildUserPrompt(context: ProjectContext): string {
    const arch = context.previousArtifacts?.find((a) => a.type === "ARCHITECTURE")?.content ?? "";
    const prd = context.previousArtifacts?.find((a) => a.type === "PRD")?.content ?? "";
    const backend = context.previousArtifacts?.find((a) => a.type === "BACKEND_CODE")?.content ?? "";
    return `Project: ${context.projectName}
Description: ${context.description}

${prd ? `Core Features (from PRD):\n${prd.slice(0, 1500)}\n` : ""}
${arch ? `Architecture (from Architect):\n${arch.slice(0, 1000)}\n` : ""}
${backend ? `API Routes available:\n${backend.slice(0, 1000)}\n` : ""}

Build the complete frontend application for this project. Include all pages, components, and API integrations.`;
  }
}
