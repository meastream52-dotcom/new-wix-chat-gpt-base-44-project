/**
 * Athlete Opportunity Engine — Application/auth seed
 * ---------------------------------------------------------------------
 * Reference data (sports/schools/programs) is seeded via supabase/seed.sql.
 * This script seeds data that depends on Supabase Auth (auth.users) — it
 * creates demo accounts through the Admin API, which fires the
 * handle_new_user() trigger to create the matching public.users rows, then
 * fills in the role-specific profiles, sports, stats, videos and a sample
 * opportunity score.
 *
 * Run with the SERVICE ROLE key (bypasses RLS). NEVER ship this key to a
 * browser/client bundle.
 *
 *   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  npx tsx supabase/seed/seed_app_data.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Role = "athlete" | "parent" | "coach" | "admin";

async function ensureUser(email: string, password: string, role: Role, fullName: string) {
  // Idempotent: reuse the user if it already exists.
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name: fullName },
    app_metadata: { role },
  });

  if (created?.user) return created.user;

  if (error && !/already.*registered|exists/i.test(error.message)) throw error;

  // Look the existing user up by paging the admin list.
  for (let page = 1; page <= 20; page++) {
    const { data, error: listErr } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (listErr) throw listErr;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
  }
  throw new Error(`Could not create or find user ${email}`);
}

async function sportId(slug: string): Promise<string> {
  const { data, error } = await admin.from("sports").select("id").eq("slug", slug).single();
  if (error) throw error;
  return data.id;
}

async function schoolId(slug: string): Promise<string> {
  const { data, error } = await admin.from("schools").select("id").eq("slug", slug).single();
  if (error) throw error;
  return data.id;
}

async function main() {
  console.log("Seeding demo accounts via Auth Admin API…");

  const athlete = await ensureUser("jacob@aoe.dev", "Password123!", "athlete", "Jacob Smith");
  const parent = await ensureUser("jennifer@aoe.dev", "Password123!", "parent", "Jennifer Smith");
  const coach = await ensureUser("davis@aoe.dev", "Password123!", "coach", "Coach Davis");
  const adminUser = await ensureUser("admin@aoe.dev", "Password123!", "admin", "Platform Admin");
  console.log("Accounts ready:", { athlete: athlete.id, parent: parent.id, coach: coach.id, admin: adminUser.id });

  const football = await sportId("football");
  const gvsu = await schoolId("grand-valley-state-university-mi");

  // Athlete profile (PRD persona).
  const { data: ap, error: apErr } = await admin
    .from("athlete_profiles")
    .upsert(
      {
        user_id: athlete.id,
        first_name: "Jacob",
        last_name: "Smith",
        gender: "male",
        graduation_year: 2026,
        gpa: 3.4,
        height_cm: 187.96,
        weight_kg: 102.06,
        hometown_city: "Columbus",
        home_state: "OH",
        intended_major: "Kinesiology",
        recruiting_status: "actively_recruiting",
        visibility: "recruiters_only",
        goals: { target_divisions: ["NCAA_DII", "NCAA_DIII"], timeline: "fall_2026" },
        preferences: { max_distance_miles: 600, school_size: "medium" },
      },
      { onConflict: "user_id" }
    )
    .select("id")
    .single();
  if (apErr) throw apErr;
  const athleteProfileId = ap.id;

  // Parent profile + guardian link.
  const { data: pp, error: ppErr } = await admin
    .from("parent_profiles")
    .upsert({ user_id: parent.id, contact_phone: "+1 614 555 0101" }, { onConflict: "user_id" })
    .select("id")
    .single();
  if (ppErr) throw ppErr;

  await admin.from("athlete_guardians").upsert(
    {
      athlete_profile_id: athleteProfileId,
      parent_profile_id: pp.id,
      relationship: "mother",
      is_primary: true,
      can_manage: true,
    },
    { onConflict: "athlete_profile_id,parent_profile_id" }
  );

  // Coach profile.
  await admin
    .from("coach_profiles")
    .upsert(
      {
        user_id: coach.id,
        coach_type: "college",
        school_id: gvsu,
        primary_sport_id: football,
        title: "Defensive Coordinator",
        recruiting_regions: ["Midwest"],
      },
      { onConflict: "user_id" }
    );

  // Athlete sport (primary) + stats.
  await admin.from("athlete_sports").upsert(
    {
      athlete_profile_id: athleteProfileId,
      sport_id: football,
      is_primary: true,
      position: "LB",
      years_experience: 4,
    },
    { onConflict: "athlete_profile_id,sport_id" }
  );

  await admin.from("athlete_stats").insert([
    { athlete_profile_id: athleteProfileId, sport_id: football, metric_key: "forty_yard_dash", metric_value: 4.72, unit: "s", season_year: 2025, verification_source: "event_timed" },
    { athlete_profile_id: athleteProfileId, sport_id: football, metric_key: "vertical_jump", metric_value: 32.5, unit: "in", season_year: 2025 },
    { athlete_profile_id: athleteProfileId, sport_id: football, metric_key: "bench_press_reps", metric_value: 18, unit: "reps", season_year: 2025 },
  ]);

  // Sample highlight video.
  await admin.from("videos").insert({
    athlete_profile_id: athleteProfileId,
    sport_id: football,
    title: "Jacob Smith — 2025 Senior Highlights",
    video_type: "highlight",
    external_url: "https://www.hudl.com/video/demo",
    status: "ready",
    is_public: true,
  });

  // Sample opportunity score (engine output; service_role bypasses RLS).
  const { data: ss } = await admin
    .from("school_sports")
    .select("id")
    .eq("school_id", gvsu)
    .eq("sport_id", football)
    .single();

  await admin.from("opportunity_scores").upsert(
    {
      athlete_profile_id: athleteProfileId,
      school_id: gvsu,
      sport_id: football,
      school_sport_id: ss?.id ?? null,
      overall_score: 84.5,
      athletic_fit: 82,
      academic_fit: 88,
      roster_fit: 90,
      major_fit: 80,
      location_fit: 86,
      program_level_fit: 78,
      match_tier: "target",
      confidence: 76,
      model_version: "v1",
      explanation: "Strong roster opportunity at LB with academic fit above program average.",
      factors: { roster_need: "LB:high", gpa_delta: 0.3 },
    },
    { onConflict: "athlete_profile_id,school_id,sport_id" }
  );

  console.log("✅ App seed complete. Demo athlete profile:", athleteProfileId);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
