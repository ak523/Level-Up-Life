export interface Activity {
  id?: number
  questName: string
  domain: 'learning' | 'wellbeing' | 'finance' | 'social' | 'misc' | 'bad_habit'
  difficulty: 1 | 2 | 3 | 4 | 5
  durationMinutes: number
  outcome: 'completed' | 'partial' | 'failed'
  isBoss: boolean
  date: string
  timestamp: string
  finalXP: number
  mood?: 1 | 2 | 3 | 4 | 5
  energyLevel?: 1 | 2 | 3 | 4 | 5
  anxietyLevel?: 1 | 2 | 3 | 4 | 5
}

export interface ScheduledTask {
  id?: number
  questName: string
  domain: Activity['domain']
  startDate: string
  expectedCompletionDate: string
  status: 'upcoming' | 'active' | 'completed' | 'archived'
  createdAt: string
}

export type StatAffinity = 'VIT' | 'INT' | 'CHA' | 'WIS' | 'neutral'

export interface Transaction {
  id?: number
  type: 'bounty' | 'upkeep'
  description: string
  amount: number
  category: string
  statAffinity: StatAffinity
  date: string
  timestamp: string
  recurring: boolean
  xpAwarded: number
}

export interface Budget {
  id?: number
  category: string
  monthlyLimit: number
  month: string // YYYY-MM format
}

export interface TreasurySettings {
  currencySymbol: string
  privacyMode: boolean
  exchangeRate: number // real currency units per 1 in-game GOLD
}

export interface GameMeta {
  currentLevel: number
  totalXP: number
  attributes: {
    INT: number
    WIS: number
    CHA: number
    VIT: number
    GOLD: number
  }
  streakDays: number
  streakFreezeCount: number
  lastActivityDate: string | null
  expectedDifficulty: number
  recentOutcomes: Array<{
    date: string
    difficulty: number
    success: boolean
  }>
  criticalSuccessCount: number
  nextGoldMilestone: number
  treasurySettings?: TreasurySettings
}

export interface FeedbackResult {
  finalXP: number
  baseXP: number
  attributeDeltas: Partial<GameMeta['attributes']>
  isCritical: boolean
  leveledUp: boolean
  newLevel: number
  goldilocksAdjustment: number
}
