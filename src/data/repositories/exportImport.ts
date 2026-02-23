import { db } from '../db'
import type { Activity, GameMeta, ScheduledTask } from '../../types'

interface ExportData {
  version: 1 | 2
  exportedAt: string
  gameMeta: GameMeta
  activities: Activity[]
  scheduledTasks?: ScheduledTask[]
}

export async function exportData(): Promise<string> {
  const [activities, metaRows, scheduledTasks] = await Promise.all([
    db.activities.toArray(),
    db.gameMeta.toArray(),
    db.scheduledTasks.toArray(),
  ])
  const gameMeta = metaRows[0] ?? null
  const payload: ExportData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    gameMeta: gameMeta as GameMeta,
    activities,
    scheduledTasks,
  }
  return JSON.stringify(payload, null, 2)
}

export async function importData(json: string): Promise<void> {
  const data: ExportData = JSON.parse(json)
  if (data.version !== 1 && data.version !== 2) throw new Error('Unsupported export version')
  if (!data.gameMeta || !Array.isArray(data.activities)) {
    throw new Error('Invalid export format')
  }
  await db.transaction('rw', db.activities, db.gameMeta, db.scheduledTasks, async () => {
    await db.activities.clear()
    await db.gameMeta.clear()
    await db.scheduledTasks.clear()
    await db.gameMeta.put({ ...data.gameMeta, id: 1 })
    if (data.activities.length > 0) {
      await db.activities.bulkAdd(data.activities.map(({ id: _id, ...a }) => a))
    }
    if (data.scheduledTasks && data.scheduledTasks.length > 0) {
      await db.scheduledTasks.bulkAdd(data.scheduledTasks.map(({ id: _id, ...t }) => t))
    }
  })
}
