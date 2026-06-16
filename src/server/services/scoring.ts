/**
 * Opportunity Scoring Engine (PRD §12).
 *
 * Pure, deterministic functions that turn an athlete + a school program into a
 * 0–100 opportunity score with a weighted component breakdown, a recruiting
 * tier, a confidence estimate, and an explainable `factors` payload (consumed
 * by the UI today and the AI agent later).
 *
 *   athletic 30% · academic 20% · roster 25% · major 10% · location 10% · program-level 5%
 */
import type {
  CompetitionDivision,
  Json,
  MatchTier,
  Tables,
} from "@/lib/supabase/types";

export const SCORE_WEIGHTS = {
  athletic_fit: 0.3,
  academic_fit: 0.2,
  roster_fit: 0.25,
  major_fit: 0.1,
  location_fit: 0.1,
  program_level_fit: 0.05,
} as const;

export const SCORING_MODEL_VERSION = "v1";

export interface ScoringAthlete {
  gpa: number | null;
  sat_score: number | null;
  act_score: number | null;
  intended_major: string | null;
  home_state: string | null;
  position: string | null;
  goals: Json;
  preferences: Json;
  statPercentiles: number[];
}

export interface ScoreBreakdown {
  athletic_fit: number;
  academic_fit: number;
  roster_fit: number;
  major_fit: number;
  location_fit: number;
  program_level_fit: number;
  overall_score: number;
  match_tier: MatchTier;
  confidence: number;
  explanation: string;
  factors: Record<string, unknown>;
}

const clamp = (n: number, lo = 0, hi = 100): number => Math.min(hi, Math.max(lo, n));
const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Relative competitiveness of a division (1 = least, 5 = most). */
const DIVISION_COMPETITIVENESS: Record<CompetitionDivision, number> = {
  NCAA_DI: 5,
  NCAA_DII: 4,
  NAIA: 3,
  NJCAA_DI: 3,
  NCAA_DIII: 2,
  NJCAA_DII: 2,
  NJCAA_DIII: 1,
};

function jsonStringArray(json: Json, key: string): string[] {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const value = (json as Record<string, Json | undefined>)[key];
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  }
  return [];
}

function positionNeed(
  programPositionNeeds: Json,
  position: string | null
): { need: number; priority: string | null } | null {
  if (!position || !programPositionNeeds || typeof programPositionNeeds !== "object") return null;
  const map = programPositionNeeds as Record<string, Json | undefined>;
  const entry = map[position] ?? map[position.toUpperCase()] ?? map[position.toLowerCase()];
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const e = entry as Record<string, Json | undefined>;
  return {
    need: typeof e.need === "number" ? e.need : 0,
    priority: typeof e.priority === "string" ? e.priority : null,
  };
}

function academicFit(athlete: ScoringAthlete, school: Tables<"schools">): number {
  if (athlete.gpa === null || school.avg_gpa === null) return 60;
  const delta = athlete.gpa - school.avg_gpa;
  let fit = 70 + delta * 40; // parity → 70; +0.5 GPA → 90; -0.5 → 50
  if (school.acceptance_rate !== null) fit += (school.acceptance_rate - 0.5) * 20;
  return clamp(fit);
}

function athleticFit(
  athlete: ScoringAthlete,
  program: Tables<"school_sports">,
  need: { need: number; priority: string | null } | null
): number {
  const competitiveness = DIVISION_COMPETITIVENESS[program.division];
  let base = 50 + (3 - competitiveness) * 7; // easier division → higher base
  if (need) base += 8;

  if (athlete.statPercentiles.length > 0) {
    const avg =
      athlete.statPercentiles.reduce((s, p) => s + p, 0) / athlete.statPercentiles.length;
    return clamp(base * 0.5 + avg * 0.5);
  }
  return clamp(base);
}

function rosterFit(
  program: Tables<"school_sports">,
  need: { need: number; priority: string | null } | null,
  hasPosition: boolean
): number {
  let fit: number;
  if (need) {
    const byPriority: Record<string, number> = { high: 90, medium: 75, low: 62 };
    fit = byPriority[need.priority ?? ""] ?? 70;
    if (need.need >= 3) fit += 5;
  } else {
    fit = hasPosition ? 52 : 55;
  }
  if ((program.scholarships_available ?? 0) > 0) fit += 5;
  if (program.is_recruiting_active) fit += 3;
  return clamp(fit);
}

