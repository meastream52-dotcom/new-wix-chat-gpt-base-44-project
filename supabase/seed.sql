-- =====================================================================
-- Athlete Opportunity Engine — Reference seed data
-- ---------------------------------------------------------------------
-- Idempotent seed of provider-independent reference data: the multi-sport
-- catalog, a representative cross-association school set, and their sport
-- programs. Safe to run repeatedly (ON CONFLICT upserts).
--
-- NOTE: User/profile data depends on Supabase Auth (auth.users) and is
-- seeded separately via the Admin API — see supabase/seed/README.md.
-- This file is wired to `supabase db reset` through supabase/config.toml.
-- =====================================================================

-- ----------------------------- sports --------------------------------
insert into public.sports
  (slug, name, display_name, gender_category, season,
   ncaa_sponsored, naia_sponsored, njcaa_sponsored, is_team_sport, sort_order, stat_schema)
values
  ('football',          'Football',        'Football',            'mens',   'fall',   true,  true,  true,  true,  10,
     '{"forty_yard_dash":{"unit":"s","label":"40-Yard Dash"},"bench_press_reps":{"unit":"reps","label":"225 Bench"},"vertical_jump":{"unit":"in","label":"Vertical"}}'),
  ('baseball',          'Baseball',        'Baseball',            'mens',   'spring', true,  true,  true,  true,  20,
     '{"exit_velocity":{"unit":"mph","label":"Exit Velocity"},"sixty_yard_dash":{"unit":"s","label":"60-Yard Dash"},"era":{"unit":"era","label":"ERA"}}'),
  ('softball',          'Softball',        'Softball',            'womens', 'spring', true,  true,  true,  true,  30,
     '{"exit_velocity":{"unit":"mph","label":"Exit Velocity"},"home_to_first":{"unit":"s","label":"Home to First"}}'),
  ('mens-basketball',   'Basketball',      'Men''s Basketball',   'mens',   'winter', true,  true,  true,  true,  40,
     '{"ppg":{"unit":"ppg","label":"Points/Game"},"rpg":{"unit":"rpg","label":"Rebounds/Game"},"apg":{"unit":"apg","label":"Assists/Game"}}'),
  ('womens-basketball', 'Basketball',      'Women''s Basketball', 'womens', 'winter', true,  true,  true,  true,  41,
     '{"ppg":{"unit":"ppg","label":"Points/Game"},"rpg":{"unit":"rpg","label":"Rebounds/Game"},"apg":{"unit":"apg","label":"Assists/Game"}}'),
  ('mens-soccer',       'Soccer',          'Men''s Soccer',       'mens',   'fall',   true,  true,  true,  true,  50, '{}'),
  ('womens-soccer',     'Soccer',          'Women''s Soccer',     'womens', 'fall',   true,  true,  true,  true,  51, '{}'),
  ('mens-volleyball',   'Volleyball',      'Men''s Volleyball',   'mens',   'winter', true,  true,  true,  true,  60, '{}'),
  ('womens-volleyball', 'Volleyball',      'Women''s Volleyball', 'womens', 'fall',   true,  true,  true,  true,  61, '{}'),
  ('wrestling',         'Wrestling',       'Wrestling',           'mens',   'winter', true,  true,  true,  true,  70, '{}'),
  ('mens-track-field',  'Track & Field',   'Men''s Track & Field','mens',   'spring', true,  true,  true,  false, 80,
     '{"100m":{"unit":"s","label":"100m"},"high_jump":{"unit":"m","label":"High Jump"}}'),
  ('womens-track-field','Track & Field',   'Women''s Track & Field','womens','spring',true,  true,  true,  false, 81,
     '{"100m":{"unit":"s","label":"100m"},"high_jump":{"unit":"m","label":"High Jump"}}'),
  ('mens-swimming',     'Swimming',        'Men''s Swimming',     'mens',   'winter', true,  true,  true,  false, 90, '{}'),
  ('womens-swimming',   'Swimming',        'Women''s Swimming',   'womens', 'winter', true,  true,  true,  false, 91, '{}'),
  ('mens-tennis',       'Tennis',          'Men''s Tennis',       'mens',   'spring', true,  true,  true,  false,100, '{}'),
  ('womens-tennis',     'Tennis',          'Women''s Tennis',     'womens', 'spring', true,  true,  true,  false,101, '{}'),
  ('mens-golf',         'Golf',            'Men''s Golf',         'mens',   'spring', true,  true,  true,  false,110, '{}'),
  ('womens-golf',       'Golf',            'Women''s Golf',       'womens', 'spring', true,  true,  true,  false,111, '{}'),
  ('mens-lacrosse',     'Lacrosse',        'Men''s Lacrosse',     'mens',   'spring', true,  true,  false, true, 120, '{}'),
  ('womens-lacrosse',   'Lacrosse',        'Women''s Lacrosse',   'womens', 'spring', true,  true,  false, true, 121, '{}')
