export type IntendedUse = {
  environment: "indoor" | "outdoor";
  heat_exposure: boolean;
  flex_needed: boolean;
  food_contact: boolean;
  cosmetic_only: boolean;
};

export type IntakeVerdict = {
  verdict: "printable" | "needs_splitting" | "rejected";
  reason: string;
  safety_flags: string[];
  ip_flags: string[];
  ip_warning: string | null;
  estimated_dimensions_mm: [number, number, number] | null;
  reference_specs: string;
  split_plan: string | null;
};

export type DesignResult = {
  scad_path: string | null;
  stl_path: string | null;
  design_notes: string;
  dimensions_mm: [number, number, number];
};

export type TierQuote = {
  tier: "premium" | "standard" | "budget";
  material_name: string;
  available: boolean;
  unavailable_reason: string | null;
  finishing: string;
  filament_g: number;
  print_time_min: number;
  price_cents: number;
};

export type Material = {
  id: string;
  name: string;
  cost_per_kg_cents: number;
  density_g_cm3: number;
  properties: Record<string, unknown>;
  restrictions: Record<string, unknown>;
  in_stock: boolean;
};

export type PrinterProfile = {
  id: string;
  name: string;
  build_x_mm: number;
  build_y_mm: number;
  build_z_mm: number;
  nozzle_mm: number;
  hourly_rate_cents: number;
  materials_supported: string[];
  active: boolean;
};

export type Listing = {
  title: string;
  slug: string;
  description: string;
  spec_sheet: Record<string, unknown>;
};
