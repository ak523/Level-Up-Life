import type { Activity, GameMeta } from '../types'

/** baseXP = durationMinutes × difficulty */
export function calculateBaseXP(durationMinutes: number, difficulty: number): number {
  return durationMinutes * difficulty
}

/** Apply all multipliers in order to produce finalXP */
export function calculateFinalXP(
  activity: Pick<Activity, 'difficulty' | 'durationMinutes' | 'outcome' | 'isBoss' | 'domain'>,
  meta: Pick<GameMeta, 'expectedDifficulty' | 'streakDays'>
): number {
  const baseXP = calculateBaseXP(activity.durationMinutes, activity.difficulty)

  if (activity.domain === 'bad_habit') {
    return -Math.round(baseXP)
  }

  const difficultyRatio = activity.difficulty / meta.expectedDifficulty
  const outcomeMult: Record<Activity['outcome'], number> = {
    completed: 1.0,
    partial: 0.5,
    failed: 0.0,
  }
  const streakMult = 1 + Math.min(0.05 * meta.streakDays, 0.5)
  const bossMult = activity.isBoss ? 3.0 : 1.0
  let finalXP = baseXP * difficultyRatio * outcomeMult[activity.outcome] * streakMult * bossMult
  if (activity.outcome === 'failed') {
    finalXP = Math.max(0, finalXP - 5)
  }
  return Math.round(finalXP)
}

/** Domain → attribute delta mapping */
export function calculateAttributeDeltas(
  domain: Activity['domain'],
  xpGained: number
): Partial<GameMeta['attributes']> {
  const base = Math.max(1, Math.round(xpGained / 20))
  switch (domain) {
    case 'learning':
      return { INT: base, WIS: Math.ceil(base / 2) }
    case 'wellbeing':
      return { VIT: base, WIS: Math.ceil(base / 2) }
    case 'finance':
      return { GOLD: base, WIS: Math.ceil(base / 2) }
    case 'social':
      return { CHA: base }
    case 'misc':
      return {
        INT: Math.ceil(base / 4),
        WIS: Math.ceil(base / 4),
        CHA: Math.ceil(base / 4),
        VIT: Math.ceil(base / 4),
      }
    case 'bad_habit': {
      const penalty = Math.max(1, Math.round(Math.abs(xpGained) / 20))
      return { VIT: -penalty, WIS: -Math.ceil(penalty / 2) }
    }
    default:
      return {}
  }
}

/** requiredXP = 500 × level^1.5 */
export function computeRequiredXPForLevel(level: number): number {
  return Math.round(500 * Math.pow(level, 1.5))
}

/** Determine new expectedDifficulty based on recent success rate */
export function evaluateGoldilocksAdjustment(
  recentOutcomes: GameMeta['recentOutcomes'],
  currentExpected: number
): number {
  if (recentOutcomes.length === 0) return currentExpected
  const successRate = recentOutcomes.filter((o) => o.success).length / recentOutcomes.length
  if (successRate > 0.8) return Math.min(5.0, currentExpected + 0.5)
  if (successRate < 0.4) return Math.max(1.0, currentExpected - 0.5)
  return currentExpected
}

/** 15% chance of critical success */
export function rollForCriticalSuccess(): boolean {
  return Math.random() < 0.15
}

/** Compute what level a player is at given total XP */
export function computeLevelFromXP(totalXP: number): number {
  let level = 1
  while (totalXP >= computeRequiredXPForLevel(level)) {
    totalXP -= computeRequiredXPForLevel(level)
    level++
  }
  return level
}

/** Random XP interval for gold milestone (300–400 inclusive) */
export function randomGoldInterval(): number {
  return 300 + Math.floor(Math.random() * 101)
}

/** Calculate XP from a treasury expense (amount × 0.1, capped at 50) */
export function calculateTreasuryXP(amount: number, statAffinity: string): number {
  if (statAffinity === 'neutral') return 0
  return Math.min(50, Math.round(amount * 0.1))
}

/** Map stat affinity to attribute deltas for treasury expenses */
export function calculateTreasuryAttributeDeltas(
  statAffinity: string,
  xpGained: number
): Partial<GameMeta['attributes']> {
  if (xpGained <= 0) return {}
  switch (statAffinity) {
    case 'VIT':
      return { VIT: Math.max(1, Math.round(xpGained / 20)) }
    case 'INT':
      return { INT: Math.max(1, Math.round(xpGained / 20)) }
    case 'CHA':
      return { CHA: Math.max(1, Math.round(xpGained / 20)) }
    case 'WIS':
      return { WIS: Math.max(1, Math.round(xpGained / 20)) }
    default:
      return {}
  }
}

/** XP progress within current level */
export function computeXPProgress(
  totalXP: number,
  level: number
): { currentXP: number; requiredXP: number; percentage: number } {
  let remaining = totalXP
  for (let l = 1; l < level; l++) {
    remaining -= computeRequiredXPForLevel(l)
  }
  const requiredXP = computeRequiredXPForLevel(level)
  const currentXP = Math.max(0, remaining)
  return {
    currentXP,
    requiredXP,
    percentage: Math.min(100, Math.round((currentXP / requiredXP) * 100)),
  }
}
