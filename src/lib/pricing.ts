import type { Material, PrinterProfile } from "@/lib/types";

/**
 * Price formula:
 *   (filament cost + machine time x hourly rate + labor + finishing) x margin
 *
 * Margin and labor are configurable here. The dropship channel (Phase 3)
 * locks the wholesale price to cost x DROPSHIP_MULTIPLIER.
 */
export const PRICING_CONFIG = {
  margin: 2.0, // retail margin multiplier
  labor_cents_flat: 300, // handling per part: plate prep, QC, packing
  finishing_cents: {
    none: 0,
    standard: 200, // support removal, light cleanup
    premium: 1200, // sanding + priming
  },
  minimum_price_cents: 800,
};

export const DROPSHIP_MULTIPLIER = 1.2; // Phase 3: wholesale = cost x 1.20

export function baseCostCents(opts: {
  filamentG: number;
  printTimeMin: number;
  material: Pick<Material, "cost_per_kg_cents">;
  printer: Pick<PrinterProfile, "hourly_rate_cents">;
  finishing: keyof typeof PRICING_CONFIG.finishing_cents;
}): number {
  const filamentCost = (opts.filamentG / 1000) * opts.material.cost_per_kg_cents;
  const machineCost = (opts.printTimeMin / 60) * opts.printer.hourly_rate_cents;
  return Math.round(
    filamentCost +
      machineCost +
      PRICING_CONFIG.labor_cents_flat +
      PRICING_CONFIG.finishing_cents[opts.finishing]
  );
}

export function retailPriceCents(costCents: number): number {
  return Math.max(
    Math.round(costCents * PRICING_CONFIG.margin),
    PRICING_CONFIG.minimum_price_cents
  );
}