on conflict (slug) do update set
  display_name    = excluded.display_name,
  gender_category = excluded.gender_category,
  season          = excluded.season,
  ncaa_sponsored  = excluded.ncaa_sponsored,
  naia_sponsored  = excluded.naia_sponsored,
  njcaa_sponsored = excluded.njcaa_sponsored,
  is_team_sport   = excluded.is_team_sport,
  sort_order      = excluded.sort_order,
  stat_schema     = excluded.stat_schema;

-- ---------------------------- schools --------------------------------
insert into public.schools
  (slug, name, short_name, association, school_type, city, state, region, conference,
   enrollment_total, acceptance_rate, avg_gpa, sat_total_25, sat_total_75,
   tuition_in_state, tuition_out_state, room_and_board, cost_of_attendance,
   offered_majors)
values
  ('university-of-alabama-al', 'University of Alabama', 'Alabama', 'NCAA', 'public',
     'Tuscaloosa', 'AL', 'Southeast', 'SEC',
     38000, 0.80, 3.71, 1080, 1320, 11100, 31000, 12000, 45000,
     array['Business','Engineering','Communications','Kinesiology','Biology']),
  ('stanford-university-ca', 'Stanford University', 'Stanford', 'NCAA', 'private',
     'Stanford', 'CA', 'West', 'ACC',
     17000, 0.04, 3.95, 1440, 1570, 56000, 56000, 18000, 82000,
     array['Computer Science','Engineering','Economics','Biology','Psychology']),
  ('grand-valley-state-university-mi', 'Grand Valley State University', 'GVSU', 'NCAA', 'public',
     'Allendale', 'MI', 'Midwest', 'GLIAC',
     22000, 0.83, 3.50, 1020, 1230, 13500, 19500, 10500, 31000,
     array['Business','Nursing','Education','Exercise Science','Engineering']),
  ('williams-college-ma', 'Williams College', 'Williams', 'NCAA', 'private',
     'Williamstown', 'MA', 'Northeast', 'NESCAC',
     2100, 0.08, 3.90, 1410, 1550, 61000, 61000, 16000, 79000,
     array['Economics','Political Science','Mathematics','Biology','English']),
  ('oklahoma-city-university-ok', 'Oklahoma City University', 'OCU', 'NAIA', 'private',
     'Oklahoma City', 'OK', 'South', 'SAC',
     2900, 0.62, 3.50, 1010, 1250, 28000, 28000, 11000, 41000,
     array['Business','Nursing','Performing Arts','Biology','Education']),
  ('indiana-tech-in', 'Indiana Institute of Technology', 'Indiana Tech', 'NAIA', 'private',
     'Fort Wayne', 'IN', 'Midwest', 'WHAC',
     8000, 0.57, 3.20, 940, 1150, 27000, 27000, 10500, 39000,
     array['Business','Engineering','Criminal Justice','Kinesiology']),
  ('iowa-western-community-college-ia', 'Iowa Western Community College', 'Iowa Western', 'NJCAA', 'community',
     'Council Bluffs', 'IA', 'Midwest', 'ICCAC',
     5500, 1.00, 3.00, null, null, 5500, 7500, 8000, 16000,
     array['Liberal Arts','Business','Nursing','Welding','Agriculture']),
  ('hutchinson-community-college-ks', 'Hutchinson Community College', 'HutchCC', 'NJCAA', 'community',
     'Hutchinson', 'KS', 'Midwest', 'KJCCC',
     5000, 1.00, 3.00, null, null, 3500, 5000, 7000, 13000,
     array['Liberal Arts','Business','Nursing','Automotive','Agriculture'])
