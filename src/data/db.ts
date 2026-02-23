import Dexie, { type Table } from 'dexie'
import type { Activity, GameMeta } from '../types'

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
}

export class LevelUpLifeDB extends Dexie {
  activities!: Table<Activity, number>
  gameMeta!: Table<GameMeta & { id: number }, number>

  constructor() {
    super('LevelUpLifeDB')
    this.version(1).stores({
      activities: '++id, domain, date, timestamp',
      gameMeta: 'id',
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
