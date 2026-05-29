"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedPrompt = searchParams.get("prompt") ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/builder/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Account created but sign-in failed. Please sign in.");
    } else {
      router.push(savedPrompt ? `/dashboard?prompt=${encodeURIComponent(savedPrompt)}` : "/dashboard");
    }
  };

  return (
    <>
      {savedPrompt && (
        <div className="bg-[#58a6ff]/10 border border-[#58a6ff]/30 text-[#58a6ff] text-xs px-4 py-3 rounded-lg mb-6">
          Your project idea is saved — ready to build after signup
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-sm px-4 py-3 rounded-lg">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full bg-[#161b22] border border-[#21262d] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#58a6ff] transition-colors placeholder-[#4d5566]"
            placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full bg-[#161b22] border border-[#21262d] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#58a6ff] transition-colors placeholder-[#4d5566]"
            placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="w-full bg-[#161b22] border border-[#21262d] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#58a6ff] transition-colors placeholder-[#4d5566]"
            placeholder="Min 8 characters" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-[#58a6ff] hover:bg-[#79b8ff] disabled:bg-[#21262d] disabled:text-[#4d5566] text-[#0f1117] font-semibold py-2.5 rounded-lg text-sm transition-colors">
          {loading ? "Creating account..." : "Create free account"}
        </button>
        <p className="text-center text-xs text-[#4d5566]">By signing up you agree to our terms of service.</p>
      </form>
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Start building</h1>
        <p className="text-[#8b949e] text-sm">Create your free BuilderAI account</p>
      </div>
      <Suspense fallback={<div className="space-y-4 animate-pulse"><div className="h-10 bg-[#21262d] rounded-lg" /><div className="h-10 bg-[#21262d] rounded-lg" /><div className="h-10 bg-[#21262d] rounded-lg" /></div>}>
        <RegisterForm />
      </Suspense>
      <p className="text-center text-sm text-[#8b949e] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#58a6ff] hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
