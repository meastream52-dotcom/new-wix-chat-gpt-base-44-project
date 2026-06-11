import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { EditorForm } from "@/components/EditorForm";

export const dynamic = "force-dynamic";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { edit } = await searchParams;
  let post = null;
  if (edit) {
    post = await prisma.post.findUnique({ where: { id: edit } });
    if (!post || (post.authorId !== user.id && user.role !== "ADMIN")) redirect("/write");
  }

  return (
    <EditorForm
      post={
        post
          ? {
              id: post.id,
              title: post.title,
              contentMarkdown: post.contentMarkdown,
              excerpt: post.excerpt,
              coverImage: post.coverImage,
              status: post.status,
            }
          : undefined
      }
    />
  );
}
