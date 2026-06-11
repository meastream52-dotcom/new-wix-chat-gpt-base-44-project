import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { runAgent } from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase/admin";
import { stlBoundsMm } from "@/lib/slicer";
import type { DesignResult, IntakeVerdict } from "@/lib/types";

const execFileAsync = promisify(execFile);

/**
 * Design Agent — Phase 1 path: parametric OpenSCAD generation with one
 * self-critique pass, rendered to STL via the openscad CLI when OPENSCAD_PATH
 * is set. The Fusion 360 MCP path (model -> screenshot -> critique loop) is a
 * Phase 1.5 upgrade; this module is its integration point.
 */
export async function runDesignAgent(opts: {
  requestId: string;
  rawPrompt: string;
  verdict: IntakeVerdict;
}): Promise<DesignResult> {
  const system = `You are the Design Agent for PrintForge. You produce parametric OpenSCAD code for FDM-printable parts.

RULES:
- Output a complete, self-contained .scad program. All dimensions as named parameters at the top, in mm.
- Design for FDM: minimum wall 1.6mm, avoid steep unsupported overhangs (>50 deg) where possible, add chamfers on bed-contact edges.
- Honor the approved spec and reference dimensions exactly. Do not exceed the dimensions in the spec.
- Use $fn=96 for visible curves.
- Reply with ONLY the OpenSCAD code in a \`\`\`scad fence, preceded by at most 3 sentences of design notes.`;

  const designPrompt = `Approved request: "${opts.rawPrompt}"

Reference specs from intake: ${opts.verdict.reference_specs}
Target dimensions (mm): ${JSON.stringify(opts.verdict.estimated_dimensions_mm)}
${opts.verdict.split_plan ? `Split plan: ${opts.verdict.split_plan}` : ""}

Write the OpenSCAD program.`;

  const first = await runAgent({
    agent: "design",
    system,
    prompt: designPrompt,
    input: { requestId: opts.requestId, stage: "initial" },
    maxTokens: 16000,
  });

  // Self-critique pass: model reviews its own code against the spec and revises.
  const critique = await runAgent({
    agent: "design",
    system,
    prompt: `${designPrompt}

Here is a draft program:

${first}

Critique this draft against the spec (dimensions, printability, missing features), then output the corrected final program. Same output format.`,
    input: { requestId: opts.requestId, stage: "revise" },
    maxTokens: 16000,
  });

  const scad = extractScad(critique) ?? extractScad(first);
  if (!scad) throw new Error("design agent did not return OpenSCAD code");
  const notes = critique.split("```")[0].trim().slice(0, 2000);

  const supabase = createAdminClient();
  const scadPath = `requests/${opts.requestId}/part.scad`;
  await uploadOrThrow(supabase, scadPath, Buffer.from(scad), "text/plain");

  // Render STL if the openscad binary is available; otherwise the operator
  // exports manually (or via Fusion) and uploads to the same folder.
  let stlPath: string | null = null;
  let dims: [number, number, number] =
    opts.verdict.estimated_dimensions_mm ?? [0, 0, 0];

  if (process.env.OPENSCAD_PATH) {
    const stl = await renderScadToStl(scad);
    stlPath = `requests/${opts.requestId}/part.stl`;
    await uploadOrThrow(supabase, stlPath, stl, "model/stl");
    dims = stlBoundsMm(stl).map((n) => Math.round(n * 10) / 10) as [
      number,
      number,
      number,
    ];
  }

  return { scad_path: scadPath, stl_path: stlPath, design_notes: notes, dimensions_mm: dims };
}

function extractScad(text: string): string | null {
  const m = text.match(/```(?:scad|openscad)?\s*([\s\S]*?)```/);
  return m && /module|cube|cylinder|difference|union/.test(m[1]) ? m[1].trim() : null;
}

async function renderScadToStl(scad: string): Promise<Buffer> {
  const dir = await mkdtemp(path.join(tmpdir(), "pf-scad-"));
  try {
    const scadFile = path.join(dir, "part.scad");
    const stlFile = path.join(dir, "part.stl");
    await writeFile(scadFile, scad);
    await execFileAsync(
      process.env.OPENSCAD_PATH!,
      ["-o", stlFile, "--export-format", "binstl", scadFile],
      { timeout: 300_000 }
    );
    return await readFile(stlFile);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function uploadOrThrow(
  supabase: ReturnType<typeof createAdminClient>,
  storagePath: string,
  data: Buffer,
  contentType: string
) {
  const { error } = await supabase.storage
    .from("models")
    .upload(storagePath, data, { contentType, upsert: true });
  if (error) throw new Error(`storage upload failed (${storagePath}): ${error.message}`);
}
