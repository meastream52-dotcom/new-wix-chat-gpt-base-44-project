// ─── ASC Domain Types ────────────────────────────────────────────────────────

export type AscProjectStatus = "INITIALIZING" | "RUNNING" | "COMPLETED" | "FAILED" | "PAUSED";
export type AscTaskStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
export type AscArtifactType =
  | "PRD"
  | "ARCHITECTURE"
  | "FRONTEND_CODE"
  | "BACKEND_CODE"
  | "DATABASE_SCHEMA"
  | "TESTS"
  | "DOCUMENTATION"
  | "DEPLOYMENT_CONFIG";
export type AscDeploymentStatus = "PENDING" | "BUILDING" | "DEPLOYED" | "FAILED";
export type AscMessageType = "INFO" | "SUCCESS" | "ERROR" | "WARNING" | "PROGRESS";

export interface AscProjectSummary {
  id: string;
  name: string;
  description: string;
  status: AscProjectStatus;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  artifactCount: number;
  totalCost: number;
}

export interface AscProjectDetail extends AscProjectSummary {
  tasks: AscTaskRecord[];
  artifacts: AscArtifactRecord[];
  deployments: AscDeploymentRecord[];
  messages: AscMessageRecord[];
  costEntries: AscCostEntryRecord[];
}

