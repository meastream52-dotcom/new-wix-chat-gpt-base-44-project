export type UserRole = 'admin' | 'customer'

export interface Profile {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface PrinterProfile {
  id: string
  name: string
  build_volume_x_mm: number
  build_volume_y_mm: number
  build_volume_z_mm: number
  nozzle_diameter_mm: number
  supported_materials: string[]
  hourly_rate_usd: number
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MaterialProperties {
  tensile_strength_mpa: number
  heat_deflection_c: number
  is_flexible: boolean
  uv_resistant: boolean
  food_safe: boolean
}

export interface MaterialRestrictions {
  no_outdoor: boolean
  no_food_contact: boolean
  requires_enclosure: boolean
}

export interface Material {
  id: string
  name: string
  display_name: string
  cost_per_kg_usd: number
  properties: MaterialProperties
  restrictions: MaterialRestrictions
  color_hex: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type IntakeStatus = 'pending' | 'processing' | 'feasible' | 'needs_splitting' | 'rejected'
export type DesignStatus = 'pending' | 'processing' | 'complete' | 'failed'
export type PricingStatus = 'pending' | 'processing' | 'complete' | 'failed'
export type ListingStatus = 'pending' | 'processing' | 'complete' | 'failed'
export type PipelineStatus = 'submitted' | 'intake' | 'design' | 'pricing' | 'listing' | 'approved' | 'rejected' | 'fulfilled'

export interface IntakeVerdict {
  verdict: 'feasible' | 'needs_splitting' | 'rejected'
  reason: string
  safety_flags: string[]
  ip_flags: string[]
  ip_warning?: string
  reference_specs?: {
    estimated_dimensions_mm: { x: number; y: number; z: number }
    description: string
    notes: string
  }
  split_suggestion?: string
}

export interface PricingTierData {
  tier: 'premium' | 'standard' | 'budget'
  material_name: string
  material_id?: string
  price_usd: number
  print_time_hours: number
  filament_grams: number
  layer_height_mm: number
  infill_percent: number
  finishing_notes: string
  is_available: boolean
  unavailable_reason?: string
}

export interface PricingData {
  tiers: PricingTierData[]
  cost_breakdown: {
    filament_cost: number
    machine_time_cost: number
    labor_cost: number
    finishing_cost: number
  }
}

export interface CustomRequest {
  id: string
  customer_email: string
  raw_prompt: string
  intended_use: string | null
  reference_dimensions: { x: number; y: number; z: number; unit: string } | null
  intake_status: IntakeStatus
  intake_verdict: IntakeVerdict | null
  intake_agent_run_id: string | null
  design_status: DesignStatus
  stl_path: string | null
  render_paths: string[]
  openscad_script: string | null
  design_agent_run_id: string | null
  pricing_status: PricingStatus
  pricing_data: PricingData | null
  pricing_agent_run_id: string | null
  listing_status: ListingStatus
  listing_agent_run_id: string | null
  product_id: string | null
  pipeline_status: PipelineStatus
  created_at: string
  updated_at: string
}

export type ProductStatus = 'draft' | 'published' | 'archived'

export interface SpecSheet {
  dimensions_mm?: { x: number; y: number; z: number }
  weight_g?: number
  layer_height_mm?: number
  infill_percent?: number
  material_properties?: Partial<MaterialProperties>
}

export interface Product {
  id: string
  slug: string
  title: string
  description: string
  seo_description: string | null
  spec_sheet: SpecSheet | null
  status: ProductStatus
  source: 'custom' | 'catalog'
  custom_request_id: string | null
  stl_path: string | null
  render_paths: string[]
  marketing_notes: string | null
  approved_at: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
  tiers?: ProductTier[]
}

export interface ProductTier {
  id: string
  product_id: string
  tier: 'premium' | 'standard' | 'budget'
  material_id: string
  printer_profile_id: string
  price_usd: number
  print_time_hours: number
  filament_grams: number
  layer_height_mm: number | null
  infill_percent: number | null
  supports_needed: boolean
  finishing_notes: string | null
  is_available: boolean
  created_at: string
  material?: Material
  printer_profile?: PrinterProfile
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'
export type FulfillmentStatus = 'pending' | 'printing' | 'printed' | 'packed' | 'shipped' | 'delivered'

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface Order {
  id: string
  order_number: string
  channel: 'direct' | 'custom'
  customer_email: string
  customer_name: string | null
  shipping_address: ShippingAddress | null
  product_id: string | null
  product_tier_id: string | null
  quantity: number
  custom_request_id: string | null
  subtotal_usd: number
  shipping_usd: number
  total_usd: number
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  payment_status: PaymentStatus
  paid_at: string | null
  fulfillment_status: FulfillmentStatus
  tracking_number: string | null
  shipped_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  product?: Product
  product_tier?: ProductTier
}

export type AgentName = 'intake' | 'design' | 'material_pricing' | 'listing'
export type AgentRunStatus = 'pending' | 'running' | 'complete' | 'failed'

export interface AgentRun {
  id: string
  agent: AgentName
  custom_request_id: string | null
  product_id: string | null
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  error: string | null
  model: string
  input_tokens: number | null
  output_tokens: number | null
  cost_usd: number | null
  status: AgentRunStatus
  started_at: string
  completed_at: string | null
  created_at: string
}
