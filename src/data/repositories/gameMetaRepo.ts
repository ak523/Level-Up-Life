import { db, ensureGameMeta } from '../db'
import type { GameMeta } from '../../types'

const ROLLING_WINDOW = 30

export async function getGameMeta(): Promise<GameMeta> {
  return ensureGameMeta()
}

export async function updateGameMeta(updates: Partial<GameMeta>): Promise<void> {
  const current = await ensureGameMeta()
  const merged = { ...current, ...updates }
  if (merged.recentOutcomes.length > ROLLING_WINDOW) {
    merged.recentOutcomes = merged.recentOutcomes.slice(-ROLLING_WINDOW)
  }
  await db.gameMeta.put({ ...merged, id: 1 })
}

export async function spendGold(amount: number): Promise<boolean> {
  const meta = await ensureGameMeta()
  if (meta.attributes.GOLD < amount) return false
  await updateGameMeta({
    attributes: { ...meta.attributes, GOLD: meta.attributes.GOLD - amount },
  })
  return true
}
