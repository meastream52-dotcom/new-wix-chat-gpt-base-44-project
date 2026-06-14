import { createHmac, createHash, randomBytes } from 'crypto'

/**
 * Generate a new random server seed and its SHA-256 hash.
 * The hash is shown to the player upfront; the raw seed is kept secret until revealed.
 */
export function generateServerSeed(): { seed: string; hashedSeed: string } {
  const seed = randomBytes(32).toString('hex')
  const hashedSeed = hashSeed(seed)
  return { seed, hashedSeed }
}

export function hashSeed(seed: string): string {
  return createHash('sha256').update(seed).digest('hex')
}

/**
 * Core RNG: returns a float in [0, 1) deterministically from the three inputs.
 * All game outcomes derive from this single function.
 */
export function getRngFloat(serverSeed: string, clientSeed: string, nonce: number): number {
  const message = `${clientSeed}:${nonce}`
  const hmac = createHmac('sha256', serverSeed).update(message).digest('hex')
  // Take the first 8 hex chars (32 bits) and normalize to [0, 1)
  const value = parseInt(hmac.slice(0, 8), 16)
  return value / 0x100000000
}

/**
 * Verify that a revealed server seed matches its previously published hash.
 */
export function verifySeed(revealedSeed: string, publishedHash: string): boolean {
  return hashSeed(revealedSeed) === publishedHash
}
