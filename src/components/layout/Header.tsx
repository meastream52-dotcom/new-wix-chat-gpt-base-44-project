// Header with balance display and theme switcher — implemented in Prompt 3 & 6
'use client'

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <span className="text-lg font-bold" style={{ color: 'var(--accent-glow)' }}>Casino</span>
      <div className="flex items-center gap-4">
        <span style={{ color: 'var(--text-secondary)' }}>Balance: — coins</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Theme switcher in Prompt 6</span>
      </div>
    </header>
  )
}
