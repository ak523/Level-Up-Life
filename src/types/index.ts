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
