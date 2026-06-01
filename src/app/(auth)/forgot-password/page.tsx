"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Always show success to prevent email enumeration.
    // The server handles the token generation + logging silently.
    await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="w-full max-w-sm">
      {/* Brand */}
      <div className="mb-8 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#58a6ff]/15 border border-[#58a6ff]/25 mb-4">
          <span className="font-mono text-sm font-bold text-[#58a6ff]">P</span>
        </span>
        <h1 className="text-xl font-semibold text-[#e6edf3]">Reset your password</h1>
        <p className="mt-1 text-sm text-[#8b949e]">
          We&apos;ll send a link to your email
        </p>
      </div>

      <div className="rounded-2xl border border-[#21262d] bg-[#161b22] p-6 shadow-xl shadow-black/30">
        {submitted ? (
          <div className="text-center py-2">
            <div className="w-10 h-10 rounded-full bg-[#3fb950]/10 border border-[#3fb950]/20 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#3fb950]">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-[#e6edf3] font-medium mb-1">Check your email</p>
            <p className="text-xs text-[#8b949e]">
              If an account exists for <strong className="text-[#e6edf3]">{email}</strong>, you&apos;ll receive a reset link shortly.
            </p>
            <p className="text-xs text-[#8b949e] mt-3">
              In development, check the server console for the reset URL.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-[#e6edf3]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={clsx(
                  "w-full rounded-lg border border-[#21262d] bg-[#0f1117] px-3 py-2",
                  "text-sm text-[#e6edf3] placeholder:text-[#8b949e]",
                  "outline-none transition-colors focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/30",
                )}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                "bg-[#58a6ff]/15 text-[#58a6ff] border border-[#58a6ff]/25",
                "hover:bg-[#58a6ff]/25 disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-[#8b949e]">
        <Link href="/login" className="text-[#58a6ff] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
