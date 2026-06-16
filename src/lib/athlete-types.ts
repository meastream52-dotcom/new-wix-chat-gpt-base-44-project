export type UserRole = 'athlete' | 'parent' | 'coach' | 'school_admin' | 'admin';

export type DivisionType =
  | 'NCAA_D1'
  | 'NCAA_D2'
  | 'NCAA_D3'
  | 'NAIA'
  | 'JUCO'
  | 'NJCAA';

export type GenderType = 'M' | 'F' | 'COED';

export type VideoPlatform = 'youtube' | 'hudl' | 'vimeo' | 'other';

export type HighlightType = 'highlight_reel' | 'game_film' | 'skill' | 'interview';

export type RecommendationType =
  | 'strong_match'
  | 'good_match'
  | 'possible_match'
  | 'reach'
  | 'unlikely';

// ─── DB row types ─────────────────────────────────────────────────────────────

export interface DBUser {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface DBAthleteProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  graduation_year: number;
  sport: string;
  position: string | null;
  height_inches: number | null;
  weight_lbs: number | null;
  gpa: number | null;
  sat_score: number | null;
  act_score: number | null;
  state: string | null;
  city: string | null;
  bio: string | null;
  profile_image_url: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  preferred_divisions: DivisionType[] | null;
  preferred_states: string[] | null;
  intended_major: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBParentProfile {
  id: string;
  user_id: string;
  athlete_id: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  relationship: 'parent' | 'guardian' | 'other';
  created_at: string;
  updated_at: string;
}

export interface DBCoachProfile {
  id: string;
  user_id: string;
  school_id: string | null;
  first_name: string;
  last_name: string;
  sport: string;
  title: string | null;
  phone: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBSchool {
  id: string;
  name: string;
  slug: string;
  division: DivisionType;
  conference: string | null;
  state: string;
  city: string;
  website_url: string | null;
  logo_url: string | null;
  enrollment: number | null;
  endowment_millions: number | null;
  acceptance_rate: number | null;
  avg_gpa: number | null;
  avg_sat: number | null;
  avg_act: number | null;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  created_at: string;
  updated_at: string;
}

export interface DBSchoolSport {
  id: string;
  school_id: string;
  sport: string;
  gender: GenderType;
  scholarships_total: number | null;
  scholarships_remaining: number | null;
  head_coach_name: string | null;
  head_coach_email: string | null;
  roster_size: number | null;
  typical_positions_needed: string[] | null;
  min_gpa: number | null;
  min_sat: number | null;
  min_act: number | null;
  recruiting_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBSchoolSportWithSchool extends DBSchoolSport {
  school: DBSchool;
}

export interface DBStats {
  id: string;
  athlete_id: string;
  season: string;
  sport: string;
  stat_key: string;
  stat_value: number;
  unit: string | null;
  created_at: string;
}

export interface DBVideo {
  id: string;
  athlete_id: string;
  title: string;
  url: string;
  platform: VideoPlatform;
  duration_seconds: number | null;
  highlight_type: HighlightType;
  is_primary: boolean;
  views: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBOpportunityScore {
  id: string;
  athlete_id: string;
  school_sport_id: string;
  overall_score: number;
  athletic_fit_score: number | null;
  academic_fit_score: number | null;
  financial_fit_score: number | null;
  geographic_fit_score: number | null;
  profile_completeness_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  recommendation: RecommendationType;
  calculated_at: string;
}

// ─── Score breakdown detail ───────────────────────────────────────────────────

export interface ScoreBreakdown {
  athletic_fit: number;
  academic_fit: number;
  financial_fit: number;
  geographic_fit: number;
  profile_completeness: number;
  weights: {
    athletic_fit: number;
    academic_fit: number;
    financial_fit: number;
    geographic_fit: number;
    profile_completeness: number;
  };
  inputs: {
    athlete_gpa: number | null;
    athlete_sat: number | null;
    athlete_act: number | null;
    athlete_sport: string;
    athlete_position: string | null;
    school_avg_gpa: number | null;
    school_avg_sat: number | null;
    school_division: DivisionType;
    scholarships_remaining: number | null;
    recruiting_active: boolean;
    stats_on_file: number;
    videos_on_file: number;
  };
}

// ─── API request / response shapes ───────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface CreateAthleteProfileRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  graduationYear: number;
  sport: string;
  position?: string;
  heightInches?: number;
  weightLbs?: number;
  gpa?: number;
  satScore?: number;
  actScore?: number;
  state?: string;
  city?: string;
  bio?: string;
  profileImageUrl?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  preferredDivisions?: DivisionType[];
  preferredStates?: string[];
  intendedMajor?: string;
}

export interface UpdateAthleteProfileRequest extends Partial<CreateAthleteProfileRequest> {}

export interface CreateParentProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  relationship?: 'parent' | 'guardian' | 'other';
  athleteId?: string;
}

export interface CreateCoachProfileRequest {
  firstName: string;
  lastName: string;
  sport: string;
  schoolId?: string;
  title?: string;
  phone?: string;
}

export interface CreateSchoolRequest {
  name: string;
  slug: string;
  division: DivisionType;
  conference?: string;
  state: string;
  city: string;
  websiteUrl?: string;
  logoUrl?: string;
  enrollment?: number;
  endowmentMillions?: number;
  acceptanceRate?: number;
  avgGpa?: number;
  avgSat?: number;
  avgAct?: number;
  tuitionInState?: number;
  tuitionOutState?: number;
}

export interface CreateSchoolSportRequest {
  sport: string;
  gender: GenderType;
  scholarshipsTotal?: number;
  scholarshipsRemaining?: number;
  headCoachName?: string;
  headCoachEmail?: string;
  rosterSize?: number;
  typicalPositionsNeeded?: string[];
  minGpa?: number;
  minSat?: number;
  minAct?: number;
  recruitingActive?: boolean;
}

export interface CreateStatRequest {
  season: string;
  sport: string;
  statKey: string;
  statValue: number;
  unit?: string;
}

export interface CreateVideoRequest {
  title: string;
  url: string;
  platform: VideoPlatform;
  durationSeconds?: number;
  highlightType: HighlightType;
  isPrimary?: boolean;
  thumbnailUrl?: string;
}

export interface SchoolMatchFilters {
  sport: string;
  gender?: GenderType;
  divisions?: DivisionType[];
  states?: string[];
  minScholarships?: number;
  recruitingOnly?: boolean;
  limit?: number;
}

export interface SchoolMatchResult {
  school: DBSchool;
  schoolSport: DBSchoolSport;
  score: DBOpportunityScore;
}

export interface OpportunityScoreRequest {
  athleteId: string;
  schoolSportId: string;
}

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
