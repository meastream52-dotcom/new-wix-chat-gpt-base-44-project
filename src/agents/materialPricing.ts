import { runAgent, extractJson } from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase/admin";
import { estimatePrint } from "@/lib/slicer";
import { baseCostCents, retailPriceCents, PRICING_CONFIG } from "@/lib/pricing";
import type { IntendedUse, Material, PrinterProfile, TierQuote } from "@/lib/types";

type TierSelection = {
  premium: { material: string; finishing: "premium"; rationale: string };
  standard: { material: string; finishing: "standard"; rationale: string };
  budget:
    | { material: string; finishing: "none"; rationale: string }
    | { unavailable: true; reason: string };
  intended_use_notes: string;
};

/**
 * Material & Pricing Agent.
 * Claude picks materials per tier against the intended-use constraints; the
 * actual grams/time come from the slicer (or geometric estimate) and the
 * price from the deterministic formula in lib/pricing.ts — never from the model.
 */
export async function runMaterialPricingAgent(opts: {
  productId: string;
  requestId: string | null;
  stl: Buffer | null;
  fallbackVolumeCm3: number | null; // used when no STL was rendered yet
  intendedUse: IntendedUse;
  partSummary: string;
}): Promise<TierQuote[]> {
  const supabase = createAdminClient();

  const [{ data: materials }, { data: printers }] = await Promise.all([
    supabase.from("materials").select("*").eq("in_stock", true),
    supabase.from("printer_profiles").select("*").eq("active", true).limit(1),
  ]);
  if (!materials?.length) throw new Error("no materials configured");
  const printer = printers?.[0] as PrinterProfile | undefined;
  if (!printer) throw new Error("no active printer profile");

  const system = `You are the Material & Pricing Agent for PrintForge, a 3D print farm. You select materials for three quality tiers. You do NOT set prices — pricing is computed elsewhere.

RULES:
- Respect intended use absolutely:
  - food_contact: only materials whose properties mark food_safe true; if none qualify, the relevant tiers are unavailable. Note any restrictions (e.g. nozzle requirements) in the rationale.
  - outdoor/UV: only uv_resistant materials.
  - heat_exposure: heat_resistance_c must be at least 80.
  - flex_needed: pick flexible materials.
- Premium tier: best-performing material for the use case + premium finishing (sanding, priming).
- Standard tier: solid match, standard finishing.
- Budget tier: the CHEAPEST material that still meets every safety/use requirement. Never go below requirements — if the cheapest compliant material is already used by standard, budget may be unavailable.
- Only choose from the provided materials list, and only materials this printer supports.

OUTPUT: exactly one JSON object in a \`\`\`json fence:
{
  "premium": {"material": "NAME", "finishing": "premium", "rationale": "..."},
  "standard": {"material": "NAME", "finishing": "standard", "rationale": "..."},
  "budget": {"material": "NAME", "finishing": "none", "rationale": "..."} or {"unavailable": true, "reason": "..."},
  "intended_use_notes": "..."
}`;

  const prompt = `Part: ${opts.partSummary}

Intended use: ${JSON.stringify(opts.intendedUse)}

Printer supports: ${printer.materials_supported.join(", ")}

Available materials:
${(materials as Material[])
  .map(
    (m) =>
      `- ${m.name}: $${(m.cost_per_kg_cents / 100).toFixed(2)}/kg, properties=${JSON.stringify(m.properties)}, restrictions=${JSON.stringify(m.restrictions)}`
  )
  .join("\n")}`;

  const text = await runAgent({
    agent: "material_pricing",
    system,
    prompt,
    input: { productId: opts.productId, intendedUse: opts.intendedUse },
    maxTokens: 6000,
  });
  const selection = extractJson<TierSelection>(text);

  const byName = new Map((materials as Material[]).map((m) => [m.name.toUpperCase(), m]));
  const quotes: TierQuote[] = [];

  for (const tier of ["premium", "standard", "budget"] as const) {
    const pick = selection[tier];
    if ("unavailable" in pick) {
      quotes.push({
        tier,
        material_name: "",
        available: false,
        unavailable_reason: pick.reason,
        finishing: "none",
        filament_g: 0,
        print_time_min: 0,
        price_cents: 0,
      });
      continue;
    }

    const material = byName.get(pick.material.toUpperCase());
    if (!material) {
      quotes.push({
        tier,
        material_name: pick.material,
        available: false,
        unavailable_reason: `agent picked unknown material "${pick.material}"`,
        finishing: pick.finishing,
        filament_g: 0,
        print_time_min: 0,
        price_cents: 0,
      });
      continue;
    }

    const est = opts.stl
      ? await estimatePrint(opts.stl, material.density_g_cm3)
      : fallbackEstimate(opts.fallbackVolumeCm3 ?? 50, material.density_g_cm3);

    const cost = baseCostCents({
      filamentG: est.filament_g,
      printTimeMin: est.print_time_min,
      material,
      printer,
      finishing: pick.finishing as keyof typeof PRICING_CONFIG.finishing_cents,
    });

    quotes.push({
      tier,
      material_name: material.name,
      available: true,
      unavailable_reason: null,
      finishing: pick.finishing,
      filament_g: est.filament_g,
      print_time_min: est.print_time_min,
      price_cents: retailPriceCents(cost),
    });
  }

  // Persist tiers on the product (replace any prior quotes).
  await supabase.from("product_tiers").delete().eq("product_id", opts.productId);
  const rows = quotes.map((q) => ({
    product_id: opts.productId,
    tier: q.tier,
    material_id: q.available ? (byName.get(q.material_name.toUpperCase())?.id ?? null) : null,
    price_cents: q.price_cents,
    print_time_min: q.print_time_min,
    filament_g: q.filament_g,
    finishing: q.finishing,
    available: q.available,
  }));
  const { error } = await supabase.from("product_tiers").insert(rows);
  if (error) throw new Error(`tier insert failed: ${error.message}`);

  return quotes;
}

function fallbackEstimate(volumeCm3: number, density: number) {
  const effectiveVolume = volumeCm3 * 0.35;
  return {
    filament_g: Math.round(effectiveVolume * density * 10) / 10,
    print_time_min: Math.max(10, Math.round((effectiveVolume / 10) * 60)),
    volume_cm3: volumeCm3,
    source: "geometric_estimate" as const,
  };
}
