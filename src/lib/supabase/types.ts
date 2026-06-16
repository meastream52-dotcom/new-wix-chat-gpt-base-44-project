/**
 * Athlete Opportunity Engine — Supabase database types.
 *
 * Hand-authored to match supabase/migrations (Step 2). Shape is identical to
 * `supabase gen types typescript`, so it can be regenerated/replaced with:
 *   supabase gen types typescript --linked --schema public > src/lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---- Enumerated types (public schema) ----
export type UserRole = "athlete" | "parent" | "coach" | "admin";
export type Gender = "male" | "female" | "nonbinary" | "prefer_not_to_say";
export type AthleticAssociation = "NCAA" | "NAIA" | "NJCAA";
export type CompetitionDivision =
  | "NCAA_DI"
  | "NCAA_DII"
  | "NCAA_DIII"
  | "NAIA"
  | "NJCAA_DI"
  | "NJCAA_DII"
  | "NJCAA_DIII";
export type SportGenderCategory = "mens" | "womens" | "coed";
export type SportSeason = "fall" | "winter" | "spring" | "year_round";
export type SchoolType = "public" | "private" | "community" | "tribal" | "military";
export type GuardianRelationship =
  | "mother"
  | "father"
  | "stepparent"
  | "grandparent"
  | "legal_guardian"
  | "sibling"
  | "other";
export type AthleteRecruitingStatus =
  | "exploring"
  | "actively_recruiting"
  | "committed"
  | "signed"
  | "enrolled"
  | "inactive";
export type ProfileVisibility =
  | "public"
  | "recruiters_only"
  | "connections_only"
  | "private";
export type CoachType = "high_school" | "club" | "college" | "private_trainer";
export type StatSource =
  | "self_reported"
  | "parent_reported"
  | "coach_verified"
  | "event_timed"
  | "third_party"
  | "imported";
export type VideoType =
  | "highlight"
  | "full_game"
  | "skills_session"
  | "training"
  | "interview"
  | "combine";
export type VideoStatus = "uploading" | "processing" | "ready" | "failed" | "archived";
export type MatchTier = "high_reach" | "reach" | "target" | "likely" | "safety";
export type OpportunityStatus = "draft" | "computed" | "stale" | "archived";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          locale: string;
          timezone: string;
          marketing_opt_in: boolean;
          onboarding_completed: boolean;
          last_active_at: string | null;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          locale?: string;
          timezone?: string;
          marketing_opt_in?: boolean;
          onboarding_completed?: boolean;
          last_active_at?: string | null;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      sports: {
        Row: {
          id: string;
          slug: string;
          name: string;
          display_name: string;
          gender_category: SportGenderCategory;
          season: SportSeason;
          ncaa_sponsored: boolean;
          naia_sponsored: boolean;
          njcaa_sponsored: boolean;
          is_team_sport: boolean;
          stat_schema: Json;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          display_name: string;
          gender_category: SportGenderCategory;
          season: SportSeason;
          ncaa_sponsored?: boolean;
          naia_sponsored?: boolean;
          njcaa_sponsored?: boolean;
          is_team_sport?: boolean;
          stat_schema?: Json;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sports"]["Insert"]>;
        Relationships: [];
      };
      schools: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_name: string | null;
          association: AthleticAssociation;
          school_type: SchoolType | null;
          city: string | null;
          state: string | null;
          region: string | null;
          country: string;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          website_url: string | null;
          logo_url: string | null;
          mascot: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          conference: string | null;
          enrollment_total: number | null;
          enrollment_undergrad: number | null;
          acceptance_rate: number | null;
          avg_gpa: number | null;
          sat_total_25: number | null;
          sat_total_75: number | null;
          act_composite_25: number | null;
          act_composite_75: number | null;
          graduation_rate: number | null;
          offered_majors: string[];
          tuition_in_state: number | null;
          tuition_out_state: number | null;
          room_and_board: number | null;
          cost_of_attendance: number | null;
          avg_financial_aid: number | null;
          avg_athletic_aid: number | null;
          description: string | null;
          embedding: string | null;
          metadata: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug?: string;
          name: string;
          short_name?: string | null;
          association: AthleticAssociation;
          school_type?: SchoolType | null;
          city?: string | null;
          state?: string | null;
          region?: string | null;
          country?: string;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          website_url?: string | null;
          logo_url?: string | null;
          mascot?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          conference?: string | null;
          enrollment_total?: number | null;
          enrollment_undergrad?: number | null;
          acceptance_rate?: number | null;
          avg_gpa?: number | null;
          sat_total_25?: number | null;
          sat_total_75?: number | null;
          act_composite_25?: number | null;
          act_composite_75?: number | null;
          graduation_rate?: number | null;
          offered_majors?: string[];
          tuition_in_state?: number | null;
          tuition_out_state?: number | null;
          room_and_board?: number | null;
          cost_of_attendance?: number | null;
          avg_financial_aid?: number | null;
          avg_athletic_aid?: number | null;
          description?: string | null;
          embedding?: string | null;
          metadata?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["schools"]["Insert"]>;
        Relationships: [];
      };
      school_sports: {
        Row: {
          id: string;
          school_id: string;
          sport_id: string;
          division: CompetitionDivision;
          conference: string | null;
          head_coach_id: string | null;
          recruiting_email: string | null;
          recruiting_phone: string | null;
          recruiting_url: string | null;
          is_recruiting_active: boolean;
          roster_size: number | null;
          is_scholarship_sport: boolean;
          scholarships_total: number | null;
          scholarships_available: number | null;
          avg_scholarship_amount: number | null;
          avg_recruit_gpa: number | null;
          position_needs: Json;
          recruiting_priorities: Json;
          recruit_benchmarks: Json;
          metadata: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          sport_id: string;
          division: CompetitionDivision;
          conference?: string | null;
          head_coach_id?: string | null;
          recruiting_email?: string | null;
          recruiting_phone?: string | null;
          recruiting_url?: string | null;
          is_recruiting_active?: boolean;
          roster_size?: number | null;
          is_scholarship_sport?: boolean;
          scholarships_total?: number | null;
          scholarships_available?: number | null;
          avg_scholarship_amount?: number | null;
          avg_recruit_gpa?: number | null;
          position_needs?: Json;
          recruiting_priorities?: Json;
          recruit_benchmarks?: Json;
          metadata?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["school_sports"]["Insert"]>;
        Relationships: [];
      };
      athlete_profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          date_of_birth: string | null;
          gender: Gender | null;
          height_cm: number | null;
          weight_kg: number | null;
          dominant_hand: string | null;
          graduation_year: number | null;
          gpa: number | null;
          sat_score: number | null;
          act_score: number | null;
          intended_major: string | null;
          ncaa_eligibility_id: string | null;
          hometown_city: string | null;
          home_state: string | null;
          home_country: string;
          current_school: string | null;
          recruiting_status: AthleteRecruitingStatus;
          committed_school_id: string | null;
          visibility: ProfileVisibility;
          is_verified: boolean;
          bio: string | null;
          goals: Json;
          preferences: Json;
          embedding: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          date_of_birth?: string | null;
          gender?: Gender | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          dominant_hand?: string | null;
          graduation_year?: number | null;
          gpa?: number | null;
          sat_score?: number | null;
          act_score?: number | null;
          intended_major?: string | null;
          ncaa_eligibility_id?: string | null;
          hometown_city?: string | null;
          home_state?: string | null;
          home_country?: string;
          current_school?: string | null;
          recruiting_status?: AthleteRecruitingStatus;
          committed_school_id?: string | null;
          visibility?: ProfileVisibility;
          is_verified?: boolean;
          bio?: string | null;
          goals?: Json;
          preferences?: Json;
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["athlete_profiles"]["Insert"]>;
        Relationships: [];
      };
      parent_profiles: {
        Row: {
          id: string;
          user_id: string;
          occupation: string | null;
          contact_phone: string | null;
          preferred_contact: string;
          notes: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          occupation?: string | null;
          contact_phone?: string | null;
          preferred_contact?: string;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["parent_profiles"]["Insert"]>;
        Relationships: [];
      };
      coach_profiles: {
        Row: {
          id: string;
          user_id: string;
          coach_type: CoachType;
          school_id: string | null;
          primary_sport_id: string | null;
          title: string | null;
          organization: string | null;
          years_experience: number | null;
          recruiting_regions: string[];
          recruiting_email: string | null;
          is_verified: boolean;
          verified_at: string | null;
          bio: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coach_type?: CoachType;
          school_id?: string | null;
          primary_sport_id?: string | null;
          title?: string | null;
          organization?: string | null;
          years_experience?: number | null;
          recruiting_regions?: string[];
          recruiting_email?: string | null;
          is_verified?: boolean;
          verified_at?: string | null;
          bio?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["coach_profiles"]["Insert"]>;
        Relationships: [];
      };
      athlete_sports: {
        Row: {
          id: string;
          athlete_profile_id: string;
          sport_id: string;
          is_primary: boolean;
          position: string | null;
          secondary_position: string | null;
          jersey_number: number | null;
          years_experience: number | null;
          club_team: string | null;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          athlete_profile_id: string;
          sport_id: string;
          is_primary?: boolean;
          position?: string | null;
          secondary_position?: string | null;
          jersey_number?: number | null;
          years_experience?: number | null;
          club_team?: string | null;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["athlete_sports"]["Insert"]>;
        Relationships: [];
      };
      athlete_guardians: {
        Row: {
          id: string;
          athlete_profile_id: string;
          parent_profile_id: string;
          relationship: GuardianRelationship;
          is_primary: boolean;
          can_manage: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          athlete_profile_id: string;
          parent_profile_id: string;
          relationship?: GuardianRelationship;
          is_primary?: boolean;
          can_manage?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["athlete_guardians"]["Insert"]>;
        Relationships: [];
      };
      athlete_stats: {
        Row: {
          id: string;
          athlete_profile_id: string;
          sport_id: string;
          metric_key: string;
          metric_value: number | null;
          metric_text: string | null;
          unit: string | null;
          percentile: number | null;
          season_year: number | null;
          competition_level: string | null;
          recorded_at: string | null;
          is_verified: boolean;
          verification_source: StatSource;
          verified_by: string | null;
          verified_at: string | null;
          context: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          athlete_profile_id: string;
          sport_id: string;
          metric_key: string;
          metric_value?: number | null;
          metric_text?: string | null;
          unit?: string | null;
          percentile?: number | null;
          season_year?: number | null;
          competition_level?: string | null;
          recorded_at?: string | null;
          is_verified?: boolean;
          verification_source?: StatSource;
          verified_by?: string | null;
          verified_at?: string | null;
          context?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["athlete_stats"]["Insert"]>;
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          athlete_profile_id: string;
          sport_id: string | null;
          title: string;
          description: string | null;
          video_type: VideoType;
          storage_bucket: string | null;
          storage_path: string | null;
          external_url: string | null;
          public_url: string | null;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          size_bytes: number | null;
          width: number | null;
          height: number | null;
          status: VideoStatus;
          is_public: boolean;
          is_featured: boolean;
          views_count: number;
          recorded_on: string | null;
          ai_analysis: Json;
          ai_tags: string[];
          embedding: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          athlete_profile_id: string;
          sport_id?: string | null;
          title: string;
          description?: string | null;
          video_type?: VideoType;
          storage_bucket?: string | null;
          storage_path?: string | null;
          external_url?: string | null;
          public_url?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          status?: VideoStatus;
          is_public?: boolean;
          is_featured?: boolean;
          views_count?: number;
          recorded_on?: string | null;
          ai_analysis?: Json;
          ai_tags?: string[];
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["videos"]["Insert"]>;
        Relationships: [];
      };
      opportunity_scores: {
        Row: {
          id: string;
          athlete_profile_id: string;
          school_id: string;
          sport_id: string;
          school_sport_id: string | null;
          overall_score: number;
          athletic_fit: number | null;
          academic_fit: number | null;
          roster_fit: number | null;
          major_fit: number | null;
          location_fit: number | null;
          program_level_fit: number | null;
          financial_fit: number | null;
          score_band: string;
          match_tier: MatchTier | null;
          confidence: number | null;
          scholarship_likelihood: number | null;
          projected_scholarship_amount: number | null;
          explanation: string | null;
          factors: Json;
          status: OpportunityStatus;
          model_version: string;
          computed_at: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          athlete_profile_id: string;
          school_id: string;
          sport_id: string;
          school_sport_id?: string | null;
          overall_score: number;
          athletic_fit?: number | null;
          academic_fit?: number | null;
          roster_fit?: number | null;
          major_fit?: number | null;
          location_fit?: number | null;
          program_level_fit?: number | null;
          financial_fit?: number | null;
          match_tier?: MatchTier | null;
          confidence?: number | null;
          scholarship_likelihood?: number | null;
          projected_scholarship_amount?: number | null;
          explanation?: string | null;
          factors?: Json;
          status?: OpportunityStatus;
          model_version?: string;
          computed_at?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["opportunity_scores"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: number;
          actor_user_id: string | null;
          actor_role: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          changes: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_user_id?: string | null;
          actor_role?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          changes?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
      search_logs: {
        Row: {
          id: number;
          user_id: string | null;
          search_type: string;
          query: string | null;
          filters: Json;
          result_count: number | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          search_type: string;
          query?: string | null;
          filters?: Json;
          result_count?: number | null;
          duration_ms?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["search_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      log_audit: {
        Args: {
          p_action: string;
          p_entity_type?: string | null;
          p_entity_id?: string | null;
          p_changes?: Json;
        };
        Returns: number;
      };
    };
    Enums: {
      user_role: UserRole;
      gender: Gender;
      athletic_association: AthleticAssociation;
      competition_division: CompetitionDivision;
      sport_gender_category: SportGenderCategory;
      sport_season: SportSeason;
      school_type: SchoolType;
      guardian_relationship: GuardianRelationship;
      athlete_recruiting_status: AthleteRecruitingStatus;
      profile_visibility: ProfileVisibility;
      coach_type: CoachType;
      stat_source: StatSource;
      video_type: VideoType;
      video_status: VideoStatus;
      match_tier: MatchTier;
      opportunity_status: OpportunityStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row aliases.
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
