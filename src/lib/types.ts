export type GameType = 'dice' | 'limbo' | 'plinko' | 'mines' | 'crash'
export type LedgerType = 'bonus' | 'bet' | 'payout'

export interface Profile {
  id: string
  user_id: string
  username: string
  created_at: string
}

export interface Wallet {
  id: string
  user_id: string
  cached_balance: number
  updated_at: string
}

export interface LedgerEntry {
  id: string
  user_id: string
  amount: number
  type: LedgerType
  game_round_id: string | null
  balance_after: number
  created_at: string
}

export interface ServerSeed {
  id: string
  user_id: string
  hashed_seed: string
  seed: string | null  // null until revealed
  active: boolean
  created_at: string
}

export interface GameRound {
  id: string
  user_id: string
  game: GameType
  bet_amount: number
  client_seed: string
  server_seed_id: string
  nonce: number
  outcome: number         // raw 0–1 float from RNG
  payout: number
  created_at: string
}

// API request/response shapes

export interface PlaceBetRequest {
  betAmount: number
  clientSeed: string
  [key: string]: unknown  // game-specific params
}

export interface BetResult {
  roundId: string
  outcome: number
  payout: number
  newBalance: number
  serverSeedHash: string
  clientSeed: string
  nonce: number
  won: boolean
}

export interface DiceBetRequest extends PlaceBetRequest {
  target: number          // 0–99
  direction: 'over' | 'under'
}

export interface LimboBetRequest extends PlaceBetRequest {
  targetMultiplier: number
}

export interface PlinkoDropRequest extends PlaceBetRequest {
  rows: number            // 8, 12, or 16
  risk: 'low' | 'medium' | 'high'
}

export interface MinesBetRequest extends PlaceBetRequest {
  mineCount: number       // 1–24
}

export interface MinesRevealRequest {
  roundId: string
  tileIndex: number
}

export interface CrashBetRequest extends PlaceBetRequest {
  autoCashoutAt: number | null
}
