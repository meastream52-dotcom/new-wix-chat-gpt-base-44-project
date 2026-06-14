import { getRngFloat } from '../provably-fair'

export interface DiceOutcome {
  roll: number       // 0–99.99
  won: boolean
  multiplier: number
  payout: number
}

export function rollDice(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  betAmount: number,
  target: number,
  direction: 'over' | 'under'
): DiceOutcome {
  const float = getRngFloat(serverSeed, clientSeed, nonce)
  const roll = parseFloat((float * 100).toFixed(2))

  const won = direction === 'over' ? roll > target : roll < target
  const winChance = direction === 'over' ? (99 - target) / 100 : target / 100
  // House edge: 1%
  const multiplier = won ? parseFloat((0.99 / winChance).toFixed(4)) : 0
  const payout = won ? parseFloat((betAmount * multiplier).toFixed(2)) : 0

  return { roll, won, multiplier, payout }
}
