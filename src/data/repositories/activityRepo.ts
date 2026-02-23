import { db } from '../db'
import type { Activity } from '../../types'

export async function addActivity(activity: Activity): Promise<number> {
  return db.activities.add(activity)
}

export async function getRecentActivities(limit = 20): Promise<Activity[]> {
  return db.activities
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray()
}

export async function getAllActivities(): Promise<Activity[]> {
  return db.activities.orderBy('timestamp').reverse().toArray()
}

export async function clearAllActivities(): Promise<void> {
  await db.activities.clear()
}
