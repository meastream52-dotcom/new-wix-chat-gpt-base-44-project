import { getRngFloat } from '../provably-fair'

// Placeholder — full implementation in Prompt 8
export function dropPlinko(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  betAmount: number,
  rows: number,
  risk: 'low' | 'medium' | 'high'
): { bucketIndex: number; multiplier: number; payout: number } {
  const float = getRngFloat(serverSeed, clientSeed, nonce)
  // Simplified: returns a bucket index 0–rows
  const bucketIndex = Math.floor(float * (rows + 1))
  return { bucketIndex, multiplier: 1, payout: betAmount }
}
