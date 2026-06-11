import { createAdminClient } from "@/lib/supabase/admin";
import { PipelineActions } from "@/components/PipelineActions";
import type { IntakeVerdict } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  submitted: "bg-ink-100 text-ink-600",
  intake_review: "bg-amber-100 text-amber-800",
  design: "bg-blue-100 text-blue-800",
  pricing: "bg-purple-100 text-purple-800",
  listing: "bg-teal-100 text-teal-800",
  published: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-ink-100 text-ink-600",
};

export default async function AdminRequestsPage() {
  const supabase = createAdminClient();
  const { data: requests } = await supabase
    .from("custom_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Custom request pipeline</h1>
      {!requests?.length && <p className="text-ink-400">No requests yet.</p>}
      {requests?.map((r) => {
        const verdict = r.intake_verdict as IntakeVerdict | null;
        return (
          <div key={r.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`badge ${STATUS_BADGE[r.status] ?? ""}`}>
                    {r.status.replaceAll("_", " ")}
                  </span>
                  <span className="text-xs text-ink-400">
                    {r.customer_email} · {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 font-medium">{r.raw_prompt}</p>
                {verdict && (
                  <div className="mt-2 space-y-1 text-sm text-ink-600">
                    <p>
                      <span className="font-medium">Intake:</span> {verdict.verdict} — {verdict.reason}
                    </p>
                    {verdict.safety_flags?.length > 0 && (
                      <p className="text-red-700">⚠ Safety: {verdict.safety_flags.join(", ")}</p>
                    )}
                    {verdict.ip_flags?.length > 0 && (
                      <p className="text-amber-700">
                        © IP: {verdict.ip_flags.join(", ")} (personal use only — no catalog listing)
                      </p>
                    )}
                    {verdict.estimated_dimensions_mm && (
                      <p>Est. size: {verdict.estimated_dimensions_mm.join(" × ")} mm</p>
                    )}
                    {verdict.split_plan && <p>Split plan: {verdict.split_plan}</p>}
                  </div>
                )}
                {r.rejection_reason && r.status === "rejected" && (
                  <p className="mt-2 text-sm text-red-700">{r.rejection_reason}</p>
                )}
              </div>
              <PipelineActions requestId={r.id} status={r.status} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
