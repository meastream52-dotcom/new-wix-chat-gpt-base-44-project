import { prisma } from "@/lib/prisma";

export function baseSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 80) || "post"
  );
}

/** Unique post slug with a short random suffix on collision. */
export async function slugify(title: string): Promise<string> {
  const base = baseSlug(title);
  const existing = await prisma.post.findUnique({ where: { slug: base } });
  if (!existing) return base;
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
