import { runAgent, extractJson } from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Listing, TierQuote } from "@/lib/types";

/**
 * Listing Agent — writes the storefront copy and spec sheet, saved as a DRAFT
 * product. Publishing is always a manual operator action (approval gate).
 * If the source request carried IP flags, the listing is refused: IP items are
 * one-off personal-use only and never go to the catalog.
 */
export async function runListingAgent(opts: {
  productId: string;
  partSummary: string;
  designNotes: string;
  dimensionsMm: [number, number, number];
  tiers: TierQuote[];
  ipFlags: string[];
}): Promise<Listing> {
  if (opts.ipFlags.length > 0) {
    throw new Error(
      `listing blocked: request carries IP flags (${opts.ipFlags.join(", ")}). ` +
        "IP-flagged parts are one-off personal-use orders and cannot be listed for resale."
    );
  }

  const system = `You are the Listing Agent for PrintForge, a 3D printing storefront. Write the product listing.

RULES:
- Title: concrete and searchable, under 70 chars. No hype words.
- Description: 2-4 short paragraphs. What it is, what it fits/does, material tier guidance, what's included. Honest about FDM finish.
- Never claim load-bearing capability, safety certification, or OEM equivalence.
- slug: lowercase-kebab-case from the title.
- spec_sheet: dimensions, weight range across tiers, materials by tier, layer height, care notes.

OUTPUT: exactly one JSON object in a \`\`\`json fence:
{"title": "...", "slug": "...", "description": "...", "spec_sheet": {...}}`;

  const prompt = `Part: ${opts.partSummary}
Design notes: ${opts.designNotes}
Dimensions (mm): ${opts.dimensionsMm.join(" x ")}
Tiers:
${opts.tiers
  .map((t) =>
    t.available
      ? `- ${t.tier}: ${t.material_name}, finishing=${t.finishing}, ~${t.filament_g}g, $${(t.price_cents / 100).toFixed(2)}`
      : `- ${t.tier}: unavailable (${t.unavailable_reason})`
  )
  .join("\n")}`;

  const text = await runAgent({
    agent: "listing",
    system,
    prompt,
    input: { productId: opts.productId },
    maxTokens: 4000,
  });
  const listing = extractJson<Listing>(text);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({
      title: listing.title,
      slug: `${listing.slug}-${opts.productId.slice(0, 6)}`,
      description: listing.description,
      spec_sheet: listing.spec_sheet,
      status: "draft", // operator publishes from the admin dashboard
      updated_at: new Date().toISOString(),
    })
    .eq("id", opts.productId);
  if (error) throw new Error(`product update failed: ${error.message}`);

  return listing;
}
