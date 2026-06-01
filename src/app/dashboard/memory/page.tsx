import { EmptyState } from "@/components/ui/EmptyState";
import { IconMemory } from "@/components/dashboard/icons";

export const metadata = { title: "Platform — Memory" };

export default function MemoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#e6edf3]">Memory</h1>
        <p className="mt-0.5 text-sm text-muted">Vector stores, conversation history, and knowledge bases.</p>
      </div>
      <EmptyState
        icon={<span className="w-6 h-6 text-muted"><IconMemory /></span>}
        title="No memory stores yet"
        description="Connect a vector database or enable conversation memory inside a project."
      />
    </div>
  );
}
