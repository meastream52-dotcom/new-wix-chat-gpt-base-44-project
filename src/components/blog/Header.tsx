'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/blog/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []));

    fetch('/api/blog/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUser(d.user))
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/blog/auth/signout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-[#CC0000] text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold tracking-wider uppercase">CinemaRant</span>
            <span className="hidden md:inline opacity-75">Entertainment News &amp; Reviews</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/account" className="hover:underline">{user.name}</Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="hover:underline font-semibold">Admin</Link>
                )}
                <button onClick={handleSignOut} className="hover:underline">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/signin" className="hover:underline">Sign In</Link>
                <Link href="/signup" className="hover:underline font-semibold">Join Free</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-black text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-white">
              CINEMA<span className="text-[#CC0000]">RANT</span>
            </span>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-red-500"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Escape') setSearchOpen(false);
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
                <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-gray-300 hover:text-white transition-colors p-2"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </button>
            )}
            <Link
              href="/subscribe"
              className="bg-[#CC0000] hover:bg-red-700 text-white text-sm font-semibold px-4 py-1.5 rounded transition-colors"
            >
              Subscribe
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Category nav */}
      <nav className="bg-[#1a1a1a] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto scrollbar-hide gap-1 py-0">
            <Link
              href="/"
              className="whitespace-nowrap text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#CC0000] px-3 py-3 transition-colors flex-shrink-0"
            >
              Home
            </Link>
            {categories.slice(0, 14).map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="whitespace-nowrap text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#CC0000] px-3 py-3 transition-colors flex-shrink-0"
              >
                {cat.name}
              </Link>
            ))}
            {categories.length > 14 && (
              <div className="relative group flex-shrink-0">
                <button className="whitespace-nowrap text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#CC0000] px-3 py-3 transition-colors flex items-center gap-1">
                  More
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 bg-[#1a1a1a] border border-gray-700 min-w-40 z-50 hidden group-hover:block shadow-xl">
                  {categories.slice(14).map(cat => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#CC0000] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#111] border-b border-gray-700">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#CC0000] rounded" onClick={() => setMenuOpen(false)}>Home</Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#CC0000] rounded"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <div className="border-t border-gray-700 pt-2 mt-2">
              <Link href="/subscribe" className="block px-3 py-2 text-sm font-semibold text-[#CC0000]">Subscribe</Link>
              {user ? (
                <>
                  <Link href="/account" className="block px-3 py-2 text-sm text-gray-300" onClick={() => setMenuOpen(false)}>Account</Link>
                  <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-sm text-gray-300">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/signin" className="block px-3 py-2 text-sm text-gray-300" onClick={() => setMenuOpen(false)}>Sign In</Link>
                  <Link href="/signup" className="block px-3 py-2 text-sm text-gray-300" onClick={() => setMenuOpen(false)}>Join Free</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
