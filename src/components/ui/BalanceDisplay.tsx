// Balance display component — implemented in Prompt 3
'use client'

interface BalanceDisplayProps {
  balance?: number
}

export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
    <span className="font-mono font-semibold" style={{ color: 'var(--accent-glow)' }}>
      {balance !== undefined ? balance.toLocaleString() : '—'} coins
    </span>
  )
}
