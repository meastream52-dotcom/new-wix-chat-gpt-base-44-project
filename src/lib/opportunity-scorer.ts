import type {
  DBAthleteProfile,
  DBSchoolSport,
  DBSchool,
  DBStats,
  DBVideo,
  RecommendationType,
  ScoreBreakdown,
} from './athlete-types';

export interface ScoringInputs {
  athlete: DBAthleteProfile;
  stats: DBStats[];
  videos: DBVideo[];
  schoolSport: DBSchoolSport;
  school: DBSchool;
}

export interface ScoredOpportunity {
  overallScore: number;
  athleticFitScore: number;
  academicFitScore: number;
  financialFitScore: number;
  geographicFitScore: number;
  profileCompletenessScore: number;
  recommendation: RecommendationType;
  breakdown: ScoreBreakdown;
}

const WEIGHTS = {
  athleticFit: 0.40,
  academicFit: 0.25,
  financialFit: 0.20,
  geographicFit: 0.10,
  profileCompleteness: 0.05,
} as const;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function scoreAthleticFit(
  athlete: DBAthleteProfile,
  schoolSport: DBSchoolSport,
  school: DBSchool
): number {
  let score = 45;

  if (schoolSport.recruiting_active) {
    score += 20;
  }

  if (schoolSport.scholarships_remaining != null && schoolSport.scholarships_remaining > 0) {
    score += Math.min(15, schoolSport.scholarships_remaining * 3);
  }

  if (
    athlete.position != null &&
    schoolSport.typical_positions_needed != null &&
    schoolSport.typical_positions_needed.includes(athlete.position)
  ) {
    score += 15;
  }

  if (
    athlete.preferred_divisions != null &&
    athlete.preferred_divisions.includes(school.division)
  ) {
    score += 5;
  }

  return clamp(score);
}

function scoreAcademicFit(
  athlete: DBAthleteProfile,
  schoolSport: DBSchoolSport,
  school: DBSchool
): number {
  // Hard cutoff: athlete is below minimum GPA requirement
  if (
    schoolSport.min_gpa != null &&
    athlete.gpa != null &&
    athlete.gpa < schoolSport.min_gpa
  ) {
    return 0;
  }
  if (
    schoolSport.min_sat != null &&
    athlete.sat_score != null &&
    athlete.sat_score < schoolSport.min_sat
  ) {
    return 0;
  }
  if (
    schoolSport.min_act != null &&
    athlete.act_score != null &&
    athlete.act_score < schoolSport.min_act
  ) {
    return 0;
  }

  let score = 50;

  if (athlete.gpa != null && school.avg_gpa != null) {
    const gpaDelta = athlete.gpa - school.avg_gpa;
    if (gpaDelta >= 0) {
      score += 30;
    } else if (gpaDelta >= -0.3) {
      score += 15;
    } else if (gpaDelta >= -0.7) {
      score += 5;
    } else {
      score -= 20;
    }
  }

  if (athlete.sat_score != null && school.avg_sat != null) {
    const satDelta = athlete.sat_score - school.avg_sat;
    if (satDelta >= 0) {
      score += 10;
    } else if (satDelta >= -100) {
      score += 5;
    } else {
      score -= 5;
    }
  } else if (athlete.act_score != null && school.avg_act != null) {
    const actDelta = athlete.act_score - school.avg_act;
    if (actDelta >= 0) {
      score += 10;
    } else if (actDelta >= -3) {
      score += 5;
    } else {
      score -= 5;
    }
  }

  return clamp(score);
}

function scoreFinancialFit(schoolSport: DBSchoolSport, school: DBSchool): number {
  const baseByDivision: Record<string, number> = {
    NCAA_D1: 75,
    NCAA_D2: 70,
    NCAA_D3: 55,
    NAIA: 65,
    JUCO: 85,
    NJCAA: 88,
  };

  let score = baseByDivision[school.division] ?? 60;

  if (schoolSport.scholarships_remaining != null) {
    if (schoolSport.scholarships_remaining > 2) {
      score += 12;
    } else if (schoolSport.scholarships_remaining === 1) {
      score += 5;
    }
  }

  return clamp(score);
}

function scoreGeographicFit(athlete: DBAthleteProfile, school: DBSchool): number {
  if (athlete.preferred_states != null && athlete.preferred_states.includes(school.state)) {
    return 100;
  }
  if (athlete.state != null && athlete.state === school.state) {
    return 85;
  }
  return 55;
}

function scoreProfileCompleteness(
  athlete: DBAthleteProfile,
  stats: DBStats[],
  videos: DBVideo[]
): number {
  let score = 0;

  if (athlete.bio != null && athlete.bio.length > 50) score += 20;
  if (athlete.gpa != null) score += 15;
  if (athlete.height_inches != null && athlete.weight_lbs != null) score += 10;
  if (athlete.profile_image_url != null) score += 5;

  if (stats.length >= 5) {
    score += 25;
  } else if (stats.length > 0) {
    score += stats.length * 5;
  }

  if (videos.length >= 2) {
    score += 25;
  } else if (videos.length === 1) {
    score += 12;
  }

  return clamp(score);
}

function toRecommendation(score: number): RecommendationType {
  if (score >= 80) return 'strong_match';
  if (score >= 65) return 'good_match';
  if (score >= 50) return 'possible_match';
  if (score >= 35) return 'reach';
  return 'unlikely';
}

export function scoreOpportunity(inputs: ScoringInputs): ScoredOpportunity {
  const { athlete, stats, videos, schoolSport, school } = inputs;

  const athleticFitScore = scoreAthleticFit(athlete, schoolSport, school);
  const academicFitScore = scoreAcademicFit(athlete, schoolSport, school);
  const financialFitScore = scoreFinancialFit(schoolSport, school);
  const geographicFitScore = scoreGeographicFit(athlete, school);
  const profileCompletenessScore = scoreProfileCompleteness(athlete, stats, videos);

  const overallScore = Math.round(
    (athleticFitScore    * WEIGHTS.athleticFit +
     academicFitScore    * WEIGHTS.academicFit +
     financialFitScore   * WEIGHTS.financialFit +
     geographicFitScore  * WEIGHTS.geographicFit +
     profileCompletenessScore * WEIGHTS.profileCompleteness) * 100
  ) / 100;

  const breakdown: ScoreBreakdown = {
    athletic_fit: athleticFitScore,
    academic_fit: academicFitScore,
    financial_fit: financialFitScore,
    geographic_fit: geographicFitScore,
    profile_completeness: profileCompletenessScore,
    weights: {
      athletic_fit: WEIGHTS.athleticFit,
      academic_fit: WEIGHTS.academicFit,
      financial_fit: WEIGHTS.financialFit,
      geographic_fit: WEIGHTS.geographicFit,
      profile_completeness: WEIGHTS.profileCompleteness,
    },
    inputs: {
      athlete_gpa: athlete.gpa,
      athlete_sat: athlete.sat_score,
      athlete_act: athlete.act_score,
      athlete_sport: athlete.sport,
      athlete_position: athlete.position,
      school_avg_gpa: school.avg_gpa,
      school_avg_sat: school.avg_sat,
      school_division: school.division,
      scholarships_remaining: schoolSport.scholarships_remaining,
      recruiting_active: schoolSport.recruiting_active,
      stats_on_file: stats.length,
      videos_on_file: videos.length,
    },
  };

  return {
    overallScore,
    athleticFitScore,
    academicFitScore,
    financialFitScore,
    geographicFitScore,
    profileCompletenessScore,
    recommendation: toRecommendation(overallScore),
    breakdown,
  };
}
