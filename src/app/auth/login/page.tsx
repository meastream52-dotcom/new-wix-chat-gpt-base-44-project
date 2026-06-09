"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@automateos.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-[#58a6ff] text-2xl">⚙</span>
            <span className="font-bold text-[#e6edf3] text-xl">AutomateOS</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Sign in</h1>
          <p className="text-[#8b949e] text-sm mt-1">Welcome back to your AI workforce</p>
        </div>

        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
          {/* Demo credentials hint */}
          <div className="bg-[#58a6ff]/5 border border-[#58a6ff]/20 rounded-md p-3 mb-4 text-xs text-[#58a6ff]">
            Demo: demo@automateos.com / demo1234
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0f1117] border border-[#21262d] rounded-md px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-[#f85149] text-xs text-center bg-[#f85149]/5 border border-[#f85149]/20 rounded-md py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#58a6ff] text-[#0f1117] font-semibold py-2.5 rounded-md hover:bg-[#79c0ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#8b949e] mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-[#58a6ff] hover:text-[#79c0ff] transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
