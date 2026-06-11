import { createAdminClient } from "@/lib/supabase/admin";
import { CentsField, StockToggle } from "@/components/ConfigEditor";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const supabase = createAdminClient();
  const [{ data: printers }, { data: materials }] = await Promise.all([
    supabase.from("printer_profiles").select("*").order("created_at"),
    supabase.from("materials").select("*").order("name"),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-3 text-lg font-semibold">Printer profiles</h1>
        {printers?.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {p.name} {!p.active && <span className="badge bg-ink-100 text-ink-600">inactive</span>}
              </p>
              <p className="text-sm text-ink-600">
                Bed {p.build_x_mm} × {p.build_y_mm} × {p.build_z_mm} mm · {p.nozzle_mm}mm nozzle ·
                supports {p.materials_supported.join(", ")}
              </p>
            </div>
            <label className="text-sm text-ink-600">
              Hourly rate{" "}
              <CentsField kind="printer" id={p.id} field="hourly_rate_cents" cents={p.hourly_rate_cents} />
              /h
            </label>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Materials</h2>
        <div className="space-y-2">
          {materials?.map((m) => (
            <div key={m.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-ink-400">{JSON.stringify(m.properties)}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-ink-600">
                <label>
                  Cost{" "}
                  <CentsField kind="material" id={m.id} field="cost_per_kg_cents" cents={m.cost_per_kg_cents} />
                  /kg
                </label>
                <StockToggle id={m.id} inStock={m.in_stock} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-ink-400">
        Pricing formula (margin, labor, finishing costs) lives in{" "}
        <code>src/lib/pricing.ts</code>.
      </p>
    </div>
  );
}
