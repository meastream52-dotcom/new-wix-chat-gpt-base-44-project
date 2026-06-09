export type Plan = "FREE" | "PRO" | "ENTERPRISE";
export type ProjectStatus = "PENDING" | "PLANNING" | "BUILDING" | "TESTING" | "REVIEW" | "DEPLOYED" | "FAILED" | "PAUSED";
export type AgentType = "ORCHESTRATOR" | "PRODUCT_MANAGER" | "UI_UX" | "FRONTEND" | "BACKEND" | "DATABASE" | "TESTING" | "SECURITY" | "DEVOPS" | "DOCUMENTATION" | "BILLING_AGENT" | "DEBUGGING" | "INTEGRATION";
export type AgentStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "WAITING_APPROVAL";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "BLOCKED";
export type ApprovalType = "DEPLOY" | "DELETE_FILES" | "SPEND_MONEY" | "SEND_EMAIL" | "CHANGE_API_KEY" | "MODIFY_BILLING" | "ACCESS_PRIVATE_DATA" | "CREATE_CLOUD_RESOURCE";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "SUCCESS";
export type DeploymentStatus = "PENDING" | "IN_PROGRESS" | "DEPLOYED" | "FAILED" | "ROLLED_BACK";

export interface BuilderUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: Plan;
  stripeCustomerId: string | null;
  createdAt: Date;
}

export interface BuilderProject {
  id: string;
  userId: string;
  name: string;
  prompt: string;
  status: ProjectStatus;
  techStack: Record<string, string> | null;
  repoUrl: string | null;
  deployUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRunRecord {
  id: string;
  projectId: string;
  type: AgentType;
  status: AgentStatus;
  input: unknown;
  output: unknown;
  logs: AgentLogEntry[];
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface AgentLogEntry {
  id: string;
  projectId: string;
  agentType: AgentType | null;
  level: LogLevel;
  message: string;
  metadata: unknown;
  createdAt: string;
}

export interface GeneratedFileRecord {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string | null;
  version: number;
  agentType: AgentType | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalRecord {
  id: string;
  projectId: string;
  type: ApprovalType;
  description: string;
  metadata: unknown;
  status: ApprovalStatus;
  requestedAt: Date;
  resolvedAt: Date | null;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  agentType?: AgentType;
}

// Agent system contracts
export interface AgentContext {
  projectId: string;
  prompt: string;
  projectName: string;
  techStack: string[];
  previousOutputs: Record<string, AgentOutput>;
}

export interface AgentOutput {
  agentType: AgentType;
  summary: string;
  files: GeneratedFileInput[];
  nextSteps?: string[];
  requiresApproval?: ApprovalRequest;
  metadata?: Record<string, unknown>;
}

export interface GeneratedFileInput {
  path: string;
  content: string;
  language?: string;
}

export interface ApprovalRequest {
  type: ApprovalType;
  description: string;
  metadata?: Record<string, unknown>;
}

// Integration agent registry
export interface IntegrationAgent {
  name: string;
  slug: string;
  description: string;
  category: "ide" | "vcs" | "runtime" | "db" | "ai" | "automation" | "design" | "3d" | "infra";
  systemPromptFragment: string;
}

export const INTEGRATION_AGENTS: IntegrationAgent[] = [
  { name: "VS Code", slug: "vscode", description: "VS Code workspace and extension config", category: "ide", systemPromptFragment: "Generate .vscode/settings.json, extensions.json, and launch.json configurations." },
  { name: "Cursor", slug: "cursor", description: "Cursor IDE rules and AI config", category: "ide", systemPromptFragment: "Generate .cursorrules file with project-specific Cursor AI instructions." },
  { name: "GitHub", slug: "github", description: "GitHub Actions CI/CD workflows", category: "vcs", systemPromptFragment: "Generate .github/workflows/ CI/CD pipelines with build, test, and deploy steps." },
  { name: "Docker", slug: "docker", description: "Dockerfile and docker-compose setup", category: "runtime", systemPromptFragment: "Generate Dockerfile with multi-stage build and docker-compose.yml for local dev." },
  { name: "Node.js", slug: "nodejs", description: "Node.js runtime configuration", category: "runtime", systemPromptFragment: "Generate .nvmrc, package.json scripts, and Node.js-specific configuration." },
  { name: "Python", slug: "python", description: "Python runtime and package config", category: "runtime", systemPromptFragment: "Generate requirements.txt, pyproject.toml, and Python-specific configuration." },
  { name: "PostgreSQL", slug: "postgresql", description: "PostgreSQL schema and migrations", category: "db", systemPromptFragment: "Generate SQL migrations, indexes, and database configuration for PostgreSQL." },
  { name: "Claude API", slug: "claude", description: "Anthropic Claude API integration", category: "ai", systemPromptFragment: "Generate Claude API integration code using @anthropic-ai/sdk with proper error handling and streaming." },
  { name: "OpenAI", slug: "openai", description: "OpenAI GPT API integration", category: "ai", systemPromptFragment: "Generate OpenAI API integration code with chat completions, streaming, and error handling." },
  { name: "Gemini", slug: "gemini", description: "Google Gemini API integration", category: "ai", systemPromptFragment: "Generate Google Gemini API integration using @google/generative-ai SDK." },
  { name: "Ollama", slug: "ollama", description: "Ollama local LLM integration", category: "ai", systemPromptFragment: "Generate Ollama API integration for local LLM inference with streaming support." },
  { name: "n8n", slug: "n8n", description: "n8n workflow automation export", category: "automation", systemPromptFragment: "Generate n8n workflow JSON definitions for automation pipelines." },
  { name: "Stripe", slug: "stripe", description: "Stripe payments integration", category: "infra", systemPromptFragment: "Generate Stripe checkout, webhooks, subscription management, and billing portal code." },
  { name: "Vercel", slug: "vercel", description: "Vercel deployment configuration", category: "infra", systemPromptFragment: "Generate vercel.json, environment variable setup, and deployment configuration." },
  { name: "Canva", slug: "canva", description: "Canva design system stub", category: "design", systemPromptFragment: "Generate design system documentation and asset export configuration for Canva integration." },
  { name: "Blender", slug: "blender", description: "Blender 3D pipeline stub", category: "3d", systemPromptFragment: "Generate Blender Python script stubs for 3D asset pipeline automation." },
];

// Subscription plans
export const PLANS = {
  FREE: { name: "Free", price: 0, projects: 3, buildsPerMonth: 10, agents: ["PRODUCT_MANAGER", "FRONTEND", "DATABASE"] },
  PRO: { name: "Pro", price: 29, projects: 25, buildsPerMonth: 100, agents: "all" },
  ENTERPRISE: { name: "Enterprise", price: 99, projects: -1, buildsPerMonth: -1, agents: "all" },
} as const;

export const TECH_STACKS = {
  "nextjs-supabase": { label: "Next.js + Supabase", tags: ["Next.js", "React", "TypeScript", "Tailwind", "Supabase", "Stripe"] },
  "nextjs-postgres": { label: "Next.js + PostgreSQL", tags: ["Next.js", "React", "TypeScript", "Tailwind", "PostgreSQL", "Prisma"] },
  "react-node": { label: "React + Node.js API", tags: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"] },
  "t3-stack": { label: "T3 Stack", tags: ["Next.js", "TypeScript", "tRPC", "Prisma", "Tailwind", "NextAuth"] },
} as const;