function majorFit(athlete: ScoringAthlete, school: Tables<"schools">): number {
  if (!athlete.intended_major) return 70; // no preference → neutral
  if (!school.offered_majors || school.offered_majors.length === 0) return 60;
  const target = athlete.intended_major.toLowerCase();
  const matched = school.offered_majors.some((m) => {
    const major = m.toLowerCase();
    return major === target || major.includes(target) || target.includes(major);
  });
  return matched ? 100 : 40;
}

function locationFit(athlete: ScoringAthlete, school: Tables<"schools">): number {
  const preferredStates = [
    ...jsonStringArray(athlete.goals, "preferred_states"),
    ...jsonStringArray(athlete.preferences, "preferred_states"),
  ].map((s) => s.toUpperCase());

  if (athlete.home_state && school.state) {
    if (athlete.home_state.toUpperCase() === school.state.toUpperCase()) return 100;
  }
  if (school.state && preferredStates.includes(school.state.toUpperCase())) return 90;
  return 60;
}

function programLevelFit(athlete: ScoringAthlete, program: Tables<"school_sports">): number {
  const targets = jsonStringArray(athlete.goals, "target_divisions");
  if (targets.length === 0) return 70;
  if (targets.includes(program.division)) return 100;
  const associationOf = (d: string) => d.split("_")[0];
  if (targets.some((t) => associationOf(t) === associationOf(program.division))) return 70;
  return 50;
}

function tierFromScore(overall: number): MatchTier {
  if (overall >= 85) return "safety";
  if (overall >= 75) return "likely";
  if (overall >= 60) return "target";
  if (overall >= 45) return "reach";
  return "high_reach";
}

function confidenceFrom(athlete: ScoringAthlete): number {
  const signals = [
    athlete.gpa !== null,
    athlete.position !== null,
    athlete.intended_major !== null,
    athlete.home_state !== null,
    athlete.statPercentiles.length > 0,
    jsonStringArray(athlete.goals, "target_divisions").length > 0,
  ];
  const present = signals.filter(Boolean).length;
  return round2(40 + (present / signals.length) * 60);
}

export function scoreOpportunity(
  athlete: ScoringAthlete,
  school: Tables<"schools">,
  program: Tables<"school_sports">
): ScoreBreakdown {
  const need = positionNeed(program.position_needs, athlete.position);
  const components = {
    athletic_fit: round2(athleticFit(athlete, program, need)),
    academic_fit: round2(academicFit(athlete, school)),
    roster_fit: round2(rosterFit(program, need, athlete.position !== null)),
    major_fit: round2(majorFit(athlete, school)),
    location_fit: round2(locationFit(athlete, school)),
    program_level_fit: round2(programLevelFit(athlete, program)),
  };

  const overall = round2(
    clamp(
      components.athletic_fit * SCORE_WEIGHTS.athletic_fit +
        components.academic_fit * SCORE_WEIGHTS.academic_fit +
        components.roster_fit * SCORE_WEIGHTS.roster_fit +
        components.major_fit * SCORE_WEIGHTS.major_fit +
        components.location_fit * SCORE_WEIGHTS.location_fit +
        components.program_level_fit * SCORE_WEIGHTS.program_level_fit
    )
  );

  const match_tier = tierFromScore(overall);
  const confidence = confidenceFrom(athlete);

  const drivers: string[] = [];
  if (need) drivers.push(`roster need at ${athlete.position} (${need.priority ?? "unspecified"})`);
  if (components.academic_fit >= 75) drivers.push("strong academic fit");
  if (components.major_fit >= 90) drivers.push(`offers ${athlete.intended_major}`);
  if (components.location_fit >= 90) drivers.push("preferred location");
  const explanation =
    drivers.length > 0
      ? `Overall ${overall}/100 — ${drivers.join(", ")}.`
      : `Overall ${overall}/100 based on athletic, academic and roster fit.`;

  return {
    ...components,
    overall_score: overall,
    match_tier,
    confidence,
    explanation,
    factors: {
      weights: SCORE_WEIGHTS,
      components,
      position_need: need,
      division: program.division,
      gpa_delta:
        athlete.gpa !== null && school.avg_gpa !== null
          ? round2(athlete.gpa - school.avg_gpa)
          : null,
    },
  };
}
