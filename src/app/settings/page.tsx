export default function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your ASC platform</p>
      </div>

      {/* API Keys */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">API Keys</h2>
        <div className="space-y-4">
          {[
            { label: "Anthropic API Key", key: "ANTHROPIC_API_KEY", hint: "Required for Claude agents" },
            { label: "OpenAI API Key", key: "OPENAI_API_KEY", hint: "Optional fallback model" },
            { label: "Database URL", key: "DATABASE_URL", hint: "PostgreSQL connection string" },
            { label: "Redis URL", key: "REDIS_URL", hint: "For job queue and caching" },
          ].map(({ label, key, hint }) => (
            <div key={key} className="p-4 rounded-xl border border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-200">{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{hint}</div>
                </div>
                <code className="text-xs font-mono text-indigo-400/70 bg-indigo-500/5 border border-indigo-500/20 px-2 py-1 rounded">
                  {key}
                </code>
              </div>
              <div className="text-xs text-gray-600 font-mono">
                Set in <code className="text-gray-500">.env</code> file
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Billing */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Pricing Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: "Starter",
              price: "$49/mo",
              features: ["5 projects/month", "MVP agents only", "Email support"],
              color: "border-gray-800",
            },
            {
              name: "Growth",
              price: "$199/mo",
              features: ["25 projects/month", "All 27 agents", "Priority support", "Custom domains"],
              color: "border-indigo-500/50",
              highlight: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              features: ["Unlimited projects", "White-label", "Dedicated infra", "SLA + SSO"],
              color: "border-gray-800",
            },
          ].map(({ name, price, features, color, highlight }) => (
            <div
              key={name}
              className={`p-5 rounded-xl border ${color} bg-gray-900 ${highlight ? "bg-indigo-500/5" : ""}`}
            >
              <div className="text-sm font-semibold text-gray-200 mb-1">{name}</div>
              <div className="text-2xl font-bold text-white font-mono mb-4">{price}</div>
              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              {highlight && (
                <div className="mt-4">
                  <span className="text-[10px] text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Model Configuration */}
      <section>
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Model Configuration</h2>
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900">
          <div className="text-xs text-gray-400 mb-3">
            Configure via environment variables in <code className="font-mono text-gray-300">.env</code>
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex gap-4">
              <span className="text-gray-600 w-40">ANTHROPIC_MODEL</span>
              <span className="text-gray-300">claude-sonnet-4-6 (default)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-600 w-40">OPENAI_MODEL</span>
              <span className="text-gray-300">gpt-4o (fallback)</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-2">Available Models</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Claude Sonnet 4.6", cost: "$3/$15 per 1M", badge: "Default", active: true },
                { name: "Claude Opus 4.8", cost: "$15/$75 per 1M", badge: "Premium", active: false },
                { name: "Claude Haiku 4.5", cost: "$0.25/$1.25 per 1M", badge: "Fast", active: false },
                { name: "GPT-4o", cost: "$5/$15 per 1M", badge: "Fallback", active: false },
              ].map(({ name, cost, badge, active }) => (
                <div
                  key={name}
                  className={`p-3 rounded-lg border text-xs ${active ? "border-indigo-500/40 bg-indigo-500/5" : "border-gray-800"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-300">{name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${active ? "text-indigo-400 bg-indigo-500/10" : "text-gray-600 bg-gray-800"}`}
                    >
                      {badge}
                    </span>
                  </div>
                  <div className="text-gray-600">{cost}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
