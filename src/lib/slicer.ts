import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const execFileAsync = promisify(execFile);

export type SliceEstimate = {
  filament_g: number;
  print_time_min: number;
  volume_cm3: number;
  source: "slicer_cli" | "geometric_estimate";
};

/**
 * Estimate filament use + print time for an STL.
 *
 * If SLICER_CLI is set (PrusaSlicer / OrcaSlicer binary), slice for real and
 * parse the gcode footer. Otherwise fall back to a geometric estimate from the
 * STL mesh volume — good enough for Phase 1 quoting; harden in Phase 2.
 */
export async function estimatePrint(
  stl: Buffer,
  densityGCm3: number
): Promise<SliceEstimate> {
  const volumeCm3 = stlVolumeCm3(stl);

  if (process.env.SLICER_CLI) {
    try {
      return await sliceWithCli(stl, densityGCm3, volumeCm3);
    } catch (err) {
      console.warn("slicer CLI failed, falling back to estimate:", err);
    }
  }

  // Geometric fallback: assume 20% infill + 2 perimeter shells ~= 35% of solid
  // volume, and an average effective deposition rate of ~10 cm3/h at 0.2mm.
  const effectiveVolume = volumeCm3 * 0.35;
  const filamentG = effectiveVolume * densityGCm3;
  const printTimeMin = Math.max(10, Math.round((effectiveVolume / 10) * 60));

  return {
    filament_g: Math.round(filamentG * 10) / 10,
    print_time_min: printTimeMin,
    volume_cm3: Math.round(volumeCm3 * 100) / 100,
    source: "geometric_estimate",
  };
}

async function sliceWithCli(
  stl: Buffer,
  densityGCm3: number,
  volumeCm3: number
): Promise<SliceEstimate> {
  const dir = await mkdtemp(path.join(tmpdir(), "pf-slice-"));
  try {
    const stlPath = path.join(dir, "part.stl");
    const gcodePath = path.join(dir, "part.gcode");
    await writeFile(stlPath, stl);
    await execFileAsync(
      process.env.SLICER_CLI!,
      ["--export-gcode", stlPath, "--output", gcodePath],
      { timeout: 180_000 }
    );
    const gcode = await readFile(gcodePath, "utf8");

    // PrusaSlicer/OrcaSlicer gcode footer comments
    const timeMatch = gcode.match(/estimated printing time.*?=\s*(.+)/i);
    const filamentMatch = gcode.match(/filament used \[g\]\s*=\s*([\d.]+)/i);
    if (!timeMatch || !filamentMatch) throw new Error("could not parse gcode footer");

    return {
      filament_g: parseFloat(filamentMatch[1]),
      print_time_min: parseDuration(timeMatch[1]),
      volume_cm3: Math.round(volumeCm3 * 100) / 100,
      source: "slicer_cli",
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function parseDuration(s: string): number {
  // e.g. "2h 41m 30s" or "41m 3s"
  const h = s.match(/(\d+)h/)?.[1] ?? "0";
  const m = s.match(/(\d+)m/)?.[1] ?? "0";
  return parseInt(h) * 60 + parseInt(m);
}

/** Signed-tetrahedron volume of a binary STL mesh, in cm3. */
export function stlVolumeCm3(stl: Buffer): number {
  if (stl.length < 84) throw new Error("not a valid binary STL");
  const triCount = stl.readUInt32LE(80);
  if (84 + triCount * 50 > stl.length) {
    throw new Error("STL appears to be ASCII or truncated; export binary STL");
  }
  let volMm3 = 0;
  for (let i = 0; i < triCount; i++) {
    const off = 84 + i * 50 + 12; // skip normal
    const v = (j: number) => stl.readFloatLE(off + j * 4);
    const [ax, ay, az, bx, by, bz, cx, cy, cz] = [
      v(0), v(1), v(2), v(3), v(4), v(5), v(6), v(7), v(8),
    ];
    volMm3 +=
      (ax * (by * cz - bz * cy) -
        ay * (bx * cz - bz * cx) +
        az * (bx * cy - by * cx)) /
      6;
  }
  return Math.abs(volMm3) / 1000;
}

/** Axis-aligned bounding box of a binary STL, in mm. */
export function stlBoundsMm(stl: Buffer): [number, number, number] {
  const triCount = stl.readUInt32LE(80);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < triCount; i++) {
    const off = 84 + i * 50 + 12;
    for (let p = 0; p < 3; p++) {
      for (let axis = 0; axis < 3; axis++) {
        const val = stl.readFloatLE(off + p * 12 + axis * 4);
        if (val < min[axis]) min[axis] = val;
        if (val > max[axis]) max[axis] = val;
      }
    }
  }
  return [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
}
