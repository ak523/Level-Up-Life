import { useEffect, useState } from 'react'
import { useTreasuryStore } from '../state/useTreasuryStore'
import { useGameStore } from '../state/useGameStore'
import { useUIStore } from '../state/useUIStore'
import { playChaChingSound, playCrumpleSound } from '../lib/soundEngine'
import { NeoCard, NeoButton, NeoInput, NeoProgressBar } from './neo'
import type { StatAffinity } from '../types'

type TreasuryView = 'ledger' | 'vault' | 'dashboard'

const STAT_AFFINITY_OPTIONS: { value: StatAffinity; label: string; emoji: string }[] = [
  { value: 'VIT', label: 'Health/Gym/Food', emoji: '💪' },
  { value: 'INT', label: 'Books/Courses', emoji: '📚' },
  { value: 'CHA', label: 'Social/Gifts', emoji: '🎉' },
  { value: 'WIS', label: 'Investments/Savings', emoji: '🧠' },
  { value: 'neutral', label: 'Luxury/Misc', emoji: '✨' },
]

const CATEGORY_PRESETS = ['Food', 'Transport', 'Entertainment', 'Education', 'Health', 'Rent', 'Utilities', 'Savings', 'Other']

export function Treasury() {
  const [view, setView] = useState<TreasuryView>('ledger')
  const { loadTreasury } = useTreasuryStore()

  useEffect(() => {
    loadTreasury()
  }, [loadTreasury])

  return (
    <div className="space-y-4">
      <NeoCard>
        <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
          <span>💰</span> The Treasury
        </h2>
        <div className="flex gap-2 mb-4">
          {(['ledger', 'vault', 'dashboard'] as const).map((v) => (
            <NeoButton
              key={v}
              variant={view === v ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setView(v)}
              className="flex-1"
            >
              {v === 'ledger' ? '📜 Ledger' : v === 'vault' ? '🛡️ Vault' : '📊 Stats'}
            </NeoButton>
          ))}
        </div>
      </NeoCard>

      {view === 'ledger' && <LedgerView />}
      {view === 'vault' && <VaultView />}
      {view === 'dashboard' && <DashboardView />}
    </div>
  )
}

