import { describe, it, expect } from 'vitest'
import {
  calculateBaseXP,
  calculateFinalXP,
  calculateAttributeDeltas,
  computeRequiredXPForLevel,
  evaluateGoldilocksAdjustment,
  rollForCriticalSuccess,
  computeLevelFromXP,
  computeXPProgress,
  randomGoldInterval,
} from './rpg-math'

describe('calculateBaseXP', () => {
  it('multiplies duration by difficulty', () => {
    expect(calculateBaseXP(30, 2)).toBe(60)
    expect(calculateBaseXP(60, 5)).toBe(300)
    expect(calculateBaseXP(10, 1)).toBe(10)
  })
})

describe('calculateFinalXP', () => {
  const baseMeta = { expectedDifficulty: 2, streakDays: 0 }

  it('completed with no streak yields correct XP', () => {
    const xp = calculateFinalXP(
      { difficulty: 2, durationMinutes: 30, outcome: 'completed', isBoss: false, domain: 'learning' },
      baseMeta
    )
    expect(xp).toBe(60)
  })

  it('partial yields 50% XP', () => {
    const xp = calculateFinalXP(
      { difficulty: 2, durationMinutes: 30, outcome: 'partial', isBoss: false, domain: 'learning' },
      baseMeta
    )
    expect(xp).toBe(30)
  })

  it('failed yields 0 XP minus 5 penalty (max 0)', () => {
    const xp = calculateFinalXP(
      { difficulty: 2, durationMinutes: 30, outcome: 'failed', isBoss: false, domain: 'learning' },
      baseMeta
    )
    expect(xp).toBe(0)
  })

  it('boss quest triples XP', () => {
    const xp = calculateFinalXP(
      { difficulty: 2, durationMinutes: 30, outcome: 'completed', isBoss: true, domain: 'learning' },
      baseMeta
    )
    expect(xp).toBe(180)
  })

  it('streak adds bonus', () => {
    const xp = calculateFinalXP(
      { difficulty: 2, durationMinutes: 30, outcome: 'completed', isBoss: false, domain: 'learning' },
      { expectedDifficulty: 2, streakDays: 10 }
    )
    expect(xp).toBe(90)
  })

  it('streak bonus caps at 50%', () => {
    const xp = calculateFinalXP(
      { difficulty: 2, durationMinutes: 30, outcome: 'completed', isBoss: false, domain: 'learning' },
      { expectedDifficulty: 2, streakDays: 100 }
    )
    expect(xp).toBe(90)
  })

  it('bad_habit returns negative XP equal to baseXP', () => {
    const xp = calculateFinalXP(
      { difficulty: 3, durationMinutes: 20, outcome: 'completed', isBoss: false, domain: 'bad_habit' },
      baseMeta
    )
    expect(xp).toBe(-60)
  })

  it('bad_habit ignores outcome, streak, and boss multipliers', () => {
    const xp = calculateFinalXP(
      { difficulty: 2, durationMinutes: 30, outcome: 'completed', isBoss: true, domain: 'bad_habit' },
      { expectedDifficulty: 2, streakDays: 10 }
    )
    expect(xp).toBe(-60)
  })
})

describe('calculateAttributeDeltas', () => {
  it('learning gives INT and WIS', () => {
    const deltas = calculateAttributeDeltas('learning', 100)
    expect(deltas.INT).toBeGreaterThan(0)
    expect(deltas.WIS).toBeGreaterThan(0)
    expect(deltas.CHA).toBeUndefined()
  })

  it('social gives CHA only', () => {
    const deltas = calculateAttributeDeltas('social', 100)
    expect(deltas.CHA).toBeGreaterThan(0)
    expect(deltas.INT).toBeUndefined()
  })

  it('misc gives all small deltas', () => {
    const deltas = calculateAttributeDeltas('misc', 100)
    expect(deltas.INT).toBeGreaterThan(0)
    expect(deltas.WIS).toBeGreaterThan(0)
    expect(deltas.CHA).toBeGreaterThan(0)
    expect(deltas.VIT).toBeGreaterThan(0)
  })

  it('bad_habit gives negative VIT and WIS', () => {
    const deltas = calculateAttributeDeltas('bad_habit', -60)
    expect(deltas.VIT).toBeLessThan(0)
    expect(deltas.WIS).toBeLessThan(0)
  })
})

