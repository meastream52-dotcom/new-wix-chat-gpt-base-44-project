export type ProjectStatus = "active" | "building" | "paused";

export interface Project {
  id: string;
  name: string;
  description: string;
  agentCount: number;
  status: ProjectStatus;
  updatedAt: string;
}

export interface NavItem {
  href: string;
  label: string;
}