function LedgerView() {
  const { transactions, addTransaction, removeTransaction } = useTreasuryStore()
  const { meta, loadData } = useGameStore()
  const { soundEnabled } = useUIStore()
  const [type, setType] = useState<'bounty' | 'upkeep'>('upkeep')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Other')
  const [statAffinity, setStatAffinity] = useState<StatAffinity>('neutral')
  const [recurring, setRecurring] = useState(false)
  const [message, setMessage] = useState('')

  const currencySymbol = meta?.treasurySettings?.currencySymbol ?? '$'
  const privacyMode = meta?.treasurySettings?.privacyMode ?? false

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount)
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) return
    if (!meta) return

    const result = await addTransaction(
      {
        type,
        description: description.trim(),
        amount: numAmount,
        category,
        statAffinity: type === 'bounty' ? 'neutral' : statAffinity,
        date: new Date().toISOString().split('T')[0],
        recurring,
      },
      meta
    )

    if (soundEnabled) {
      if (type === 'bounty') playChaChingSound()
      else playCrumpleSound()
    }

    let msg = type === 'bounty'
      ? `🎉 Bounty collected! +${currencySymbol}${numAmount.toFixed(2)}`
      : `📝 Upkeep logged: ${currencySymbol}${numAmount.toFixed(2)}`

    if (result.xpAwarded > 0) {
      msg += ` (+${result.xpAwarded} XP)`
    }
    if (result.isWhaleBonus) {
      msg += ' 🐋 Jackpot! Above average income!'
    }
    if (result.vaultGold > 0) {
      msg += ` (+${result.vaultGold} Vault Gold)`
    }

    setMessage(msg)
    setDescription('')
    setAmount('')
    setRecurring(false)
    await loadData()
    setTimeout(() => setMessage(''), 4000)
  }

  const formatAmount = (val: number) => {
    if (privacyMode) return '•••'
    return `${currencySymbol}${val.toFixed(2)}`
  }

  return (
    <>
      <NeoCard>
        <h3 className="font-bold uppercase text-lg mb-3 flex items-center gap-2">
          <span>📜</span> Log Transaction
        </h3>

        <div className="flex gap-2 mb-3">
          <NeoButton
            variant={type === 'bounty' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setType('bounty')}
            className="flex-1"
          >
            🏆 Bounty (Income)
          </NeoButton>
          <NeoButton
            variant={type === 'upkeep' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => setType('upkeep')}
            className="flex-1"
          >
            ⚔️ Upkeep (Expense)
          </NeoButton>
        </div>

        <div className="space-y-3">
          <NeoInput
            label="Description"
            placeholder={type === 'bounty' ? 'e.g. Freelance payment' : 'e.g. Grocery shopping'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <NeoInput
            label={`Amount (${currencySymbol})`}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div>
            <label className="block text-sm font-bold uppercase text-neo-black mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border-4 border-neo-black rounded-md px-3 py-2 text-neo-black focus:outline-none focus:shadow-neo-md transition-all duration-150"
            >
              {CATEGORY_PRESETS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {type === 'upkeep' && (
            <div>
              <label className="block text-sm font-bold uppercase text-neo-black mb-1">Stat Affinity</label>
              <div className="grid grid-cols-2 gap-2">
                {STAT_AFFINITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatAffinity(opt.value)}
                    className={`text-left px-3 py-2 border-4 border-neo-black rounded-md text-sm font-bold transition-all duration-150 ${
                      statAffinity === opt.value
                        ? 'bg-neo-gold shadow-neo'
                        : 'bg-white hover:bg-neutral-50'
                    }`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="w-5 h-5 border-4 border-neo-black rounded-sm"
            />
            <span className="text-sm font-bold uppercase text-neo-black">Monthly Recurring</span>
          </label>

          <NeoButton
            onClick={handleSubmit}
            variant="primary"
            size="md"
            className="w-full"
            disabled={!description.trim() || !amount || parseFloat(amount) <= 0}
          >
            {type === 'bounty' ? '💰 Collect Bounty' : '📝 Log Upkeep'}
          </NeoButton>

          {message && (
            <div className="text-sm text-center font-bold text-neo-black animate-slide-up">{message}</div>
          )}
        </div>
      </NeoCard>

      <NeoCard>
        <h3 className="font-bold uppercase text-lg mb-3 flex items-center gap-2">
          <span>📋</span> Recent Transactions
        </h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-neutral-500 font-bold text-center py-4">No transactions yet. Start logging!</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {transactions.slice(0, 20).map((t) => (
              <div
                key={t.id}
                className={`flex items-center justify-between px-3 py-2 border-4 border-neo-black rounded-md ${
                  t.type === 'bounty' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-neo-black truncate">
                    {t.type === 'bounty' ? '🏆' : '⚔️'} {t.description}
                  </div>
                  <div className="text-xs text-neutral-500 font-bold">
                    {t.category} · {t.date}
                    {t.recurring && ' · 🔄'}
                    {t.xpAwarded > 0 && ` · +${t.xpAwarded} XP`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold text-sm ${t.type === 'bounty' ? 'text-green-700' : 'text-red-700'}`}>
                    {t.type === 'bounty' ? '+' : '-'}{formatAmount(t.amount)}
                  </span>
                  <button
                    onClick={() => t.id && removeTransaction(t.id)}
                    className="text-neutral-400 hover:text-neo-accent text-lg font-bold"
                    aria-label={`Delete transaction: ${t.description}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </NeoCard>
    </>
  )
}

function VaultView() {
  const { budgets, monthlySpending, addBudget, removeBudget, currentMonth } = useTreasuryStore()
  const { meta } = useGameStore()
  const [newCategory, setNewCategory] = useState('')
  const [newLimit, setNewLimit] = useState('')

  const currencySymbol = meta?.treasurySettings?.currencySymbol ?? '$'
  const privacyMode = meta?.treasurySettings?.privacyMode ?? false

  const handleAddBudget = async () => {
    const limit = parseFloat(newLimit)
    if (!newCategory.trim() || isNaN(limit) || limit <= 0) return
    await addBudget({ category: newCategory.trim(), monthlyLimit: limit, month: currentMonth })
    setNewCategory('')
    setNewLimit('')
  }

  const getBudgetColor = (spent: number, limit: number): string => {
    const remaining = (limit - spent) / limit
    if (remaining <= 0.05) return '#EF4444' // Red - Critical
    if (remaining <= 0.25) return '#FB923C' // Yellow/Orange - Warning
    return '#22C55E' // Green - Safe
  }

  const getBudgetStatus = (spent: number, limit: number): string => {
    const remaining = (limit - spent) / limit
    if (remaining <= 0) return '💀 DEPLETED'
    if (remaining <= 0.05) return '🔴 CRITICAL'
    if (remaining <= 0.25) return '🟡 WARNING'
    return '🟢 SAFE'
  }

  return (
    <>
      <NeoCard>
        <h3 className="font-bold uppercase text-lg mb-3 flex items-center gap-2">
          <span>🛡️</span> Budget Shields
        </h3>

        {budgets.length === 0 ? (
          <p className="text-sm text-neutral-500 font-bold text-center py-4">No budgets set. Add one below!</p>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = monthlySpending[budget.category] ?? 0
              const percentage = Math.min(100, (spent / budget.monthlyLimit) * 100)
              const remaining = Math.max(0, budget.monthlyLimit - spent)
              const color = getBudgetColor(spent, budget.monthlyLimit)

              return (
                <div key={budget.id} className="bg-neo-bg border-4 border-neo-black rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold uppercase text-sm text-neo-black">{budget.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{getBudgetStatus(spent, budget.monthlyLimit)}</span>
                      <button
                        onClick={() => budget.id && removeBudget(budget.id)}
                        className="text-neutral-400 hover:text-neo-accent text-lg font-bold"
                        aria-label={`Delete budget: ${budget.category}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <NeoProgressBar
                    percentage={percentage}
                    color={color}
                    value={privacyMode
                      ? `${Math.round(percentage)}%`
                      : `${currencySymbol}${spent.toFixed(2)} / ${currencySymbol}${budget.monthlyLimit.toFixed(2)}`}
                  />
                  <div className="text-xs font-bold text-neutral-500 mt-1">
                    {privacyMode
                      ? `${Math.round(100 - percentage)}% remaining`
                      : `${currencySymbol}${remaining.toFixed(2)} remaining`}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </NeoCard>

      <NeoCard>
        <h3 className="font-bold uppercase text-lg mb-3 flex items-center gap-2">
          <span>➕</span> Add Budget
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold uppercase text-neo-black mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-white border-4 border-neo-black rounded-md px-3 py-2 text-neo-black focus:outline-none focus:shadow-neo-md transition-all duration-150"
            >
              <option value="">Select category...</option>
              {CATEGORY_PRESETS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <NeoInput
            label="Monthly Limit"
            type="number"
            min="1"
            step="1"
            placeholder="300"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
          />
          <NeoButton
            onClick={handleAddBudget}
            variant="primary"
            size="md"
            className="w-full"
            disabled={!newCategory.trim() || !newLimit || parseFloat(newLimit) <= 0}
          >
            🛡️ Set Budget Shield
          </NeoButton>
        </div>
      </NeoCard>
    </>
  )
}

function DashboardView() {
  const { transactions, netWorth } = useTreasuryStore()
  const { meta } = useGameStore()

  const currencySymbol = meta?.treasurySettings?.currencySymbol ?? '$'
  const privacyMode = meta?.treasurySettings?.privacyMode ?? false
  const exchangeRate = meta?.treasurySettings?.exchangeRate ?? 10

  // Calculate monthly income and expenses
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth))
  const monthIncome = monthTransactions.filter((t) => t.type === 'bounty').reduce((s, t) => s + t.amount, 0)
  const monthExpenses = monthTransactions.filter((t) => t.type === 'upkeep').reduce((s, t) => s + t.amount, 0)

  // Calculate burn rate (days of survival)
  const dailyBurn = monthExpenses > 0 ? monthExpenses / new Date().getDate() : 0
  const survivalDays = dailyBurn > 0 ? Math.floor(Math.max(0, netWorth) / dailyBurn) : Infinity

  // Expense breakdown by stat affinity
  const affinityBreakdown: Record<string, number> = {}
  for (const t of monthTransactions.filter((t) => t.type === 'upkeep')) {
    const key = t.statAffinity === 'neutral' ? 'Luxury/Misc' : t.statAffinity
    affinityBreakdown[key] = (affinityBreakdown[key] ?? 0) + t.amount
  }
  const totalExpenseAmount = Object.values(affinityBreakdown).reduce((s, v) => s + v, 0)

  // Vault Gold (cosmetic high score)
  const vaultGold = Math.floor(Math.max(0, netWorth) / exchangeRate)

  const formatVal = (val: number) => {
    if (privacyMode) return '•••'
    return `${currencySymbol}${val.toFixed(2)}`
  }

  return (
    <>
      <NeoCard>
        <h3 className="font-bold uppercase text-lg mb-3 flex items-center gap-2">
          <span>📊</span> Treasury Dashboard
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 border-4 border-neo-black rounded-md p-3 text-center">
            <div className="text-xs font-bold uppercase text-neutral-500">Net Worth</div>
            <div className={`text-xl font-bold ${netWorth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatVal(netWorth)}
            </div>
          </div>
          <div className="bg-neo-gold/30 border-4 border-neo-black rounded-md p-3 text-center">
            <div className="text-xs font-bold uppercase text-neutral-500">Vault Gold</div>
            <div className="text-xl font-bold text-neo-black">{vaultGold} 🪙</div>
          </div>
          <div className="bg-blue-50 border-4 border-neo-black rounded-md p-3 text-center">
            <div className="text-xs font-bold uppercase text-neutral-500">Month Income</div>
            <div className="text-xl font-bold text-blue-700">{formatVal(monthIncome)}</div>
          </div>
          <div className="bg-red-50 border-4 border-neo-black rounded-md p-3 text-center">
            <div className="text-xs font-bold uppercase text-neutral-500">Month Expenses</div>
            <div className="text-xl font-bold text-red-700">{formatVal(monthExpenses)}</div>
          </div>
        </div>
      </NeoCard>

      <NeoCard>
        <h3 className="font-bold uppercase text-lg mb-3 flex items-center gap-2">
          <span>⚔️</span> Burn Rate
        </h3>
        <div className="bg-neo-bg border-4 border-neo-black rounded-md p-4 text-center">
          <div className="text-3xl font-bold text-neo-black mb-1">
            {survivalDays === Infinity ? '∞' : survivalDays}
          </div>
          <div className="text-xs font-bold uppercase text-neutral-500">Survival Days Remaining</div>
          {dailyBurn > 0 && (
            <div className="text-xs font-bold text-neutral-400 mt-1">
              Daily burn: {formatVal(dailyBurn)}
            </div>
          )}
        </div>
      </NeoCard>

      {totalExpenseAmount > 0 && (
        <NeoCard>
          <h3 className="font-bold uppercase text-lg mb-3 flex items-center gap-2">
            <span>🎯</span> Expense Breakdown
          </h3>
          <div className="space-y-2">
            {Object.entries(affinityBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([key, val]) => {
                const pct = Math.round((val / totalExpenseAmount) * 100)
                const colorMap: Record<string, string> = {
                  VIT: '#22C55E',
                  INT: '#3B82F6',
                  CHA: '#EC4899',
                  WIS: '#A855F7',
                  'Luxury/Misc': '#FB923C',
                }
                return (
                  <NeoProgressBar
                    key={key}
                    percentage={pct}
                    color={colorMap[key] ?? '#999'}
                    label={key}
                    value={privacyMode ? `${pct}%` : `${formatVal(val)} (${pct}%)`}
                  />
                )
              })}
          </div>
        </NeoCard>
      )}
    </>
  )
}
