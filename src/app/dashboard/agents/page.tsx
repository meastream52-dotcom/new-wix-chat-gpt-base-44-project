import { EmptyState } from "@/components/ui/EmptyState";
import { IconAgents } from "@/components/dashboard/icons";

export const metadata = { title: "Platform — Agents" };

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#e6edf3]">Agents</h1>
        <p className="mt-0.5 text-sm text-muted">Design and manage AI agents.</p>
      </div>
      <EmptyState
        icon={<span className="w-6 h-6 text-muted"><IconAgents /></span>}
        title="No agents yet"
        description="Agents will appear here once you create a project and add agent definitions."
      />
    </div>
  );
}
