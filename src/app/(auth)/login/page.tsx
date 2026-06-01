"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push(from);
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: from });
  }

  return (
    <div className="w-full max-w-sm">
      {/* Brand */}
      <div className="mb-8 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#58a6ff]/15 border border-[#58a6ff]/25 mb-4">
          <span className="font-mono text-sm font-bold text-[#58a6ff]">P</span>
        </span>
        <h1 className="text-xl font-semibold text-[#e6edf3]">Sign in to Platform</h1>
        <p className="mt-1 text-sm text-[#8b949e]">Welcome back</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[#21262d] bg-[#161b22] p-6 shadow-xl shadow-black/30">

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          className={clsx(
            "w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium",
            "border border-[#30363d] bg-[#0f1117] text-[#e6edf3]",
            "hover:bg-[#21262d] transition-colors",
          )}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#21262d]" />
          <span className="text-xs text-[#8b949e]">or</span>
          <div className="flex-1 h-px bg-[#21262d]" />
        </div>

        {/* Credentials form */}
        <form onSubmit={handleCredentials} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-[#e6edf3]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-medium text-[#e6edf3]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#58a6ff] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={clsx(
                "w-full rounded-lg border border-[#21262d] bg-[#0f1117] px-3 py-2",
                "text-sm text-[#e6edf3] placeholder:text-[#8b949e]",
                "outline-none transition-colors focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/30",
              )}
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-5 text-center text-sm text-[#8b949e]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#58a6ff] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
