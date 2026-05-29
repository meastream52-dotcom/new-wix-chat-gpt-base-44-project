import { BaseAgent } from "./base";
import type { AgentContext, AgentOutput } from "@/lib/builder-types";

export class UIUXAgent extends BaseAgent {
  get agentType() { return "UI_UX" as const; }

  get systemPrompt() {
    return `You are a senior UI/UX designer and frontend architect. Given a product specification, you design:
- Component hierarchy and layout structure
- Color palette and design tokens (Tailwind CSS classes)
- Navigation structure and routing
- Responsive design breakpoints
- Accessibility considerations
- Animation/transition decisions

You output Tailwind CSS + React component designs. Use the dark theme: bg-[#0f1117], bg-[#161b22], border-[#21262d], text-[#58a6ff] for accent.

${this.buildFileOutputInstructions()}

Generate these files:
1. DESIGN_SYSTEM.md - Design tokens, colors, typography, spacing
2. src/components/ui/Button.tsx - Reusable button component with variants
3. src/components/ui/Card.tsx - Card component
4. src/components/ui/Input.tsx - Input component
5. src/components/ui/Badge.tsx - Status badge component
6. src/components/ui/Modal.tsx - Modal dialog component
7. src/components/layout/Navbar.tsx - Navigation bar
8. src/components/layout/Sidebar.tsx - Side navigation (if applicable)
9. WIREFRAMES.md - Text-based wireframe descriptions for each page`;
  }

  async run(context: AgentContext): Promise<AgentOutput> {
    await this.log("Designing UI components and layout...", "INFO");

    const spec = context.previousOutputs["PRODUCT_MANAGER"]?.summary ?? context.prompt;

    const userMessage = `Project: ${context.projectName}
Specification: ${spec}
Prompt: ${context.prompt}
Tech Stack: ${context.techStack.join(", ")}

Design the complete UI system for this application. Focus on a clean, professional dark theme.`;

    const raw = await this.callAgent(userMessage);
    const { files, summary, nextSteps } = this.parseAgentOutput(raw);

    await this.writeFiles(files);
    await this.log(`UI design complete: ${summary}`, "SUCCESS");

    return { agentType: "UI_UX", summary, files, nextSteps };
  }
}
