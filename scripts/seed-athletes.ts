/**
 * Demo athlete seeder for the Athlete Opportunity Engine.
 *
 * Run after `supabase/seed.sql` has been applied:
 *   npx tsx scripts/seed-athletes.ts
 *
 * Requires environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

interface DemoAthlete {
  email: string;
  password: string;
  profile: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    graduation_year: number;
    sport: string;
    position: string;
    height_inches: number;
    weight_lbs: number;
    gpa: number;
    sat_score: number;
    act_score: number;
    state: string;
    city: string;
    bio: string;
    preferred_divisions: string[];
    preferred_states: string[];
    intended_major: string;
  };
  stats: Array<{
    season: string;
    sport: string;
    stat_key: string;
    stat_value: number;
    unit: string;
  }>;
  videos: Array<{
    title: string;
    url: string;
    platform: string;
    highlight_type: string;
    is_primary: boolean;
    duration_seconds: number;
  }>;
}

const demoAthletes: DemoAthlete[] = [
  {
    email: 'marcus.johnson@demo.local',
    password: 'DemoPass123!',
    profile: {
      first_name: 'Marcus',
      last_name: 'Johnson',
      date_of_birth: '2007-03-14',
      graduation_year: 2025,
      sport: 'Football',
      position: 'QB',
      height_inches: 75,
      weight_lbs: 218,
      gpa: 3.82,
      sat_score: 1240,
      act_score: 28,
      state: 'GA',
      city: 'Atlanta',
      bio: 'Three-year starter at Westside High School with a 68% completion rate and 3,200 passing yards junior year. Team captain with strong leadership in the locker room and classroom.',
      preferred_divisions: ['NCAA_D1', 'NCAA_D2'],
      preferred_states: ['GA', 'AL', 'FL', 'TN', 'VA'],
      intended_major: 'Business Administration',
    },
    stats: [
      { season: '2024', sport: 'Football', stat_key: 'passing_yards', stat_value: 3210, unit: 'yards' },
      { season: '2024', sport: 'Football', stat_key: 'touchdowns', stat_value: 32, unit: 'TDs' },
      { season: '2024', sport: 'Football', stat_key: 'interceptions', stat_value: 6, unit: 'INTs' },
      { season: '2024', sport: 'Football', stat_key: 'completion_pct', stat_value: 68.4, unit: '%' },
      { season: '2024', sport: 'Football', stat_key: 'rushing_yards', stat_value: 540, unit: 'yards' },
      { season: '2023', sport: 'Football', stat_key: 'passing_yards', stat_value: 2180, unit: 'yards' },
      { season: '2023', sport: 'Football', stat_key: 'touchdowns', stat_value: 21, unit: 'TDs' },
      { season: '2023', sport: 'Football', stat_key: 'completion_pct', stat_value: 63.1, unit: '%' },
    ],
    videos: [
      {
        title: 'Marcus Johnson — Junior Year Highlights 2024',
        url: 'https://www.hudl.com/video/3/12345678/marcus-johnson-2024',
        platform: 'hudl',
        highlight_type: 'highlight_reel',
        is_primary: true,
        duration_seconds: 302,
      },
      {
        title: 'State Championship Game Film — Oct 2024',
        url: 'https://www.hudl.com/video/3/12345679/state-champ-film',
        platform: 'hudl',
        highlight_type: 'game_film',
        is_primary: false,
        duration_seconds: 7200,
      },
    ],
  },
  {
    email: 'sofia.chen@demo.local',
    password: 'DemoPass123!',
    profile: {
      first_name: 'Sofia',
      last_name: 'Chen',
      date_of_birth: '2007-09-22',
      graduation_year: 2025,
      sport: 'Soccer',
      position: 'CM',
      height_inches: 65,
      weight_lbs: 140,
      gpa: 3.94,
      sat_score: 1430,
      act_score: 33,
      state: 'CA',
      city: 'San Jose',
      bio: 'Central midfielder with exceptional vision and a 94% pass completion rate. ODP State Pool participant and ECNL Regional Finalist. Academic all-state selection.',
      preferred_divisions: ['NCAA_D1', 'NCAA_D2', 'NCAA_D3'],
      preferred_states: ['CA', 'TX', 'OR', 'WA', 'VA'],
      intended_major: 'Pre-Medicine',
    },
    stats: [
      { season: '2024', sport: 'Soccer', stat_key: 'goals', stat_value: 14, unit: 'goals' },
      { season: '2024', sport: 'Soccer', stat_key: 'assists', stat_value: 22, unit: 'assists' },
      { season: '2024', sport: 'Soccer', stat_key: 'games_played', stat_value: 28, unit: 'games' },
      { season: '2024', sport: 'Soccer', stat_key: 'pass_completion_pct', stat_value: 94.1, unit: '%' },
      { season: '2024', sport: 'Soccer', stat_key: 'shots_on_goal', stat_value: 42, unit: 'shots' },
      { season: '2023', sport: 'Soccer', stat_key: 'goals', stat_value: 10, unit: 'goals' },
      { season: '2023', sport: 'Soccer', stat_key: 'assists', stat_value: 18, unit: 'assists' },
    ],
    videos: [
      {
        title: 'Sofia Chen — Class of 2025 Soccer Highlights',
        url: 'https://www.hudl.com/video/3/22345678/sofia-chen-2025',
        platform: 'hudl',
        highlight_type: 'highlight_reel',
        is_primary: true,
        duration_seconds: 278,
      },
      {
        title: 'ECNL Regionals Skill Showcase',
        url: 'https://www.youtube.com/watch?v=demosofia123',
        platform: 'youtube',
        highlight_type: 'skill',
        is_primary: false,
        duration_seconds: 185,
      },
    ],
  },
  {
    email: 'derek.williams@demo.local',
    password: 'DemoPass123!',
    profile: {
      first_name: 'Derek',
      last_name: 'Williams',
      date_of_birth: '2008-01-05',
      graduation_year: 2026,
      sport: 'Basketball',
      position: 'PG',
      height_inches: 73,
      weight_lbs: 185,
      gpa: 3.15,
      sat_score: 1090,
      act_score: 24,
      state: 'TX',
      city: 'Houston',
      bio: 'Point guard with elite court vision and clutch performance. Led team to regional finals junior season averaging 18.4 PPG and 7.2 APG.',
      preferred_divisions: ['NCAA_D1', 'NCAA_D2', 'NAIA', 'JUCO'],
      preferred_states: ['TX', 'LA', 'OK', 'AR'],
      intended_major: 'Sports Management',
    },
    stats: [
      { season: '2024-25', sport: 'Basketball', stat_key: 'points_per_game', stat_value: 18.4, unit: 'PPG' },
      { season: '2024-25', sport: 'Basketball', stat_key: 'assists_per_game', stat_value: 7.2, unit: 'APG' },
      { season: '2024-25', sport: 'Basketball', stat_key: 'rebounds_per_game', stat_value: 4.1, unit: 'RPG' },
      { season: '2024-25', sport: 'Basketball', stat_key: 'steals_per_game', stat_value: 2.3, unit: 'SPG' },
      { season: '2024-25', sport: 'Basketball', stat_key: 'field_goal_pct', stat_value: 48.2, unit: '%' },
      { season: '2024-25', sport: 'Basketball', stat_key: 'three_point_pct', stat_value: 38.5, unit: '%' },
      { season: '2023-24', sport: 'Basketball', stat_key: 'points_per_game', stat_value: 14.2, unit: 'PPG' },
      { season: '2023-24', sport: 'Basketball', stat_key: 'assists_per_game', stat_value: 5.8, unit: 'APG' },
    ],
    videos: [
      {
        title: 'Derek Williams — Class of 2026 Highlights',
        url: 'https://www.hudl.com/video/3/32345678/derek-williams-2026',
        platform: 'hudl',
        highlight_type: 'highlight_reel',
        is_primary: true,
        duration_seconds: 255,
      },
    ],
  },
];

async function seed() {
  console.log('Seeding demo athletes...\n');

  for (const demo of demoAthletes) {
    console.log(`Creating user: ${demo.email}`);

    // Create auth user
    const { data: authData, error: authErr } =
      await supabase.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: {
          role: 'athlete',
          first_name: demo.profile.first_name,
          last_name: demo.profile.last_name,
        },
      });

    if (authErr) {
      if (authErr.message.includes('already been registered')) {
        console.log(`  ↳ User already exists, skipping.`);
        continue;
      }
      console.error(`  ✗ Auth error: ${authErr.message}`);
      continue;
    }

    const userId = authData.user!.id;

    // The trigger should have created public.users; give it a moment
    await new Promise((r) => setTimeout(r, 500));

    // Create athlete profile
    const { data: profile, error: profErr } = await supabase
      .from('athlete_profiles')
      .insert({ user_id: userId, ...demo.profile })
      .select()
      .single();

    if (profErr) {
      console.error(`  ✗ Profile error: ${profErr.message}`);
      continue;
    }

    const athleteId = (profile as { id: string }).id;

    // Create stats
    const statsRows = demo.stats.map((s) => ({
      athlete_id: athleteId,
      season: s.season,
      sport: s.sport,
      stat_key: s.stat_key,
      stat_value: s.stat_value,
      unit: s.unit,
    }));

    const { error: statsErr } = await supabase
      .from('athlete_stats')
      .upsert(statsRows, { onConflict: 'athlete_id,season,sport,stat_key' });

    if (statsErr) {
      console.error(`  ✗ Stats error: ${statsErr.message}`);
    }

    // Create videos
    for (const v of demo.videos) {
      const { error: vidErr } = await supabase.from('videos').insert({
        athlete_id: athleteId,
        title: v.title,
        url: v.url,
        platform: v.platform,
        highlight_type: v.highlight_type,
        is_primary: v.is_primary,
        duration_seconds: v.duration_seconds,
      });

      if (vidErr) {
        console.error(`  ✗ Video error: ${vidErr.message}`);
      }
    }

    console.log(`  ✓ ${demo.profile.first_name} ${demo.profile.last_name} (${athleteId})`);
    console.log(`    Sport: ${demo.profile.sport} | GPA: ${demo.profile.gpa} | ${demo.stats.length} stats | ${demo.videos.length} videos`);
  }

  console.log('\nSeed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
