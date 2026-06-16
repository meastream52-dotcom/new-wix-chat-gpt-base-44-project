-- Athlete Opportunity Engine — Seed Data
-- Run: psql $DATABASE_URL -f supabase/seed.sql
-- NOTE: Supabase auth users must be created via the Auth API;
--       this file seeds only public-schema rows for dev/demo purposes.

-- ─── Schools ──────────────────────────────────────────────────────────────────

INSERT INTO public.schools
  (id, name, slug, division, conference, state, city, website_url,
   enrollment, acceptance_rate, avg_gpa, avg_sat, avg_act,
   tuition_in_state, tuition_out_state)
VALUES
  (
    'sch-00000001-0000-0000-0000-000000000001',
    'University of Alabama',
    'university-of-alabama',
    'NCAA_D1', 'SEC', 'AL', 'Tuscaloosa',
    'https://www.ua.edu',
    38000, 80.7, 3.72, 1215, 27,
    11620, 30250
  ),
  (
    'sch-00000001-0000-0000-0000-000000000002',
    'Liberty University',
    'liberty-university',
    'NCAA_D1', 'Big South', 'VA', 'Lynchburg',
    'https://www.liberty.edu',
    110000, 99.0, 3.51, 1120, 25,
    24000, 24000
  ),
  (
    'sch-00000001-0000-0000-0000-000000000003',
    'William & Mary',
    'william-and-mary',
    'NCAA_D1', 'CAA', 'VA', 'Williamsburg',
    'https://www.wm.edu',
    9600, 37.0, 4.10, 1380, 32,
    16172, 38748
  ),
  (
    'sch-00000001-0000-0000-0000-000000000004',
    'Indiana Wesleyan University',
    'indiana-wesleyan',
    'NAIA', 'Crossroads League', 'IN', 'Marion',
    'https://www.indwes.edu',
    3200, 73.0, 3.48, 1090, 24,
    29950, 29950
  ),
  (
    'sch-00000001-0000-0000-0000-000000000005',
    'Cedarville University',
    'cedarville-university',
    'NCAA_D2', 'GMAC', 'OH', 'Cedarville',
    'https://www.cedarville.edu',
    4400, 69.0, 3.60, 1180, 27,
    32550, 32550
  ),
  (
    'sch-00000001-0000-0000-0000-000000000006',
    'Kilgore College',
    'kilgore-college',
    'NJCAA', 'NJCAA Region XIV', 'TX', 'Kilgore',
    'https://www.kilgore.edu',
    5800, 100.0, 2.80, NULL, NULL,
    3180, 5490
  ),
  (
    'sch-00000001-0000-0000-0000-000000000007',
    'University of Texas at Austin',
    'ut-austin',
    'NCAA_D1', 'Big 12', 'TX', 'Austin',
    'https://www.utexas.edu',
    51000, 31.0, 3.80, 1310, 30,
    11988, 40996
  ),
  (
    'sch-00000001-0000-0000-0000-000000000008',
    'Grand Canyon University',
    'grand-canyon-university',
    'NCAA_D1', 'WAC', 'AZ', 'Phoenix',
    'https://www.gcu.edu',
    27000, 87.0, 3.42, 1100, 23,
    17050, 17050
  )
ON CONFLICT (slug) DO NOTHING;

-- ─── School sports ────────────────────────────────────────────────────────────

INSERT INTO public.school_sports
  (school_id, sport, gender, scholarships_total, scholarships_remaining,
   head_coach_name, head_coach_email, roster_size,
   typical_positions_needed, min_gpa, recruiting_active)
