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

// ── Podcast ──────────────────────────────────────────────────────────────────

export type PodcastStatus = "DRAFT" | "SCRIPTED" | "GENERATING" | "READY" | "FAILED";
export type AdPlacement = "PRE_ROLL" | "MID_ROLL" | "POST_ROLL";
export type AdStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export interface PodcastSegment {
  type: "intro" | "content" | "ad" | "outro";
  text: string;
  adId?: string;
  label?: string;
}

export interface Podcast {
  id: string;
  title: string;
  topic: string;
  tone: string;
  targetLength: number;
  hostName: string;
  voiceId: string;
  status: PodcastStatus;
  script: PodcastSegment[] | null;
  audioUrl: string | null;
  adsEnabled: boolean;
  adIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  sponsor: string;
  adCopy: string;
  placement: AdPlacement;
  status: AdStatus;
  createdAt: string;
  updatedAt: string;
}

export const ELEVENLABS_VOICES: Record<string, string> = {
  Rachel: "21m00Tcm4TlvDq8ikWAM",
  Adam: "pNInz6obpgDQGcFmaJgB",
  Antoni: "ErXwobaYiN019PkySvjV",
  Bella: "EXAVITQu4vr4xnSDxMaL",
  Josh: "TxGEqnHWrfWFTfGW9XjX",
  Domi: "AZnzlk1XvdvUeBnXmlld",
};
