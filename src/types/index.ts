export interface Activity {
  id?: number
  questName: string
  domain: 'learning' | 'wellbeing' | 'finance' | 'social' | 'misc'
  difficulty: 1 | 2 | 3 | 4 | 5
  durationMinutes: number
  outcome: 'completed' | 'partial' | 'failed'
  isBoss: boolean
  date: string
  timestamp: string
  finalXP: number
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
