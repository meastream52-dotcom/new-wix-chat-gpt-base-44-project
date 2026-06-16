import { z } from "zod";
import { defineRoute, jsonOk } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { schoolService } from "@/server/services/school.service";

export const runtime = "nodejs";

const jsonBodySchema = z.object({ csv: z.string().min(1) });

/**
 * Bulk import schools from CSV. Accepts:
 *   - multipart/form-data with a `file` field,
 *   - application/json `{ "csv": "..." }`, or
 *   - a raw text/csv body.
 */
export const POST = defineRoute(
  async (req) => {
    const ctx = await requireRole("admin");
    const contentType = req.headers.get("content-type") ?? "";

    let csvText: string;
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        throw new ValidationError('Provide a CSV file in the "file" field');
      }
      csvText = await file.text();
    } else if (contentType.includes("application/json")) {
      const body = jsonBodySchema.parse(await req.json());
      csvText = body.csv;
    } else {
      csvText = await req.text();
    }

    if (!csvText.trim()) throw new ValidationError("Empty CSV payload");

    return jsonOk(await schoolService.importCsv(ctx, csvText));
  },
  { rateLimit: "heavy" }
);