on conflict (slug) do update set
  name               = excluded.name,
  short_name         = excluded.short_name,
  association        = excluded.association,
  school_type        = excluded.school_type,
  city               = excluded.city,
  state              = excluded.state,
  region             = excluded.region,
  conference         = excluded.conference,
  enrollment_total   = excluded.enrollment_total,
  acceptance_rate    = excluded.acceptance_rate,
  avg_gpa            = excluded.avg_gpa,
  sat_total_25       = excluded.sat_total_25,
  sat_total_75       = excluded.sat_total_75,
  tuition_in_state   = excluded.tuition_in_state,
  tuition_out_state  = excluded.tuition_out_state,
  room_and_board     = excluded.room_and_board,
  cost_of_attendance = excluded.cost_of_attendance,
  offered_majors     = excluded.offered_majors;

-- ------------------------- school_sports -----------------------------
-- (school_slug, sport_slug, division, conference, roster_size,
--  scholarships_total, avg_recruit_gpa, position_needs)
insert into public.school_sports
  (school_id, sport_id, division, conference, roster_size,
   is_scholarship_sport, scholarships_total, scholarships_available,
   avg_recruit_gpa, position_needs)
select s.id, sp.id, v.division::public.competition_division, v.conference, v.roster_size,
       v.is_scholarship_sport, v.scholarships_total, v.scholarships_available,
       v.avg_recruit_gpa, v.position_needs::jsonb
from (values
  ('university-of-alabama-al',          'football',          'NCAA_DI',   'SEC',    120, true,  85,    8,  3.20,
     '{"LB":{"need":2,"priority":"high"},"WR":{"need":3,"priority":"medium"}}'),
  ('university-of-alabama-al',          'womens-basketball', 'NCAA_DI',   'SEC',    15,  true,  15,    2,  3.40,
     '{"G":{"need":1,"priority":"high"}}'),
  ('stanford-university-ca',            'mens-soccer',       'NCAA_DI',   'ACC',    30,  true,  9.9,   2,  3.90,
     '{"MF":{"need":2,"priority":"medium"}}'),
  ('grand-valley-state-university-mi',  'football',          'NCAA_DII',  'GLIAC',  110, true,  36,    6,  3.10,
     '{"LB":{"need":3,"priority":"high"},"DB":{"need":2,"priority":"high"}}'),
  ('grand-valley-state-university-mi',  'womens-soccer',     'NCAA_DII',  'GLIAC',  28,  true,  9.9,   3,  3.50,
     '{"FW":{"need":2,"priority":"medium"}}'),
  ('williams-college-ma',              'mens-basketball',    'NCAA_DIII', 'NESCAC', 16,  false, 0,     0,  3.85,
     '{"F":{"need":1,"priority":"medium"}}'),
  ('williams-college-ma',              'womens-lacrosse',    'NCAA_DIII', 'NESCAC', 30,  false, 0,     0,  3.85,
     '{"M":{"need":3,"priority":"high"}}'),
  ('oklahoma-city-university-ok',      'baseball',           'NAIA',      'SAC',    40,  true,  12,    4,  3.10,
     '{"P":{"need":4,"priority":"high"},"OF":{"need":2,"priority":"medium"}}'),
  ('indiana-tech-in',                 'wrestling',           'NAIA',      'WHAC',   45,  true,  8,     5,  3.00,
     '{"125":{"need":1,"priority":"high"},"165":{"need":2,"priority":"high"}}'),
  ('iowa-western-community-college-ia','football',           'NJCAA_DI',  'ICCAC',  90,  true,  85,    20, 2.80,
     '{"OL":{"need":5,"priority":"high"},"DL":{"need":4,"priority":"high"}}'),
  ('hutchinson-community-college-ks',  'mens-basketball',    'NJCAA_DI',  'KJCCC',  16,  true,  15,    6,  2.90,
     '{"G":{"need":2,"priority":"high"}}')
) as v(school_slug, sport_slug, division, conference, roster_size,
       is_scholarship_sport, scholarships_total, scholarships_available,
       avg_recruit_gpa, position_needs)
join public.schools s on s.slug = v.school_slug
join public.sports  sp on sp.slug = v.sport_slug
on conflict (school_id, sport_id) do update set
  division              = excluded.division,
  conference            = excluded.conference,
  roster_size           = excluded.roster_size,
  is_scholarship_sport  = excluded.is_scholarship_sport,
  scholarships_total    = excluded.scholarships_total,
  scholarships_available= excluded.scholarships_available,
  avg_recruit_gpa       = excluded.avg_recruit_gpa,
  position_needs        = excluded.position_needs;
