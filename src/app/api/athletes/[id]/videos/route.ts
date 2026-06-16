import { defineRoute, jsonOk, parseJson, parseQuery } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { videoService } from "@/server/services/video.service";
import { createVideoSchema, listVideosQuerySchema } from "@/validators/video";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

// Record a video (after a direct Storage upload, or an external link).
export const POST = defineRoute<Ctx>(
  async (req, { params }) => {
    const ctx = await requireAuth();
    const { id } = await params;
    const input = await parseJson(req, createVideoSchema);
    return jsonOk(await videoService.createVideo(ctx, id, input), 201);
  },
  { rateLimit: "write" }
);

export const GET = defineRoute<Ctx>(
  async (req, { params }) => {
    const ctx = await requireAuth();
    const { id } = await params;
    const { status, limit, offset } = parseQuery(req, listVideosQuerySchema);
    return jsonOk(await videoService.listVideos(ctx, id, { status, limit, offset }));
  },
  { rateLimit: "read" }
);