VALUES
  -- Alabama Football
  (
    'sch-00000001-0000-0000-0000-000000000001',
    'Football', 'M', 85, 6,
    'Kalen DeBoer', 'kdeboer@ua.edu', 110,
    ARRAY['QB','WR','CB','OL','LB'], 2.50, TRUE
  ),
  -- Alabama Basketball (M)
  (
    'sch-00000001-0000-0000-0000-000000000001',
    'Basketball', 'M', 13, 2,
    'Nate Oats', 'noats@ua.edu', 15,
    ARRAY['PG','SG','SF'], 2.50, TRUE
  ),
  -- Alabama Soccer (F)
  (
    'sch-00000001-0000-0000-0000-000000000001',
    'Soccer', 'F', 14, 3,
    'Wes Hart', 'whart@ua.edu', 28,
    ARRAY['GK','CB','CM','FW'], 2.50, TRUE
  ),
  -- Liberty Football
  (
    'sch-00000001-0000-0000-0000-000000000002',
    'Football', 'M', 63, 12,
    'Jamey Chadwell', 'jchadwell@liberty.edu', 105,
    ARRAY['QB','RB','WR','OL','DE','LB','CB'], 2.00, TRUE
  ),
  -- Liberty Basketball (M)
  (
    'sch-00000001-0000-0000-0000-000000000002',
    'Basketball', 'M', 13, 4,
    'Ritchie McKay', 'rmckay@liberty.edu', 14,
    ARRAY['PG','C','PF'], 2.00, TRUE
  ),
  -- William & Mary Football
  (
    'sch-00000001-0000-0000-0000-000000000003',
    'Football', 'M', 63, 8,
    'Mike London', 'mlondon@wm.edu', 95,
    ARRAY['QB','TE','OL','DE','LB'], 2.70, TRUE
  ),
  -- William & Mary Soccer (F)
  (
    'sch-00000001-0000-0000-0000-000000000003',
    'Soccer', 'F', 14, 5,
    'John Daly', 'jdaly@wm.edu', 24,
    ARRAY['GK','CB','CM','FW'], 3.00, TRUE
  ),
  -- IWU Basketball (M)
  (
    'sch-00000001-0000-0000-0000-000000000004',
    'Basketball', 'M', 11, 5,
    'Steve Brooks', 'sbrooks@indwes.edu', 16,
    ARRAY['PG','SG','SF','PF'], 2.30, TRUE
  ),
  -- IWU Soccer (F)
  (
    'sch-00000001-0000-0000-0000-000000000004',
    'Soccer', 'F', 12, 6,
    'Kelly Wallace', 'kwallace@indwes.edu', 22,
    ARRAY['GK','CB','CM','FW'], 2.30, TRUE
  ),
  -- Cedarville Basketball (M)
  (
    'sch-00000001-0000-0000-0000-000000000005',
    'Basketball', 'M', 10, 3,
    'Pat Estepp', 'pestepp@cedarville.edu', 15,
    ARRAY['PG','SG','C'], 2.60, TRUE
  ),
  -- Cedarville Soccer (F)
  (
    'sch-00000001-0000-0000-0000-000000000005',
    'Soccer', 'F', 12, 4,
    'Brett Faro', 'bfaro@cedarville.edu', 24,
    ARRAY['CB','CM','FW'], 2.60, TRUE
  ),
  -- Kilgore Football
  (
    'sch-00000001-0000-0000-0000-000000000006',
    'Football', 'M', 55, 18,
    'Cody McEntyre', 'cmcentyre@kilgore.edu', 88,
    ARRAY['QB','RB','WR','OL','DL','LB','DB'], 2.00, TRUE
  ),
  -- Kilgore Basketball (M)
  (
    'sch-00000001-0000-0000-0000-000000000006',
    'Basketball', 'M', 15, 8,
    'Brian Anglin', 'banglin@kilgore.edu', 16,
    ARRAY['PG','SG','SF','PF','C'], 2.00, TRUE
  ),
  -- UT Austin Football
  (
    'sch-00000001-0000-0000-0000-000000000007',
    'Football', 'M', 85, 4,
    'Steve Sarkisian', 'ssarkisian@utexas.edu', 115,
    ARRAY['QB','WR','CB','OL'], 2.50, TRUE
  ),
  -- UT Austin Basketball (M)
  (
    'sch-00000001-0000-0000-0000-000000000007',
    'Basketball', 'M', 13, 1,
    'Rodney Terry', 'rterry@utexas.edu', 13,
    ARRAY['PG','SG'], 2.50, TRUE
  ),
  -- UT Austin Soccer (F)
  (
    'sch-00000001-0000-0000-0000-000000000007',
    'Soccer', 'F', 14, 3,
    'Angela Kelly', 'akelly@utexas.edu', 28,
    ARRAY['GK','CM','FW'], 2.50, TRUE
  ),
  -- GCU Basketball (M)
  (
    'sch-00000001-0000-0000-0000-000000000008',
    'Basketball', 'M', 13, 4,
    'Bryce Drew', 'bdrew@gcu.edu', 14,
    ARRAY['PG','SG','PF'], 2.30, TRUE
  ),
  -- GCU Soccer (F)
  (
    'sch-00000001-0000-0000-0000-000000000008',
    'Soccer', 'F', 14, 5,
    'Laura Whinnem', 'lwhinnem@gcu.edu', 26,
    ARRAY['GK','CB','CM','FW'], 2.30, TRUE
  )
ON CONFLICT (school_id, sport, gender) DO NOTHING;

-- ─── Demo athletes (no auth.users — use API to register real users) ───────────
-- These rows represent profiles that can be linked after real user creation.
-- Insert them only if a demo user already exists; otherwise skip.

-- NOTE: In production use npm run seed:athletes or POST /api/athletes after
--       registering users through Supabase Auth. The rows below are commented out
--       because they require valid auth.users UUIDs which are only known after signup.

/*
  After registering three demo users via POST /api/auth/register you can run:

  UPDATE public.users SET role = 'athlete' WHERE email IN (
    'marcus@demo.local', 'sofia@demo.local', 'derek@demo.local'
  );

  Then POST /api/athletes for each to create profiles with stats and videos.
  See scripts/seed-athletes.ts for the automated version.
*/
