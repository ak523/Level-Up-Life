import { db } from '../db'
import type { ScheduledTask } from '../../types'

export async function addScheduledTask(task: Omit<ScheduledTask, 'id'>): Promise<number> {
  return db.scheduledTasks.add(task as ScheduledTask)
}

export async function getScheduledTasks(): Promise<ScheduledTask[]> {
  return db.scheduledTasks
    .where('status')
    .anyOf('upcoming', 'active')
    .toArray()
}

export async function getArchivedScheduledTasks(): Promise<ScheduledTask[]> {
  return db.scheduledTasks
    .where('status')
    .anyOf('completed', 'archived')
    .toArray()
}

export async function updateScheduledTaskStatus(
  id: number,
  status: ScheduledTask['status']
): Promise<void> {
  await db.scheduledTasks.update(id, { status })
}

export async function deleteScheduledTask(id: number): Promise<void> {
  await db.scheduledTasks.delete(id)
}

/**
 * Archive scheduled tasks whose questName matches a completed activity.
 * One-way sync: activity log completion → scheduling log archival.
 */
export async function syncOnCompletion(questName: string): Promise<void> {
  const matching = await db.scheduledTasks
    .where('status')
    .anyOf('upcoming', 'active')
    .filter((t) => t.questName.toLowerCase() === questName.toLowerCase())
    .toArray()

  await Promise.all(
    matching.map((t) => db.scheduledTasks.update(t.id!, { status: 'archived' }))
  )
}

/**
 * Promote upcoming tasks to active if their startDate has arrived.
 */
export async function promoteUpcomingTasks(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const upcoming = await db.scheduledTasks
    .where('status')
    .equals('upcoming')
    .filter((t) => t.startDate <= today)
    .toArray()

  await Promise.all(
    upcoming.map((t) => db.scheduledTasks.update(t.id!, { status: 'active' }))
  )
}
