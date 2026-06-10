-- Seed default materials (PLA, PETG, ABS, ASA, TPU)
-- Update cost_per_kg_usd to match your actual filament costs

insert into public.materials (name, display_name, cost_per_kg_usd, properties, restrictions, color_hex) values
(
  'PLA',
  'PLA (Standard)',
  20.00,
  '{"tensile_strength_mpa": 50, "heat_deflection_c": 55, "is_flexible": false, "uv_resistant": false, "food_safe": false}',
  '{"no_outdoor": true, "no_food_contact": true, "requires_enclosure": false}',
  '#4A90D9'
),
(
  'PETG',
  'PETG',
  25.00,
  '{"tensile_strength_mpa": 53, "heat_deflection_c": 75, "is_flexible": false, "uv_resistant": true, "food_safe": false}',
  '{"no_outdoor": false, "no_food_contact": true, "requires_enclosure": false}',
  '#50C878'
),
(
  'ABS',
  'ABS',
  22.00,
  '{"tensile_strength_mpa": 40, "heat_deflection_c": 100, "is_flexible": false, "uv_resistant": false, "food_safe": false}',
  '{"no_outdoor": true, "no_food_contact": true, "requires_enclosure": true}',
  '#F5A623'
),
(
  'ASA',
  'ASA (UV-Resistant)',
  28.00,
  '{"tensile_strength_mpa": 47, "heat_deflection_c": 98, "is_flexible": false, "uv_resistant": true, "food_safe": false}',
  '{"no_outdoor": false, "no_food_contact": true, "requires_enclosure": true}',
  '#E84B3A'
),
(
  'TPU',
  'TPU (Flexible)',
  35.00,
  '{"tensile_strength_mpa": 40, "heat_deflection_c": 65, "is_flexible": true, "uv_resistant": false, "food_safe": false}',
  '{"no_outdoor": false, "no_food_contact": true, "requires_enclosure": false}',
  '#9B59B6'
);