export interface AscTaskRecord {
  id: string;
  projectId: string;
  agentRole: string;
  type: string;
  status: AscTaskStatus;
  input: unknown;
  output: unknown;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AscArtifactRecord {
  id: string;
  projectId: string;
  type: AscArtifactType;
  name: string;
  content: string;
  version: number;
  createdAt: string;
}

export interface AscDeploymentRecord {
  id: string;
  projectId: string;
  environment: string;
  url: string | null;
  status: AscDeploymentStatus;
  logs: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AscMessageRecord {
  id: string;
  projectId: string;
  fromAgentRole: string;
  toAgentRole: string | null;
  content: string;
  type: AscMessageType;
  timestamp: string;
}

export interface AscCostEntryRecord {
  id: string;
  projectId: string;
  agentRole: string;
  tokens: number;
  cost: number;
  timestamp: string;
}

// ─── Agent Contracts ─────────────────────────────────────────────────────────

export interface ProjectContext {
  projectId: string;
  projectName: string;
  description: string;
  previousArtifacts?: AscArtifactRecord[];
  previousMessages?: AscMessageRecord[];
}

export interface AgentResult {
  success: boolean;
  artifactType: AscArtifactType;
  artifactName: string;
  content: string;
  tokensUsed: number;
  cost: number;
  error?: string;
}

// ─── SSE Event Types ─────────────────────────────────────────────────────────

export type SseEventType =
  | "agent_start"
  | "agent_progress"
  | "agent_complete"
  | "agent_error"
  | "pipeline_start"
  | "pipeline_complete"
  | "pipeline_error"
  | "message";

export interface SseEvent {
  type: SseEventType;
  agentRole?: string;
  data: string;
  timestamp: string;
}

// ─── Agent Catalog ────────────────────────────────────────────────────────────

export interface AgentDefinition {
  role: string;
  name: string;
  team: string;
  description: string;
  icon: string;
  color: string;
  capabilities: string[];
  outputArtifact: AscArtifactType;
  isImplemented: boolean;
}

export const AGENT_CATALOG: AgentDefinition[] = [
  // Executive
  {
    role: "CEO",
    name: "CEO Agent",
    team: "Executive",
    description: "Understands customer goals, defines business requirements, sets project direction",
    icon: "◎",
    color: "#f59e0b",
    capabilities: ["Goal alignment", "Priority setting", "Resource allocation", "Stakeholder communication"],
    outputArtifact: "PRD",
    isImplemented: false,
  },
  {
    role: "COO",
    name: "COO Agent",
    team: "Executive",
    description: "Manages workflow, coordinates agents, tracks progress, resolves bottlenecks",
    icon: "◈",
    color: "#f59e0b",
    capabilities: ["Workflow management", "Agent coordination", "Progress tracking", "Bottleneck resolution"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  {
    role: "CTO",
    name: "CTO Agent",
    team: "Executive",
    description: "Makes technical decisions, designs system architecture, selects technology stack",
    icon: "⬡",
    color: "#f59e0b",
    capabilities: ["Technical decisions", "Architecture design", "Stack selection", "Scalability planning"],
    outputArtifact: "ARCHITECTURE",
    isImplemented: false,
  },
  // Product
  {
    role: "PM",
    name: "Product Manager Agent",
    team: "Product",
    description: "Creates PRDs, user stories, acceptance criteria, and feature roadmaps",
    icon: "▣",
    color: "#8b5cf6",
    capabilities: ["PRD creation", "User stories", "Acceptance criteria", "Feature roadmap"],
    outputArtifact: "PRD",
    isImplemented: true,
  },
  {
    role: "BUSINESS_ANALYST",
    name: "Business Analyst Agent",
    team: "Product",
    description: "Analyzes requirements, researches competitors, creates functional specifications",
    icon: "◉",
    color: "#8b5cf6",
    capabilities: ["Requirement analysis", "Competitor analysis", "Market research", "Functional specs"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  // Design
  {
    role: "UX_RESEARCHER",
    name: "UX Research Agent",
    team: "Design",
    description: "Creates user flows, personas, and journey maps",
    icon: "◎",
    color: "#ec4899",
    capabilities: ["User flows", "Personas", "Journey maps", "Usability analysis"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  {
    role: "UI_DESIGNER",
    name: "UI Designer Agent",
    team: "Design",
    description: "Creates wireframes, mockups, design systems, and responsive layouts",
    icon: "◈",
    color: "#ec4899",
    capabilities: ["Wireframes", "Mockups", "Design systems", "Responsive layouts"],
    outputArtifact: "FRONTEND_CODE",
    isImplemented: false,
  },
  {
    role: "BRAND_DESIGNER",
    name: "Brand Designer Agent",
    team: "Design",
    description: "Creates logos, color palettes, typography, and brand assets",
    icon: "⬡",
    color: "#ec4899",
    capabilities: ["Logo creation", "Color palette", "Typography", "Brand guidelines"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  // Engineering
  {
    role: "SYSTEM_ARCHITECT",
    name: "System Architect Agent",
    team: "Engineering",
    description: "Designs high-level architecture, microservices, and infrastructure plans",
    icon: "▣",
    color: "#06b6d4",
    capabilities: ["Architecture design", "Microservices", "Infrastructure planning", "API design"],
    outputArtifact: "ARCHITECTURE",
    isImplemented: true,
  },
  {
    role: "FRONTEND_ENGINEER",
    name: "Frontend Engineer Agent",
    team: "Engineering",
    description: "Builds React/Next.js components, Tailwind UI, and responsive interfaces",
    icon: "◉",
    color: "#06b6d4",
    capabilities: ["React/Next.js", "Tailwind CSS", "TypeScript", "Responsive UI"],
    outputArtifact: "FRONTEND_CODE",
    isImplemented: true,
  },
  {
    role: "BACKEND_ENGINEER",
    name: "Backend Engineer Agent",
    team: "Engineering",
    description: "Builds APIs, authentication, business logic, and third-party integrations",
    icon: "◎",
    color: "#06b6d4",
    capabilities: ["REST APIs", "Authentication", "Business logic", "Integrations"],
    outputArtifact: "BACKEND_CODE",
    isImplemented: true,
  },
  {
    role: "DATABASE_ENGINEER",
    name: "Database Engineer Agent",
    team: "Engineering",
    description: "Designs schemas, migrations, indexes, and query optimizations",
    icon: "◈",
    color: "#06b6d4",
    capabilities: ["Schema design", "Migrations", "Query optimization", "Data modeling"],
    outputArtifact: "DATABASE_SCHEMA",
    isImplemented: true,
  },
  {
    role: "MOBILE_DEVELOPER",
    name: "Mobile Developer Agent",
    team: "Engineering",
    description: "Builds React Native apps for iOS and Android",
    icon: "⬡",
    color: "#06b6d4",
    capabilities: ["React Native", "iOS", "Android", "Mobile UX"],
    outputArtifact: "FRONTEND_CODE",
    isImplemented: false,
  },
  // AI Team
  {
    role: "AI_ARCHITECT",
    name: "AI Architect Agent",
    team: "AI",
    description: "Designs AI workflows, agent architectures, prompt engineering, and RAG systems",
    icon: "▣",
    color: "#10b981",
    capabilities: ["AI workflows", "Prompt engineering", "RAG systems", "Agent design"],
    outputArtifact: "ARCHITECTURE",
    isImplemented: false,
  },
  {
    role: "MODEL_SELECTOR",
    name: "Model Selection Agent",
    team: "AI",
    description: "Selects optimal AI models based on cost, performance, and task requirements",
    icon: "◉",
    color: "#10b981",
    capabilities: ["Model evaluation", "Cost analysis", "Performance benchmarking", "Provider selection"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  // DevOps
  {
    role: "INFRASTRUCTURE",
    name: "Infrastructure Agent",
    team: "DevOps",
    description: "Manages cloud infrastructure on AWS, Azure, GCP, and Kubernetes",
    icon: "◎",
    color: "#f97316",
    capabilities: ["AWS", "Kubernetes", "Terraform", "Cloud architecture"],
    outputArtifact: "DEPLOYMENT_CONFIG",
    isImplemented: false,
  },
  {
    role: "DEPLOYMENT",
    name: "Deployment Agent",
    team: "DevOps",
    description: "Handles CI/CD pipelines, Docker containerization, and platform deployments",
    icon: "◈",
    color: "#f97316",
    capabilities: ["CI/CD", "Docker", "Vercel", "GitHub Actions"],
    outputArtifact: "DEPLOYMENT_CONFIG",
    isImplemented: false,
  },
  {
    role: "MONITORING",
    name: "Monitoring Agent",
    team: "DevOps",
    description: "Sets up logging, alerts, and performance monitoring",
    icon: "⬡",
    color: "#f97316",
    capabilities: ["Logging", "Alerting", "Performance monitoring", "Uptime checks"],
    outputArtifact: "DEPLOYMENT_CONFIG",
    isImplemented: false,
  },
  // QA
  {
    role: "QA",
    name: "QA Agent",
    team: "Quality",
    description: "Writes unit tests, integration tests, and regression test suites",
    icon: "▣",
    color: "#84cc16",
    capabilities: ["Unit tests", "Integration tests", "E2E tests", "Test automation"],
    outputArtifact: "TESTS",
    isImplemented: true,
  },
  {
    role: "SECURITY",
    name: "Security Agent",
    team: "Quality",
    description: "Performs security audits, penetration testing, and vulnerability scanning",
    icon: "◉",
    color: "#84cc16",
    capabilities: ["Security audit", "Pen testing", "OWASP", "Vulnerability scanning"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  {
    role: "COMPLIANCE",
    name: "Compliance Agent",
    team: "Quality",
    description: "Ensures GDPR, HIPAA, SOC2, and PCI compliance",
    icon: "◎",
    color: "#84cc16",
    capabilities: ["GDPR", "HIPAA", "SOC2", "PCI DSS"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  // Marketing
  {
    role: "SEO",
    name: "SEO Agent",
    team: "Marketing",
    description: "Creates SEO strategy, metadata optimization, and keyword targeting",
    icon: "◈",
    color: "#ef4444",
    capabilities: ["SEO strategy", "Metadata", "Keywords", "Content optimization"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  {
    role: "CONTENT",
    name: "Content Agent",
    team: "Marketing",
    description: "Creates blog posts, marketing pages, and documentation",
    icon: "⬡",
    color: "#ef4444",
    capabilities: ["Blog writing", "Marketing copy", "Documentation", "Brand voice"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  // Sales
  {
    role: "LEAD_GEN",
    name: "Lead Generation Agent",
    team: "Sales",
    description: "Finds prospects and business contact information",
    icon: "▣",
    color: "#6366f1",
    capabilities: ["Prospect research", "Contact discovery", "Market targeting", "Lead scoring"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  {
    role: "SALES",
    name: "Sales Agent",
    team: "Sales",
    description: "Handles outreach, follow-up, and deal closing",
    icon: "◉",
    color: "#6366f1",
    capabilities: ["Email outreach", "Follow-up sequences", "Deal closing", "CRM management"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  // Customer Success
  {
    role: "SUPPORT",
    name: "Support Agent",
    team: "Customer Success",
    description: "Handles chat support, ticket resolution, and FAQs",
    icon: "◎",
    color: "#14b8a6",
    capabilities: ["Live chat", "Ticket routing", "FAQ generation", "Customer satisfaction"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
  {
    role: "TRAINING",
    name: "Training Agent",
    team: "Customer Success",
    description: "Creates user guides, video tutorials, and onboarding documentation",
    icon: "◈",
    color: "#14b8a6",
    capabilities: ["User guides", "Tutorial creation", "Onboarding flows", "Help center"],
    outputArtifact: "DOCUMENTATION",
    isImplemented: false,
  },
];

export const MVP_PIPELINE: string[] = [
  "PM",
  "SYSTEM_ARCHITECT",
  "DATABASE_ENGINEER",
  "BACKEND_ENGINEER",
  "FRONTEND_ENGINEER",
  "QA",
];

export const TEAM_COLORS: Record<string, string> = {
  Executive: "#f59e0b",
  Product: "#8b5cf6",
  Design: "#ec4899",
  Engineering: "#06b6d4",
  AI: "#10b981",
  DevOps: "#f97316",
  Quality: "#84cc16",
  Marketing: "#ef4444",
  Sales: "#6366f1",
  "Customer Success": "#14b8a6",
};
