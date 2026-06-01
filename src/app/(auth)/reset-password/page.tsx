"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";

const inputClass = clsx(
  "w-full rounded-lg border border-[#21262d] bg-[#0f1117] px-3 py-2",
  "text-sm text-[#e6edf3] placeholder:text-[#8b949e]",
  "outline-none transition-colors focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/30",
);

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  if (!token) {
    return (
      <p className="text-sm text-[#f85149] text-center">
        Invalid reset link. Please{" "}
        <Link href="/forgot-password" className="text-[#58a6ff] hover:underline">
          request a new one
        </Link>
        .
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  if (done) {
    return (
      <div className="text-center py-2">
        <div className="w-10 h-10 rounded-full bg-[#3fb950]/10 border border-[#3fb950]/20 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#3fb950]">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-sm text-[#e6edf3] font-medium">Password updated!</p>
        <p className="text-xs text-[#8b949e] mt-1">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium text-[#e6edf3]">
          New password <span className="text-[#f85149]">*</span>
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-xs font-medium text-[#e6edf3]">
          Confirm password <span className="text-[#f85149]">*</span>
        </label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-xs text-[#f85149] bg-[#f85149]/10 border border-[#f85149]/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={clsx(
          "w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
          "bg-[#58a6ff]/15 text-[#58a6ff] border border-[#58a6ff]/25",
          "hover:bg-[#58a6ff]/25 disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {loading ? "Updating password…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#58a6ff]/15 border border-[#58a6ff]/25 mb-4">
          <span className="font-mono text-sm font-bold text-[#58a6ff]">P</span>
        </span>
        <h1 className="text-xl font-semibold text-[#e6edf3]">Set a new password</h1>
        <p className="mt-1 text-sm text-[#8b949e]">Choose something strong</p>
      </div>

      <div className="rounded-2xl border border-[#21262d] bg-[#161b22] p-6 shadow-xl shadow-black/30">
        {/* Suspense required because useSearchParams() suspends during SSR */}
        <Suspense fallback={<p className="text-sm text-[#8b949e] text-center">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      <p className="mt-5 text-center text-sm text-[#8b949e]">
        <Link href="/login" className="text-[#58a6ff] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
