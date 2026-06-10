'use client'

import { useState } from 'react'
import type { ProductTier } from '@/lib/types'

interface Props {
  tiers: ProductTier[]
  onSelect: (tier: ProductTier) => void
}

const TIER_META = {
  premium: { label: 'Premium', description: 'Best material + sanding/finishing', color: 'amber' },
  standard: { label: 'Standard', description: 'Solid material match, great quality', color: 'blue' },
  budget: { label: 'Budget', description: 'Most affordable option', color: 'gray' },
} as const

export function TierSelector({ tiers, onSelect }: Props) {
  const available = tiers.filter(t => t.is_available)
  const [selected, setSelected] = useState<ProductTier | null>(
    available.find(t => t.tier === 'standard') ?? available[0] ?? null
  )

  function select(tier: ProductTier) {
    setSelected(tier)
    onSelect(tier)
  }

  return (
    <div className="space-y-3">
      {(['premium', 'standard', 'budget'] as const).map(tierName => {
        const tier = tiers.find(t => t.tier === tierName)
        const meta = TIER_META[tierName]
        const isSelected = selected?.tier === tierName

        if (!tier) return null

        return (
          <button
            key={tierName}
            disabled={!tier.is_available}
            onClick={() => tier.is_available && select(tier)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              !tier.is_available
                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                : isSelected
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-900">{meta.label}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {tier.material?.display_name}
                </span>
                {!tier.is_available && (
                  <span className="ml-2 text-xs text-red-500">Unavailable</span>
                )}
              </div>
              <span className="font-bold text-gray-900">${tier.price_usd.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{meta.description}</p>
            <div className="mt-2 flex gap-3 text-xs text-gray-400">
              <span>{tier.print_time_hours.toFixed(1)}h print</span>
              <span>{tier.filament_grams.toFixed(0)}g filament</span>
              {tier.layer_height_mm && <span>{tier.layer_height_mm}mm layers</span>}
            </div>
          </button>
        )
      })}
    </div>
  )
}
