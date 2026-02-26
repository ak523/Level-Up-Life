import Dexie, { type Table } from 'dexie'
import type { Activity, GameMeta, ScheduledTask, Transaction, Budget } from '../types'
import { randomGoldInterval } from '../lib/rpg-math'

const DEFAULT_GAME_META: GameMeta = {
  currentLevel: 1,
  totalXP: 0,
  attributes: { INT: 0, WIS: 0, CHA: 0, VIT: 0, GOLD: 0 },
  streakDays: 0,
  streakFreezeCount: 0,
  lastActivityDate: null,
  expectedDifficulty: 2,
  recentOutcomes: [],
  criticalSuccessCount: 0,
  nextGoldMilestone: randomGoldInterval(),
  treasurySettings: {
    currencySymbol: '$',
    privacyMode: false,
    exchangeRate: 10,
  },
}

export class LevelUpLifeDB extends Dexie {
  activities!: Table<Activity, number>
  gameMeta!: Table<GameMeta & { id: number }, number>
  scheduledTasks!: Table<ScheduledTask, number>
  treasury!: Table<Transaction, number>
  budgets!: Table<Budget, number>

  constructor() {
    super('LevelUpLifeDB')
    this.version(1).stores({
      activities: '++id, domain, date, timestamp',
      gameMeta: 'id',
    })
    this.version(2).stores({
      activities: '++id, domain, date, timestamp',
      gameMeta: 'id',
      scheduledTasks: '++id, questName, status, startDate, expectedCompletionDate',
    })
    this.version(3).stores({
      activities: '++id, domain, date, timestamp',
      gameMeta: 'id',
      scheduledTasks: '++id, questName, status, startDate, expectedCompletionDate',
      treasury: '++id, type, category, date, timestamp',
      budgets: '++id, category, month',
    })
  }
}

export const db = new LevelUpLifeDB()

/** Ensure gameMeta singleton exists */
export async function ensureGameMeta(): Promise<GameMeta> {
  const existing = await db.gameMeta.get(1)
  if (!existing) {
    await db.gameMeta.put({ ...DEFAULT_GAME_META, id: 1 })
    return DEFAULT_GAME_META
  }
  return existing
}
