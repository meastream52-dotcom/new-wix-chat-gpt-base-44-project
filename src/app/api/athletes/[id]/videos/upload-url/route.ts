import { defineRoute, jsonOk, parseJson } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { videoService } from "@/server/services/video.service";
import { uploadUrlSchema } from "@/validators/video";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

// Issue a signed direct-to-Storage upload URL for a video file.
export const POST = defineRoute<Ctx>(
  async (req, { params }) => {
    const ctx = await requireAuth();
    const { id } = await params;
    const input = await parseJson(req, uploadUrlSchema);
    return jsonOk(await videoService.createUploadUrl(ctx, id, input));
  },
  { rateLimit: "write" }
);