describe('computeRequiredXPForLevel', () => {
  it('level 1 requires 500 XP', () => {
    expect(computeRequiredXPForLevel(1)).toBe(500)
  })

  it('scales with level^1.5', () => {
    expect(computeRequiredXPForLevel(2)).toBe(Math.round(500 * Math.pow(2, 1.5)))
    expect(computeRequiredXPForLevel(5)).toBe(Math.round(500 * Math.pow(5, 1.5)))
  })

  it('increases with each level', () => {
    expect(computeRequiredXPForLevel(2)).toBeGreaterThan(computeRequiredXPForLevel(1))
    expect(computeRequiredXPForLevel(10)).toBeGreaterThan(computeRequiredXPForLevel(5))
  })
})

describe('evaluateGoldilocksAdjustment', () => {
  it('increases difficulty when >80% success', () => {
    const outcomes = Array.from({ length: 10 }, (_, i) => ({
      date: '2024-01-01',
      difficulty: 2,
      success: i < 9,
    }))
    expect(evaluateGoldilocksAdjustment(outcomes, 2)).toBe(2.5)
  })

  it('decreases difficulty when <40% success', () => {
    const outcomes = Array.from({ length: 10 }, (_, i) => ({
      date: '2024-01-01',
      difficulty: 2,
      success: i < 3,
    }))
    expect(evaluateGoldilocksAdjustment(outcomes, 2)).toBe(1.5)
  })

  it('keeps difficulty unchanged when between 40-80%', () => {
    const outcomes = Array.from({ length: 10 }, (_, i) => ({
      date: '2024-01-01',
      difficulty: 2,
      success: i < 6,
    }))
    expect(evaluateGoldilocksAdjustment(outcomes, 2)).toBe(2)
  })

  it('clamps at max 5.0', () => {
    const outcomes = Array.from({ length: 10 }, () => ({
      date: '2024-01-01',
      difficulty: 5,
      success: true,
    }))
    expect(evaluateGoldilocksAdjustment(outcomes, 5.0)).toBe(5.0)
  })

  it('clamps at min 1.0', () => {
    const outcomes = Array.from({ length: 10 }, () => ({
      date: '2024-01-01',
      difficulty: 1,
      success: false,
    }))
    expect(evaluateGoldilocksAdjustment(outcomes, 1.0)).toBe(1.0)
  })

  it('returns unchanged for empty outcomes', () => {
    expect(evaluateGoldilocksAdjustment([], 3)).toBe(3)
  })
})

describe('rollForCriticalSuccess', () => {
  it('returns a boolean', () => {
    expect(typeof rollForCriticalSuccess()).toBe('boolean')
  })

  it('returns true about 15% of the time over many rolls', () => {
    const ROLLS = 10000
    const trueCount = Array.from({ length: ROLLS }, () => rollForCriticalSuccess()).filter(Boolean).length
    const rate = trueCount / ROLLS
    expect(rate).toBeGreaterThan(0.08)
    expect(rate).toBeLessThan(0.22)
  })
})

describe('computeLevelFromXP', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(computeLevelFromXP(0)).toBe(1)
  })

  it('levels up after enough XP', () => {
    expect(computeLevelFromXP(500)).toBe(2)
  })
})

describe('computeXPProgress', () => {
  it('returns correct progress at start', () => {
    const { currentXP, percentage } = computeXPProgress(0, 1)
    expect(currentXP).toBe(0)
    expect(percentage).toBe(0)
  })

  it('clamps percentage to 100', () => {
    const { percentage } = computeXPProgress(500, 1)
    expect(percentage).toBe(100)
  })
})

describe('randomGoldInterval', () => {
  it('returns an integer between 300 and 400 inclusive', () => {
    for (let i = 0; i < 200; i++) {
      const interval = randomGoldInterval()
      expect(Number.isInteger(interval)).toBe(true)
      expect(interval).toBeGreaterThanOrEqual(300)
      expect(interval).toBeLessThanOrEqual(400)
    }
  })

  it('produces varying values over many calls', () => {
    const values = new Set(Array.from({ length: 500 }, () => randomGoldInterval()))
    expect(values.size).toBeGreaterThan(1)
  })
})
