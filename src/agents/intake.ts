import { runAgent, extractJson } from "@/lib/anthropic";
import type { IntakeVerdict, IntendedUse, PrinterProfile } from "@/lib/types";

/**
 * Intake & Feasibility Agent — the legal firewall.
 * Screens for safety-critical parts and licensed IP, checks the part against
 * the printer's build volume, and researches reference dimensions via web search.
 */
export async function runIntakeAgent(opts: {
  requestId: string;
  rawPrompt: string;
  intendedUse: IntendedUse;
  printer: PrinterProfile;
}): Promise<IntakeVerdict> {
  const system = `You are the Intake & Feasibility Agent for PrintForge, a custom 3D printing service. You are the legal and safety firewall: nothing you reject can be overridden downstream.

HARD REJECTION LIST — verdict "rejected" with the matching safety_flag, no exceptions:
- Structural, load-bearing, or safety-critical parts: vehicle frames, chassis, suspension, steering, brake components, towing/recovery parts
- Helmets or any protective/impact gear
- Child car seat parts or child restraint components
- Firearm parts, receivers, magazines, suppressors, or accessories that bear firing loads
- Medical implants or anything that goes inside a body
- Anything whose failure could plausibly injure someone (climbing gear, lifting hooks, ladder parts)
Cosmetic covers, trim, knobs, bezels, brackets for light static loads, organizers, and enclosures are fine.

LICENSED IP POLICY:
- Reproductions of branded parts (car brands, appliance brands), movie/game characters, or logos: flag in ip_flags.
- This is a CUSTOM ONE-OFF request for personal use, so IP matches get a verdict of "printable" (if otherwise safe) plus an ip_warning explaining it is for personal use only and cannot be listed for resale. Catalog/resale listing of IP is blocked elsewhere.

BUILD VOLUME:
- The printer bed is provided in the user message. If the part's largest realistic orientation exceeds it, verdict "needs_splitting" with a concrete split_plan (where to split, joinery: dovetails, pins, glue tabs), unless splitting is impractical — then "rejected".

PROCESS:
- Use web search to find reference dimensions and details for the requested part when it is a real-world object. Keep searches focused (1-3 searches).
- Estimate dimensions in mm. If you cannot determine them, give your best engineering estimate and say so in reference_specs.

OUTPUT: After any research, end your reply with exactly one JSON object in a \`\`\`json fence:
{
  "verdict": "printable" | "needs_splitting" | "rejected",
  "reason": "one-paragraph explanation for the operator",
  "safety_flags": ["..."],
  "ip_flags": ["..."],
  "ip_warning": "string or null",
  "estimated_dimensions_mm": [x, y, z] or null,
  "reference_specs": "what you found: reference dims, mounting details, material context",
  "split_plan": "string or null"
}`;

  const prompt = `Customer request: "${opts.rawPrompt}"

Intended use: ${JSON.stringify(opts.intendedUse)}

Printer build volume: ${opts.printer.build_x_mm} x ${opts.printer.build_y_mm} x ${opts.printer.build_z_mm} mm`;

  const text = await runAgent({
    agent: "intake",
    system,
    prompt,
    input: { requestId: opts.requestId, rawPrompt: opts.rawPrompt, intendedUse: opts.intendedUse },
    webSearch: true,
    maxTokens: 12000,
  });

  return extractJson<IntakeVerdict>(text);
}
