import { create } from 'zustand'
import type { GameMeta, Activity, FeedbackResult, ScheduledTask } from '../types'
import { getGameMeta, updateGameMeta } from '../data/repositories/gameMetaRepo'
import { getRecentActivities, addActivity } from '../data/repositories/activityRepo'
import {
  getScheduledTasks,
  addScheduledTask,
  updateScheduledTaskStatus,
  deleteScheduledTask,
  syncOnCompletion,
  promoteUpcomingTasks,
} from '../data/repositories/scheduledTaskRepo'
import {
  calculateFinalXP,
  calculateAttributeDeltas,
  evaluateGoldilocksAdjustment,
  rollForCriticalSuccess,
  computeLevelFromXP,
} from '../lib/rpg-math'

interface GameStore {
  meta: GameMeta | null
  recentActivities: Activity[]
  scheduledTasks: ScheduledTask[]
  loading: boolean
  loadData: () => Promise<void>
  submitActivity: (
    activity: Omit<Activity, 'finalXP' | 'date' | 'timestamp'>
  ) => Promise<FeedbackResult>
  buyStreakFreeze: () => Promise<boolean>
  addScheduledTask: (task: Omit<ScheduledTask, 'id' | 'status' | 'createdAt'>) => Promise<void>
  completeScheduledTask: (id: number) => Promise<void>
  removeScheduledTask: (id: number) => Promise<void>
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

export const useGameStore = create<GameStore>((set, get) => ({
  meta: null,
  recentActivities: [],
  scheduledTasks: [],
  loading: false,

  loadData: async () => {
    set({ loading: true })
    await promoteUpcomingTasks()
    const [meta, recentActivities, scheduledTasks] = await Promise.all([
      getGameMeta(),
      getRecentActivities(),
      getScheduledTasks(),
    ])
    set({ meta, recentActivities, scheduledTasks, loading: false })
  },

  submitActivity: async (activityInput) => {
    const meta = get().meta!
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    let finalXP = calculateFinalXP(activityInput, meta)
    const isBadHabit = activityInput.domain === 'bad_habit'
    const isCritical = isBadHabit ? false : rollForCriticalSuccess()
    if (isCritical) finalXP = finalXP * 2

    const activity: Activity = {
      ...activityInput,
      date: today,
      timestamp: now.toISOString(),
      finalXP,
    }

    await addActivity(activity)

    // Sync: archive matching scheduled tasks when activity is completed
    if (activityInput.outcome === 'completed') {
      await syncOnCompletion(activityInput.questName)
    }
    const attrDeltas = calculateAttributeDeltas(activityInput.domain, finalXP)
    const goldBonus = isCritical ? 15 : 0

    const newAttrs = { ...meta.attributes }
    for (const [key, val] of Object.entries(attrDeltas)) {
      newAttrs[key as keyof typeof newAttrs] = Math.max(0, newAttrs[key as keyof typeof newAttrs] + (val ?? 0))
    }
    newAttrs.GOLD = Math.max(0, newAttrs.GOLD + goldBonus)

    let streakDays = meta.streakDays
    let recentOutcomes = meta.recentOutcomes
    let newExpectedDifficulty = meta.expectedDifficulty

    if (!isBadHabit) {
      const lastDate = meta.lastActivityDate
      if (lastDate === null) {
        streakDays = 1
      } else {
        const last = new Date(lastDate)
        const diff = Math.floor((now.getTime() - last.getTime()) / MS_PER_DAY)
        if (diff === 0) {
          // Same day, streak unchanged
        } else if (diff === 1) {
          streakDays += 1
        } else {
          streakDays = 1
        }
      }

      const newOutcome = {
        date: today,
        difficulty: activityInput.difficulty,
        success: activityInput.outcome === 'completed',
      }
      recentOutcomes = [...meta.recentOutcomes, newOutcome].slice(-30)
      newExpectedDifficulty = evaluateGoldilocksAdjustment(recentOutcomes, meta.expectedDifficulty)
    }

    const newTotalXP = Math.max(0, meta.totalXP + finalXP)
    const newLevel = computeLevelFromXP(newTotalXP)
    const leveledUp = newLevel > meta.currentLevel

    const newMeta: GameMeta = {
      ...meta,
      totalXP: newTotalXP,
      currentLevel: newLevel,
      attributes: newAttrs,
      streakDays,
      lastActivityDate: isBadHabit ? meta.lastActivityDate : today,
      expectedDifficulty: newExpectedDifficulty,
      recentOutcomes,
      criticalSuccessCount: meta.criticalSuccessCount + (isCritical ? 1 : 0),
    }

    await updateGameMeta(newMeta)

    const baseXP = activityInput.durationMinutes * activityInput.difficulty
    const result: FeedbackResult = {
      finalXP,
      baseXP,
      attributeDeltas: { ...attrDeltas, GOLD: (attrDeltas.GOLD ?? 0) + goldBonus },
      isCritical,
      leveledUp,
      newLevel,
      goldilocksAdjustment: newExpectedDifficulty,
    }

    set({ meta: newMeta })
    await get().loadData()

    return result
  },

  buyStreakFreeze: async () => {
    const meta = get().meta!
    const FREEZE_COST = 50
    if (meta.attributes.GOLD < FREEZE_COST) return false

    const newAttrs = { ...meta.attributes, GOLD: meta.attributes.GOLD - FREEZE_COST }
    const newMeta = {
      ...meta,
      attributes: newAttrs,
      streakFreezeCount: meta.streakFreezeCount + 1,
    }
    await updateGameMeta(newMeta)
    set({ meta: newMeta })
    return true
  },

  addScheduledTask: async (task) => {
    await addScheduledTask({
      ...task,
      status: task.startDate <= new Date().toISOString().split('T')[0] ? 'active' : 'upcoming',
      createdAt: new Date().toISOString(),
    })
    const scheduledTasks = await getScheduledTasks()
    set({ scheduledTasks })
  },

  completeScheduledTask: async (id) => {
    await updateScheduledTaskStatus(id, 'archived')
    const scheduledTasks = await getScheduledTasks()
    set({ scheduledTasks })
  },

  removeScheduledTask: async (id) => {
    await deleteScheduledTask(id)
    const scheduledTasks = await getScheduledTasks()
    set({ scheduledTasks })
  },
}))
