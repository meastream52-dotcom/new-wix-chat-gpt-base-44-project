import { IconSettings } from "@/components/dashboard/icons";

export const metadata = { title: "Platform — Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#e6edf3]">Settings</h1>
        <p className="mt-0.5 text-sm text-muted">Workspace configuration and integrations.</p>
      </div>

      {/* Placeholder settings sections */}
      <div className="space-y-4">
        {["API Keys", "Integrations", "Billing", "Team"].map((section) => (
          <div
            key={section}
            className="rounded-xl border border-border bg-panel p-5 flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium text-[#e6edf3]">{section}</div>
              <div className="text-xs text-muted mt-0.5">Not configured</div>
            </div>
            <span className="w-5 h-5 text-muted">
              <IconSettings />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
