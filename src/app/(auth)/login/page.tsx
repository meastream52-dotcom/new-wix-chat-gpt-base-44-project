"use client";
import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full bg-[#161b22] border border-[#21262d] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#58a6ff] transition-colors placeholder-[#4d5566]"
          placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full bg-[#161b22] border border-[#21262d] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#58a6ff] transition-colors placeholder-[#4d5566]"
          placeholder="••••••••" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-[#58a6ff] hover:bg-[#79b8ff] disabled:bg-[#21262d] disabled:text-[#4d5566] text-[#0f1117] font-semibold py-2.5 rounded-lg text-sm transition-colors">
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-[#8b949e] text-sm">Sign in to your BuilderAI account</p>
      </div>
      <Suspense fallback={<div className="space-y-4 animate-pulse"><div className="h-10 bg-[#21262d] rounded-lg" /><div className="h-10 bg-[#21262d] rounded-lg" /><div className="h-10 bg-[#21262d] rounded-lg" /></div>}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-[#8b949e] mt-6">
        No account?{" "}
        <Link href="/register" className="text-[#58a6ff] hover:underline">Create one free</Link>
      </p>
    </div>
  );
}
