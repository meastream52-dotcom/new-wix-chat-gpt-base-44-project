"use client";

import { useState } from "react";

type Result = {
  verdict: "printable" | "needs_splitting" | "rejected";
  reason: string;
  ip_warning: string | null;
};

export default function RequestPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          prompt: form.get("prompt"),
          intended_use: {
            environment: form.get("environment"),
            heat_exposure: form.get("heat_exposure") === "on",
            flex_needed: form.get("flex_needed") === "on",
            food_contact: form.get("food_contact") === "on",
            cosmetic_only: form.get("cosmetic_only") === "on",
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "submission failed");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card">
          {result.verdict === "rejected" ? (
            <>
              <h1 className="text-xl font-bold text-red-700">
                We can&apos;t print this one
              </h1>
              <p className="mt-2 text-sm text-ink-600">{result.reason}</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-forge-700">Request received ✓</h1>
              <p className="mt-2 text-sm text-ink-600">
                {result.verdict === "needs_splitting"
                  ? "This part is larger than our print bed, so we'll design it as multiple pieces with joinery. "
                  : ""}
                Our team will review the feasibility check and email you a quote
                with three material/finish tiers.
              </p>
              {result.ip_warning && (
                <p className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
                  {result.ip_warning}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Request a custom part</h1>
      <p className="mt-2 text-sm text-ink-600">
        Describe the part — what it is, what it fits, anything you know about
        size. Photos of references help; mention model years, brands, part
        numbers if you have them.
      </p>

      <form onSubmit={onSubmit} className="card mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="prompt">What do you need?</label>
          <textarea
            id="prompt"
            name="prompt"
            required
            minLength={10}
            rows={5}
            className="input"
            placeholder='e.g. "Dashboard bezel for a 1970 Chevelle, the one with the round gauges"'
          />
        </div>
        <div>
          <label className="label" htmlFor="environment">Where will it live?</label>
          <select id="environment" name="environment" className="input">
            <option value="indoor">Indoors</option>
            <option value="outdoor">Outdoors / direct sun</option>
          </select>
        </div>
        <fieldset className="space-y-2 text-sm">
          <legend className="label">Check any that apply</legend>
          {(
            [
              ["heat_exposure", "Exposed to heat (engine bay, dishwasher, hot car)"],
              ["flex_needed", "Needs to flex or seal"],
              ["food_contact", "Touches food or drink"],
              ["cosmetic_only", "Purely cosmetic (no mechanical function)"],
            ] as const
          ).map(([name, label]) => (
            <label key={name} className="flex items-center gap-2">
              <input type="checkbox" name={name} className="h-4 w-4" />
              {label}
            </label>
          ))}
        </fieldset>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Checking feasibility… (~30s)" : "Submit request"}
        </button>
        <p className="text-xs text-ink-400">
          We don&apos;t print structural, load-bearing, or safety-critical parts
          (suspension, brakes, helmets, child seats, firearm parts, medical
          implants). Branded reproductions are personal-use only.
        </p>
      </form>
    </div>
  );
}
