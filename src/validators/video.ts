import { z } from "zod";
import { paginationSchema, uuidSchema, videoTypeEnum } from "./common";

export const videoMimeEnum = z.enum(["video/mp4", "video/quicktime", "video/webm"]);

export const uploadUrlSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  content_type: videoMimeEnum,
  size_bytes: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024 * 1024) // 5 GiB, matches storage bucket limit
    .optional(),
});

export const createVideoSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(2000).optional(),
    video_type: videoTypeEnum.optional(),
    sport_id: uuidSchema.optional(),
    storage_path: z.string().trim().max(500).optional(),
    external_url: z.string().url().max(500).optional(),
    thumbnail_url: z.string().url().max(500).optional(),
    duration_seconds: z.number().int().min(0).max(86_400).optional(),
    is_public: z.boolean().optional(),
  })
  .refine((v) => Boolean(v.storage_path) || Boolean(v.external_url), {
    message: "Provide storage_path (after upload) or external_url",
    path: ["storage_path"],
  });

export const listVideosQuerySchema = paginationSchema.extend({
  status: z.enum(["uploading", "processing", "ready", "failed", "archived"]).optional(),
});

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
export type CreateVideoInput = z.infer<typeof createVideoSchema>;
