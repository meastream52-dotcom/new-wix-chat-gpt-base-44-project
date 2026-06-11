-- Default printer profile and materials catalog.
-- !! PLACEHOLDER COSTS — update hourly_rate_cents and cost_per_kg_cents with
-- your real numbers in the admin Config page or by editing this file.

insert into printer_profiles
  (name, build_x_mm, build_y_mm, build_z_mm, nozzle_mm, hourly_rate_cents, materials_supported)
values
  ('Primary FDM', 300, 300, 350, 0.4, 150, array['PLA','PETG','ABS','ASA','TPU','PA-CF']);

insert into materials (name, cost_per_kg_cents, density_g_cm3, properties, restrictions) values
  ('PLA', 2000, 1.24,
   '{"heat_resistance_c": 55, "uv_resistant": false, "flexible": false, "food_safe": false, "strength": "medium", "finish": "excellent"}',
   '{"no_outdoor": true, "no_heat": true, "no_food_contact": true}'),
  ('PETG', 2500, 1.27,
   '{"heat_resistance_c": 75, "uv_resistant": true, "flexible": false, "food_safe": true, "strength": "high", "finish": "good"}',
   '{"food_contact_note": "food-safe filament only when printed with stainless nozzle and sealed"}'),
  ('ABS', 2300, 1.04,
   '{"heat_resistance_c": 95, "uv_resistant": false, "flexible": false, "food_safe": false, "strength": "high", "finish": "good"}',
   '{"no_outdoor": true, "no_food_contact": true}'),
  ('ASA', 2900, 1.07,
   '{"heat_resistance_c": 93, "uv_resistant": true, "flexible": false, "food_safe": false, "strength": "high", "finish": "good"}',
   '{"no_food_contact": true}'),
  ('TPU', 3500, 1.21,
   '{"heat_resistance_c": 80, "uv_resistant": true, "flexible": true, "food_safe": false, "strength": "medium", "finish": "fair"}',
   '{"no_food_contact": true}'),
  ('PA-CF', 8000, 1.17,
   '{"heat_resistance_c": 150, "uv_resistant": true, "flexible": false, "food_safe": false, "strength": "very_high", "finish": "fair"}',
   '{"no_food_contact": true}');
