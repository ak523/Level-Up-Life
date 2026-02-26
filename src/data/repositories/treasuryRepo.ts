import { db } from '../db'
import type { Transaction, Budget } from '../../types'

export async function addTransaction(transaction: Transaction): Promise<number> {
  return db.treasury.add(transaction)
}

export async function getTransactions(limit = 50): Promise<Transaction[]> {
  return db.treasury.orderBy('timestamp').reverse().limit(limit).toArray()
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return db.treasury.orderBy('timestamp').reverse().toArray()
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.treasury.delete(id)
}

export async function addBudget(budget: Budget): Promise<number> {
  return db.budgets.add(budget)
}

export async function getBudgets(month: string): Promise<Budget[]> {
  return db.budgets.where('month').equals(month).toArray()
}

export async function updateBudget(id: number, updates: Partial<Budget>): Promise<void> {
  await db.budgets.update(id, updates)
}

export async function deleteBudget(id: number): Promise<void> {
  await db.budgets.delete(id)
}

/** Get total spent per category for a given month */
export async function getMonthlySpending(month: string): Promise<Record<string, number>> {
  const transactions = await db.treasury
    .where('date')
    .between(month + '-01', month + '-31', true, true)
    .toArray()

  const spending: Record<string, number> = {}
  for (const t of transactions) {
    if (t.type === 'upkeep') {
      spending[t.category] = (spending[t.category] ?? 0) + t.amount
    }
  }
  return spending
}

/** Calculate net worth from all transactions */
export async function calculateNetWorth(): Promise<number> {
  const transactions = await db.treasury.toArray()
  return transactions.reduce((sum, t) => {
    return t.type === 'bounty' ? sum + t.amount : sum - t.amount
  }, 0)
}

/** Get average income transaction amount */
export async function getAverageIncome(): Promise<number> {
  const incomes = await db.treasury.where('type').equals('bounty').toArray()
  if (incomes.length === 0) return 0
  return incomes.reduce((sum, t) => sum + t.amount, 0) / incomes.length
}
