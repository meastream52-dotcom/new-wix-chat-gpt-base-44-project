import { db } from "@/lib/db";
import Link from "next/link";
import { ArtifactViewer } from "@/components/asc/ArtifactViewer";
import type { AscArtifactRecord, AscArtifactType } from "@/lib/asc-types";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ArtifactsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let project;
  try {
    project = await db.ascProject.findUnique({
      where: { id },
      include: { artifacts: { orderBy: { createdAt: "asc" } } },
    });
  } catch {
    return (
      <div className="p-8 text-sm text-yellow-400 border border-yellow-500/20 rounded-xl m-8">
        Database not connected. Run <code className="font-mono">npx prisma db push</code> first.
      </div>
    );
  }

  if (!project) notFound();

  const artifacts: AscArtifactRecord[] = project.artifacts.map((a: typeof project.artifacts[0]) => ({
    ...a,
    type: a.type as AscArtifactType,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div className="p-8 max-w-6xl mx-auto h-screen flex flex-col">
      <div className="mb-6">
        <Link href={`/projects/${id}`} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          ← {project.name}
        </Link>
        <h1 className="text-xl font-bold text-white mt-2">Generated Artifacts</h1>
        <p className="text-sm text-gray-500 mt-1">{artifacts.length} files produced by AI agents</p>
      </div>

      <div className="flex-1 min-h-0">
        <ArtifactViewer artifacts={artifacts} />
      </div>
    </div>
  );
}
