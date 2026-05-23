'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/blog/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sign up failed');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-gray-900">
            CINEMA<span className="text-[#CC0000]">RANT</span>
          </Link>
          <p className="text-gray-600 mt-2">Create your free account</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-black text-gray-900 mb-2">Join CinemaRant</h1>
          <p className="text-sm text-gray-500 mb-6">Get unlimited access to entertainment news and exclusive content.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CC0000] hover:bg-red-700 text-white font-bold py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-4 text-center">
            By signing up you agree to our{' '}
            <a href="/" className="text-[#CC0000] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/" className="text-[#CC0000] hover:underline">Privacy Policy</a>.
          </p>

          <div className="border-t border-gray-100 mt-6 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="text-[#CC0000] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Premium upsell */}
        <div className="mt-4 bg-gradient-to-r from-[#CC0000] to-red-800 rounded-lg p-5 text-white text-center">
          <p className="font-bold mb-1">Want even more?</p>
          <p className="text-sm text-red-100 mb-3">Subscribe to Premium for ad-free reading and exclusive content.</p>
          <Link
            href="/subscribe"
            className="inline-block bg-white text-[#CC0000] font-black text-sm px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            See Premium Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
