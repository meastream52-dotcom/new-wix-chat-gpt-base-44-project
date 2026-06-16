import { randomUUID } from "node:crypto";
import type { AuthContext } from "@/lib/auth";
import { UnprocessableError } from "@/lib/errors";
import { serverEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Tables, VideoStatus } from "@/lib/supabase/types";
import { VideoRepository } from "@/server/repositories/video.repository";
import type { CreateVideoInput, UploadUrlInput } from "@/validators/video";
import { assertManageAthlete } from "./access";
import { audit } from "./audit";

export interface UploadTarget {
  bucket: string;
  path: string;
  token: string;
  signed_url: string;
}

export const videoService = {
  /** Issue a direct-to-Storage signed upload URL (large files bypass the API). */
  async createUploadUrl(
    ctx: AuthContext,
    athleteProfileId: string,
    input: UploadUrlInput
  ): Promise<UploadTarget> {
    await assertManageAthlete(ctx, athleteProfileId);

    const bucket = serverEnv().SUPABASE_VIDEO_BUCKET;
    const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${athleteProfileId}/${randomUUID()}_${safeName}`;

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) {
      throw new UnprocessableError(error?.message ?? "Could not create upload URL");
    }

    return { bucket, path: data.path, token: data.token, signed_url: data.signedUrl };
  },

  async createVideo(
    ctx: AuthContext,
    athleteProfileId: string,
    input: CreateVideoInput
  ): Promise<Tables<"videos">> {
    await assertManageAthlete(ctx, athleteProfileId);

    const repo = new VideoRepository(ctx.supabase);
    const video = await repo.create({
      athlete_profile_id: athleteProfileId,
      title: input.title,
      description: input.description,
      video_type: input.video_type,
      sport_id: input.sport_id,
      storage_bucket: input.storage_path ? serverEnv().SUPABASE_VIDEO_BUCKET : null,
      storage_path: input.storage_path,
      external_url: input.external_url,
      thumbnail_url: input.thumbnail_url,
      duration_seconds: input.duration_seconds,
      is_public: input.is_public ?? false,
      status: "ready" satisfies VideoStatus,
    });

    await audit(ctx, "video.create", "videos", video.id);
    return video;
  },

  async listVideos(
    ctx: AuthContext,
    athleteProfileId: string,
    opts: { status?: VideoStatus; limit: number; offset: number }
  ): Promise<Tables<"videos">[]> {
    const repo = new VideoRepository(ctx.supabase);
    return repo.listByAthlete(athleteProfileId, opts);
  },
};
