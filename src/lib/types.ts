export type ClaimStatus = "PENDING" | "ACCEPTED" | "WEAK" | "REJECTED";

export interface RawClaim {
  text: string;
  confidence: number;
  timeRef?: string;
  entities: string[];
}

export interface JudgedClaim extends RawClaim {
  id: string;
  documentId: string;
  status: ClaimStatus;
  createdAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "Document" | "Claim" | "Entity";
  confidence?: number;
  status?: ClaimStatus;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "CONTAINS" | "REFERS_TO" | "SUPPORTS" | "CONTRADICTS";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Contradiction {
  id: string;
  claimAId: string;
  claimBId: string;
  claimAText: string;
  claimBText: string;
  reason: string;
  severity: number;
}

export interface TheoryNode {
  claimId: string;
  text: string;
  role: "ANCHOR" | "SUPPORT" | "BRIDGE";
}

export interface TheoryScoreBreakdown {
  supportRatio: number;
  contradictionRatio: number;
  avgConfidence: number;
  coverageScore: number;
}

export interface TheoryResult {
  score: number;
  breakdown: TheoryScoreBreakdown;
  verdict: "STRONG" | "PLAUSIBLE" | "WEAK" | "CONTRADICTED";
  explanation: string;
}
