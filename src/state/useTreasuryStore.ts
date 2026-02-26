import { create } from 'zustand'
import type { Transaction, Budget, GameMeta } from '../types'
import {
  addTransaction as addTransactionRepo,
  getTransactions,
  deleteTransaction as deleteTransactionRepo,
  addBudget as addBudgetRepo,
  getBudgets,
  updateBudget as updateBudgetRepo,
  deleteBudget as deleteBudgetRepo,
  getMonthlySpending,
  calculateNetWorth,
  getAverageIncome,
} from '../data/repositories/treasuryRepo'
import { updateGameMeta } from '../data/repositories/gameMetaRepo'
import { calculateTreasuryXP, calculateTreasuryAttributeDeltas } from '../lib/rpg-math'

interface TreasuryStore {
  transactions: Transaction[]
  budgets: Budget[]
  monthlySpending: Record<string, number>
  netWorth: number
  averageIncome: number
  currentMonth: string
  loading: boolean
  loadTreasury: () => Promise<void>
  addTransaction: (
    transaction: Omit<Transaction, 'id' | 'timestamp' | 'xpAwarded'>,
    meta: GameMeta
  ) => Promise<{ xpAwarded: number; isWhaleBonus: boolean; vaultGold: number }>
  removeTransaction: (id: number) => Promise<void>
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>
  updateBudget: (id: number, updates: Partial<Budget>) => Promise<void>
  removeBudget: (id: number) => Promise<void>
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export const useTreasuryStore = create<TreasuryStore>((set, get) => ({
  transactions: [],
  budgets: [],
  monthlySpending: {},
  netWorth: 0,
  averageIncome: 0,
  currentMonth: getCurrentMonth(),
  loading: false,

  loadTreasury: async () => {
    set({ loading: true })
    const month = getCurrentMonth()
    const [transactions, budgets, monthlySpending, netWorth, averageIncome] = await Promise.all([
      getTransactions(),
      getBudgets(month),
      getMonthlySpending(month),
      calculateNetWorth(),
      getAverageIncome(),
    ])
    set({ transactions, budgets, monthlySpending, netWorth, averageIncome, currentMonth: month, loading: false })
  },

  addTransaction: async (input, meta) => {
    const now = new Date()
    let xpAwarded = 0
    let isWhaleBonus = false

    if (input.type === 'upkeep') {
      xpAwarded = calculateTreasuryXP(input.amount, input.statAffinity)
    }

    // Whale bonus: income larger than average triggers 2x XP
    if (input.type === 'bounty') {
      const avg = get().averageIncome
      if (avg > 0 && input.amount > avg) {
        isWhaleBonus = true
      }
    }

    const transaction: Transaction = {
      ...input,
      timestamp: now.toISOString(),
      xpAwarded,
    }

    await addTransactionRepo(transaction)

    // Apply XP and attribute deltas to game meta if expense with stat affinity
    if (xpAwarded > 0 && meta) {
      const attrDeltas = calculateTreasuryAttributeDeltas(input.statAffinity, xpAwarded)
      const newAttrs = { ...meta.attributes }
      for (const [key, val] of Object.entries(attrDeltas)) {
        newAttrs[key as keyof typeof newAttrs] = Math.max(0, newAttrs[key as keyof typeof newAttrs] + (val ?? 0))
      }
      const newTotalXP = Math.max(0, meta.totalXP + xpAwarded)
      await updateGameMeta({ totalXP: newTotalXP, attributes: newAttrs })
    }

    // Convert income to vault gold based on exchange rate
    const exchangeRate = meta.treasurySettings?.exchangeRate ?? 10
    let vaultGold = 0
    if (input.type === 'bounty') {
      vaultGold = Math.floor(input.amount / exchangeRate)
    }

    await get().loadTreasury()
    return { xpAwarded, isWhaleBonus, vaultGold }
  },

  removeTransaction: async (id) => {
    await deleteTransactionRepo(id)
    await get().loadTreasury()
  },

  addBudget: async (budget) => {
    await addBudgetRepo(budget)
    await get().loadTreasury()
  },

  updateBudget: async (id, updates) => {
    await updateBudgetRepo(id, updates)
    await get().loadTreasury()
  },

  removeBudget: async (id) => {
    await deleteBudgetRepo(id)
    await get().loadTreasury()
  },
}))
