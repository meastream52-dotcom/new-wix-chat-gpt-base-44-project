import { getRngFloat } from '../provably-fair'

export interface LimboOutcome {
  result: number     // the random multiplier that came up
  won: boolean
  payout: number
}

export function rollLimbo(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  betAmount: number,
  targetMultiplier: number
): LimboOutcome {
  const float = getRngFloat(serverSeed, clientSeed, nonce)
  // Inverse transform: result = 0.99 / float (clamped at 1.0x minimum)
  const result = parseFloat(Math.max(1, 0.99 / float).toFixed(2))
  const won = result >= targetMultiplier
  const payout = won ? parseFloat((betAmount * targetMultiplier).toFixed(2)) : 0
  return { result, won, payout }
}
